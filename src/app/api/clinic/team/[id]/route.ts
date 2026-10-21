import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";
import { requirePracticeStaff } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  full_name: z.string().trim().min(2).max(160).optional(),
  gdc_number: z.string().trim().max(40).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  specialties: z.array(z.string().trim().max(80)).max(20).optional(),
});

async function ownsClinician(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  role: string,
  clinicianId: string
) {
  if (role === "admin" || role === "super_admin") return true;
  const { data: clinician } = await supabase
    .from("clinicians")
    .select("id, practice_location_id, practice_locations(organisation_id)")
    .eq("id", clinicianId)
    .maybeSingle();
  const location = Array.isArray(clinician?.practice_locations)
    ? clinician.practice_locations[0]
    : clinician?.practice_locations;
  const organisationId = (location as { organisation_id?: string } | null)?.organisation_id;
  const { data: profile } = await supabase
    .from("profiles")
    .select("organisation_id")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(organisationId) && organisationId === profile?.organisation_id;
}

/** PATCH /api/clinic/team/[id] */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await requirePracticeStaff();
  if (!ctx) return badRequest("Practice account required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

  const supabase = await createSupabaseServerClient();
  const allowed = await ownsClinician(supabase, ctx.user!.id, ctx.profile!.role, params.id);
  if (!allowed) return badRequest("Access denied");

  const { data, error } = await supabase
    .from("clinicians")
    .update(parsed.data)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return badRequest("Could not update team member", error.message);

  await logAudit(ctx.user!.id, "clinician.update", "clinicians", params.id);
  return ok({ clinician: data });
}

/** DELETE /api/clinic/team/[id] */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await requirePracticeStaff();
  if (!ctx) return badRequest("Practice account required");

  const supabase = await createSupabaseServerClient();
  const allowed = await ownsClinician(supabase, ctx.user!.id, ctx.profile!.role, params.id);
  if (!allowed) return badRequest("Access denied");

  const { error } = await supabase.from("clinicians").delete().eq("id", params.id);
  if (error) return badRequest("Could not remove team member", error.message);

  await logAudit(ctx.user!.id, "clinician.delete", "clinicians", params.id);
  return ok({ deleted: true });
}
