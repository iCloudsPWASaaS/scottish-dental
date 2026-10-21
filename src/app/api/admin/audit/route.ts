import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/audit - audit trail (admin only) */
export async function GET(request: Request) {
  const ctx = await requireAdmin();
  if (!ctx) return forbidden("Administrator access required");

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity");

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("audit_events")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(500);

  if (entity) query = query.eq("entity", entity);

  const { data, error, count } = await query;
  if (error) return badRequest("Could not load audit events", error.message);

  return ok({ events: data ?? [], total: count ?? 0 });
}
