import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, created, ok } from "@/lib/http";
import { requirePracticeStaff } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  email: z.string().email().max(200),
});

/** GET /api/clinic/invitations - members + pending invites for the signed-in org */
export async function GET() {
  const ctx = await requirePracticeStaff();
  if (!ctx) return badRequest("Practice account required");

  const supabase = await createSupabaseServerClient();
  const orgId = ctx.profile!.organisation_id;

  if (!orgId) {
    return ok({ members: [], invites: [] });
  }

  const [membersRes, invitesRes] = await Promise.all([
    supabase
      .from("organisation_members")
      .select("id, profile_id, membership_role, created_at, profiles(email, full_name)")
      .eq("organisation_id", orgId)
      .eq("status", "active"),
    supabase
      .from("organisation_members")
      .select("id, invited_email, invited_at, status")
      .eq("organisation_id", orgId)
      .eq("status", "invited")
      .order("invited_at", { ascending: false }),
  ]);

  return ok({
    members: membersRes.data ?? [],
    invites: invitesRes.data ?? [],
  });
}

/** POST /api/clinic/invitations - invite a teammate by email */
export async function POST(request: Request) {
  const ctx = await requirePracticeStaff();
  if (!ctx) return badRequest("Practice account required");

  const orgId = ctx.profile!.organisation_id;
  if (!orgId) {
    return badRequest("Add your practice first — it creates your organisation.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

  const email = parsed.data.email.trim().toLowerCase();
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profile) {
    const { data: existing } = await supabase
      .from("organisation_members")
      .select("id, status")
      .eq("organisation_id", orgId)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (existing && existing.status === "active") {
      return badRequest("That person is already a member of this practice.");
    }
  }

  const { data: pending } = await supabase
    .from("organisation_members")
    .select("id, status")
    .eq("organisation_id", orgId)
    .eq("invited_email", email)
    .eq("status", "invited")
    .maybeSingle();

  if (pending) {
    return badRequest("That person already has a pending invitation.");
  }

  const { data, error } = await supabase
    .from("organisation_members")
    .insert({
      organisation_id: orgId,
      profile_id: profile?.id ?? null,
      membership_role: "member",
      status: profile ? "active" : "invited",
      invited_email: email,
      invited_at: new Date().toISOString(),
      invited_by: ctx.user!.id,
    })
    .select("id, invited_email, status")
    .single();

  if (error) return badRequest("Could not send invitation", error.message);

  await logAudit(ctx.user!.id, "invitation.send", "organisation_members", data.id, {
    email,
  });

  return created({ invite: data });
}

/** DELETE /api/clinic/invitations?id=<member_row_id> - revoke invite / remove member */
export async function DELETE(request: Request) {
  const ctx = await requirePracticeStaff();
  if (!ctx) return badRequest("Practice account required");

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("id query param required");

  const supabase = await createSupabaseServerClient();
  const orgId = ctx.profile!.organisation_id;
  if (!orgId) return badRequest("No organisation");

  const { data: row } = await supabase
    .from("organisation_members")
    .select("id, profile_id, status, membership_role")
    .eq("id", id)
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (!row) return badRequest("Not found");
  if (row.membership_role === "owner") {
    return badRequest("The practice owner cannot be removed.");
  }

  const { error } = await supabase
    .from("organisation_members")
    .delete()
    .eq("id", id)
    .eq("organisation_id", orgId);

  if (error) return badRequest("Could not remove", error.message);

  await logAudit(ctx.user!.id, "invitation.revoke", "organisation_members", id);
  return ok({ deleted: true });
}
