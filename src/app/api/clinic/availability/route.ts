import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";
import { requirePracticeStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const availabilitySchema = z.object({
  practice_location_id: z.string().uuid(),
  appointment_mode: z
    .enum(["enquiry_only", "manual_availability", "integrated"])
    .optional(),
  days: z
    .array(
      z.object({
        day_of_week: z.number().int().min(0).max(6),
        opens_at: z.string().regex(TIME_RE).nullable(),
        closes_at: z.string().regex(TIME_RE).nullable(),
        is_closed: z.boolean(),
      })
    )
    .max(7),
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

/**
 * PUT /api/clinic/availability
 * Save weekly opening hours and the location's appointment mode.
 */
export async function PUT(request: Request) {
  const ctx = await requirePracticeStaff();
  if (!ctx) return badRequest("Practice account required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();
  const { practice_location_id: locationId, days, appointment_mode } = parsed.data;

  const allowed = await ownsLocation(
    supabase,
    ctx.user!.id,
    ctx.profile!.role,
    locationId
  );
  if (!allowed) return badRequest("Access denied");

  for (const day of days) {
    const { error } = await supabase
      .from("service_availability")
      .upsert(
        {
          practice_location_id: locationId,
          day_of_week: day.day_of_week,
          opens_at: day.is_closed ? null : day.opens_at,
          closes_at: day.is_closed ? null : day.closes_at,
          is_closed: day.is_closed,
        },
        { onConflict: "practice_location_id,day_of_week" }
      );
    if (error) return badRequest("Could not save availability", error.message);
  }

  if (appointment_mode) {
    const { error } = await supabase
      .from("practice_locations")
      .update({ appointment_mode })
      .eq("id", locationId);
    if (error) return badRequest("Could not update booking mode", error.message);
  }

  return ok({ saved: days.length });
}
