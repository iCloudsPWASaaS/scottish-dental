import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * GET /api/practices/[slug]
 * Public, SEO-friendly practice profile. Only PUBLISHED locations.
 */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await createSupabaseServerClient();

  const { data: location, error } = await supabase
    .from("practice_locations")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !location) {
    return notFound("Practice not found");
  }

  const [treatments, clinicians, prices] = await Promise.all([
    supabase
      .from("practice_treatments")
      .select(
        "is_offered, nhs_available, private_available, treatment:treatments(id, slug, title, category, description, limitations)"
      )
      .eq("practice_location_id", location.id)
      .eq("is_offered", true),
    supabase
      .from("clinicians")
      .select("id, full_name, gdc_number, bio, specialties, is_verified")
      .eq("practice_location_id", location.id),
    supabase
      .from("prices")
      .select("*")
      .eq("practice_location_id", location.id),
  ]);

  return ok({
    practice: {
      ...location,
      treatments: treatments.data ?? [],
      clinicians: clinicians.data ?? [],
      prices: prices.data ?? [],
    },
  });
}
