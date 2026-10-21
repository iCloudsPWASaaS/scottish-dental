import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, created, forbidden, ok } from "@/lib/http";
import { createProspectSchema } from "@/lib/validations";
import { requireOperator } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/prospects
 * PRIVATE CRM. Only business development / admin.
 * Anon and regular authenticated users receive an empty list (no data leak).
 */
export async function GET(request: Request) {
  const ctx = await requireOperator();
  if (!ctx) {
    return forbidden("Operator access required");
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const region = searchParams.get("region");
  const authority = searchParams.get("authority");
  const assignedTo = searchParams.get("assignedTo");
  const q = searchParams.get("q");

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("prospects")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(500);

  if (status) query = query.eq("status", status);
  if (region) query = query.eq("region", region);
  if (authority) query = query.eq("local_authority", authority);
  if (assignedTo) query = query.eq("assigned_manager_id", assignedTo);
  if (q) query = query.ilike("practice_name", `%${q}%`);

  const { data, error, count } = await query;
  if (error) {
    return badRequest("Could not load prospects", error.message);
  }

  return ok({ prospects: data ?? [], total: count ?? 0 });
}

/** POST /api/admin/prospects */
export async function POST(request: Request) {
  const ctx = await requireOperator();
  if (!ctx) return forbidden("Operator access required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = createProspectSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("prospects")
    .select("id")
    .or(
      `practice_name.ilike.%${parsed.data.practice_name}%` +
        (parsed.data.website ? `,website.eq.${parsed.data.website}` : "")
    )
    .limit(1);

  if (existing && existing.length > 0) {
    return badRequest("A matching prospect already exists", {
      id: existing[0].id,
    });
  }

  const { data, error } = await supabase
    .from("prospects")
    .insert({
      ...parsed.data,
      status: "identified",
      researcher: ctx.profile!.email,
      captured_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return badRequest("Could not create prospect", error.message);
  }

  await logAudit(ctx.user!.id, "prospect.create", "prospects", data.id);

  return created({ prospect: data });
}
