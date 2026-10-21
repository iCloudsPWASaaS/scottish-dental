import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, created, ok } from "@/lib/http";
import { requirePracticeStaff } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const clinicianSchema = z.object({
  practice_location_id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(160),
  gdc_number: z.string().trim().max(40).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  specialties: z.array(z.string().trim().max(80)).max(20).optional(),
});

async function ownsLocation(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  role: string,
  locationId: string
) {
  if (role === "admin" || role === "super_admin") return true;
  const { data: location } = await supabase
    .from("practice_locations")
    .select("organisation_id")
    .eq("id", locationId)
    .maybeSingle();
  const { data: profile } = await supabase
    .from("profiles")
    .select("organisation_id")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(location?.organisation_id) && location?.organisation_id === profile?.organisation_id;
}

/** GET /api/clinic/team?location=<id> */
export async function GET(request: Request) {
  const ctx = await requirePracticeStaff();
  if (!ctx) return badRequest("Practice account required");

  const locationId = new URL(request.url).searchParams.get("location");
  if (!locationId) return badRequest("location query param required");

  const supabase = await createSupabaseServerClient();
  const allowed = await ownsLocation(supabase, ctx.user!.id, ctx.profile!.role, locationId);
  if (!allowed) return badRequest("Access denied");

  const { data } = await supabase
    .from("clinicians")
    .select("*")
    .eq("practice_location_id", locationId)
    .order("full_name");

  return ok({ clinicians: data ?? [] });
}

/** POST /api/clinic/team - add a clinician */
export async function POST(request: Request) {
  const ctx = await requirePracticeStaff();
  if (!ctx) return badRequest("Practice account required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = clinicianSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

  const supabase = await createSupabaseServerClient();
  const allowed = await ownsLocation(
    supabase,
    ctx.user!.id,
    ctx.profile!.role,
    parsed.data.practice_location_id
  );
  if (!allowed) return badRequest("Access denied");

  const { data, error } = await supabase
    .from("clinicians")
    .insert({
      practice_location_id: parsed.data.practice_location_id,
      full_name: parsed.data.full_name,
      gdc_number: parsed.data.gdc_number || null,
      bio: parsed.data.bio || null,
      specialties: parsed.data.specialties ?? [],
    })
    .select("*")
    .single();

  if (error) return badRequest("Could not add team member", error.message);

  await logAudit(ctx.user!.id, "clinician.create", "clinicians", data.id);
  return created({ clinician: data });
}
