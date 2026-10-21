import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";
import { searchPracticesSchema } from "@/lib/validations";
import { normalisePostcode } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/practices
 * Public search over PUBLISHED practice locations only.
 * Unapproved prospects can never be returned here.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = searchPracticesSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    postcode: searchParams.get("postcode") ?? undefined,
    treatment: searchParams.get("treatment") ?? undefined,
    nhs: searchParams.get("nhs") ?? undefined,
    acceptingNewNhs: searchParams.get("acceptingNewNhs") ?? undefined,
    radiusKm: searchParams.get("radiusKm") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return badRequest("Invalid search parameters", parsed.error.flatten());
  }

  const {
    q,
    postcode,
    treatment,
    nhs,
    acceptingNewNhs,
    page,
    pageSize,
  } = parsed.data;

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("practice_locations")
    .select(
      "id, name, slug, address, postcode, local_authority, nhs_board, phone, website, nhs_private, accepting_new_nhs, facilities, languages, accessibility, sedation_options, latitude, longitude, published_at, last_confirmed_at",
      { count: "exact" }
    )
    .eq("status", "published");

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,address.ilike.%${q}%,local_authority.ilike.%${q}%`
    );
  }

  if (postcode) {
    const normalised = normalisePostcode(postcode);
    const outward = normalised.replace(/[0-9][A-Z]{2}$/, "");
    query = query.ilike("postcode", `${outward}%`);
  }

  if (nhs) {
    if (nhs === "mixed") {
      query = query.eq("nhs_private", "mixed");
    } else {
      query = query.in("nhs_private", [nhs, "mixed"]);
    }
  }

  if (acceptingNewNhs) {
    query = query.eq("accepting_new_nhs", true);
  }

  if (treatment) {
    const { data: treatmentRows } = await supabase
      .from("treatments")
      .select("id")
      .eq("slug", treatment)
      .limit(1);
    const treatmentId = treatmentRows?.[0]?.id;

    if (!treatmentId) {
      return ok({ results: [], page, pageSize, total: 0, totalPages: 0 });
    }

    const { data: practiceTreatments } = await supabase
      .from("practice_treatments")
      .select("practice_location_id")
      .eq("treatment_id", treatmentId)
      .eq("is_offered", true);

    const ids = (practiceTreatments ?? []).map((r) => r.practice_location_id);
    if (ids.length === 0) {
      return ok({ results: [], page, pageSize, total: 0, totalPages: 0 });
    }
    query = query.in("id", ids);
  }

  const from = (page - 1) * pageSize;
  query = query
    .order("published_at", { ascending: false })
    .range(from, from + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return badRequest("Search failed", error.message);
  }

  return ok({
    results: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  });
}
