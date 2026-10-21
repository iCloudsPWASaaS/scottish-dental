import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, created, forbidden } from "@/lib/http";
import { requireOperator } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  practice_name: z.string().trim().max(200).optional(),
  reason: z.string().trim().max(500).optional(),
});

/** POST /api/admin/suppressions - add to the do-not-contact list */
export async function POST(request: Request) {
  const ctx = await requireOperator();
  if (!ctx) return forbidden("Operator access required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("suppressions")
    .insert({
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      practice_name: parsed.data.practice_name || null,
      reason: parsed.data.reason || null,
    })
    .select("*")
    .single();

  if (error) {
    return badRequest("Could not add suppression", error.message);
  }

  await logAudit(
    ctx.user!.id,
    "suppression.add",
    "suppressions",
    data.id,
    parsed.data
  );

  return created({ suppression: data });
}
