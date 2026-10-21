import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forbidden, ok } from "@/lib/http";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/locations/mine
 * Locations for the signed-in practice (any status).
 */
export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx.user || !ctx.profile) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const isAdmin = ["admin", "super_admin"].includes(ctx.profile.role);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("practice_locations")
    .select("*")
    .eq(isAdmin ? "id" : "organisation_id", isAdmin ? "id" : ctx.profile.organisation_id ?? "")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Could not load locations" }, { status: 500 });
  }

  return ok({ locations: data ?? [] });
}
