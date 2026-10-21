import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forbidden, ok } from "@/lib/http";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/stats
 * Practice analytics for the signed-in organisation.
 */
export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx.user || !ctx.profile) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const isAdmin = ["admin", "super_admin"].includes(ctx.profile.role);
  const supabase = await createSupabaseServerClient();

  const { data: locations } = await supabase
    .from("practice_locations")
    .select("id, name, status, published_at")
    .eq(isAdmin ? "id" : "organisation_id", isAdmin ? "id" : ctx.profile.organisation_id ?? "")
    .limit(1000);

  const ids = (locations ?? []).map((l) => l.id);

  let enquiryStats = { total: 0, byStatus: {} as Record<string, number> };
  if (ids.length > 0) {
    const { data: enquiries } = await supabase
      .from("enquiries")
      .select("status")
      .in("practice_location_id", ids);

    enquiryStats = {
      total: enquiries?.length ?? 0,
      byStatus: (enquiries ?? []).reduce<Record<string, number>>((acc, e) => {
        acc[e.status] = (acc[e.status] ?? 0) + 1;
        return acc;
      }, {}),
    };
  }

  return ok({
    locations: locations ?? [],
    locationCount: locations?.length ?? 0,
    publishedCount: locations?.filter((l) => l.status === "published").length ?? 0,
    enquiries: enquiryStats,
  });
}
