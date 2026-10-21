import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, forbidden, notFound, ok } from "@/lib/http";
import { requireOperator } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  location_id: z.string().uuid(),
  decision: z.enum(["approve", "reject", "request_changes"]),
  reason: z.string().trim().max(2000).optional(),
});

/**
 * POST /api/admin/approvals
 * Governs publication of a practice location.
 * Approval is the ONLY path to status = 'published'.
 */
export async function POST(request: Request) {
  const ctx = await requireOperator();
  if (!ctx) return forbidden("Operator access required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  const { data: location, error } = await supabase
    .from("practice_locations")
    .select("*")
    .eq("id", parsed.data.location_id)
    .maybeSingle();

  if (error || !location) return notFound("Location not found");

  let status = location.status;
  let publishedAt = location.published_at;
  let verifiedAt = location.verified_at;

  if (parsed.data.decision === "approve") {
    status = "published";
    publishedAt = new Date().toISOString();
    verifiedAt = new Date().toISOString();
  } else if (parsed.data.decision === "reject") {
    status = "verification_failed";
  } else {
    status = "in_review";
  }

  const { data: updated, error: updateError } = await supabase
    .from("practice_locations")
    .update({ status, published_at: publishedAt, verified_at: verifiedAt })
    .eq("id", parsed.data.location_id)
    .select("*")
    .single();

  if (updateError) {
    return badRequest("Could not update location", updateError.message);
  }

  await logAudit(
    ctx.user!.id,
    `approval.${parsed.data.decision}`,
    "practice_locations",
    parsed.data.location_id,
    { reason: parsed.data.reason ?? null }
  );

  return ok({ location: updated });
}
