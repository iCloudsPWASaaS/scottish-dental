import { z } from "zod";
import { randomBytes } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, created, forbidden, notFound, ok } from "@/lib/http";
import { invitationSchema } from "@/lib/validations";
import { requireOperator } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** GET /api/admin/invitations */
export async function GET() {
  const ctx = await requireOperator();
  if (!ctx) return forbidden("Operator access required");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("*, prospect:prospects(id, practice_name)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return badRequest("Could not load invitations", error.message);
  return ok({ invitations: data ?? [] });
}

/** POST /api/admin/invitations - issue an expiring, single-purpose invite */
export async function POST(request: Request) {
  const ctx = await requireOperator();
  if (!ctx) return forbidden("Operator access required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = invitationSchema
    .extend({ prospect_id: z.string().uuid().optional() })
    .safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  if (parsed.data.prospect_id) {
    const { data: prospect } = await supabase
      .from("prospects")
      .select("id, email:general_email, do_not_contact, opt_out")
      .eq("id", parsed.data.prospect_id)
      .maybeSingle();

    if (!prospect) return notFound("Prospect not found");
    if (prospect.do_not_contact || prospect.opt_out) {
      return badRequest("Prospect is suppressed");
    }
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(
    Date.now() + parsed.data.expires_in_days * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      prospect_id: parsed.data.prospect_id ?? null,
      email: parsed.data.email,
      token,
      expires_at: expiresAt,
      status: "pending",
      created_by: ctx.user!.id,
    })
    .select("*")
    .single();

  if (error) {
    return badRequest("Could not create invitation", error.message);
  }

  await logAudit(
    ctx.user!.id,
    "invitation.issue",
    "invitations",
    data.id,
    { email: parsed.data.email }
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return created({
    invitation: data,
    link: `${baseUrl}/signup?invite=${token}`,
  });
}
