import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";
import { requirePracticeStaff } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  scheduled_at: z.string().datetime().optional().nullable(),
});

/** PATCH /api/clinic/bookings/[id] */
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
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, practice_location_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!booking) return badRequest("Booking not found");

  const { data: location } = await supabase
    .from("practice_locations")
    .select("organisation_id")
    .eq("id", booking.practice_location_id)
    .maybeSingle();

  const isAdmin = ["admin", "super_admin"].includes(ctx.profile!.role);
  if (!isAdmin && location?.organisation_id !== ctx.profile!.organisation_id) {
    return badRequest("Access denied");
  }

  const updates: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.scheduled_at !== undefined) {
    updates.scheduled_at = parsed.data.scheduled_at;
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return badRequest("Could not update booking", error.message);

  await logAudit(ctx.user!.id, "booking.update", "bookings", params.id, {
    status: parsed.data.status,
  });

  return ok({ booking: data });
}
