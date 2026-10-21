import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";
import { requirePracticeStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

const treatmentsSchema = z.object({
  practice_location_id: z.string().uuid(),
  items: z
    .array(
      z.object({
        treatment_id: z.string().uuid(),
        is_offered: z.boolean(),
        nhs_available: z.boolean().default(false),
        private_available: z.boolean().default(true),
        price_from: z.number().min(0).max(100000).nullable().optional(),
      })
    )
    .max(100),
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
 * PUT /api/clinic/treatments
 * Bulk upsert which treatments a location offers, plus guide prices.
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

  const parsed = treatmentsSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();
  const { practice_location_id: locationId, items } = parsed.data;

  const allowed = await ownsLocation(
    supabase,
    ctx.user!.id,
    ctx.profile!.role,
    locationId
  );
  if (!allowed) return badRequest("Access denied");

  for (const item of items) {
    const { error: upsertError } = await supabase
      .from("practice_treatments")
      .upsert(
        {
          practice_location_id: locationId,
          treatment_id: item.treatment_id,
          is_offered: item.is_offered,
          nhs_available: item.nhs_available,
          private_available: item.private_available,
        },
        { onConflict: "practice_location_id,treatment_id" }
      );
    if (upsertError) {
      return badRequest("Could not save treatments", upsertError.message);
    }

    const { data: existingPrice } = await supabase
      .from("prices")
      .select("id")
      .eq("practice_location_id", locationId)
      .eq("treatment_id", item.treatment_id)
      .eq("price_type", "from")
      .maybeSingle();

    if (item.price_from !== undefined) {
      if (item.price_from === null) {
        if (existingPrice) {
          await supabase.from("prices").delete().eq("id", existingPrice.id);
        }
      } else if (existingPrice) {
        await supabase
          .from("prices")
          .update({ amount: item.price_from, confirmed_at: new Date().toISOString() })
          .eq("id", existingPrice.id);
      } else {
        const { data: treatment } = await supabase
          .from("treatments")
          .select("title")
          .eq("id", item.treatment_id)
          .maybeSingle();
        await supabase.from("prices").insert({
          practice_location_id: locationId,
          treatment_id: item.treatment_id,
          label: treatment?.title ?? "Treatment",
          amount: item.price_from,
          price_type: "from",
          nhs: item.nhs_available,
          confirmed_at: new Date().toISOString(),
        });
      }
    }
  }

  return ok({ saved: items.length });
}
