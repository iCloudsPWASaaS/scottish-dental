import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/locations
 * Admin view of ALL locations including draft/pending/suspended.
 */
export async function GET(request: Request) {
  const ctx = await requireAdmin();
  if (!ctx) return forbidden("Administrator access required");

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("practice_locations")
    .select(
      "id, name, slug, postcode, local_authority, nhs_board, nhs_private, status, published_at, verified_at, last_confirmed_at, organisation:organisations(id, name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) return badRequest("Could not load locations", error.message);

  return ok({ locations: data ?? [], total: count ?? 0 });
}
