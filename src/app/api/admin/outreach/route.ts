import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, created, forbidden, notFound } from "@/lib/http";
import { outreachSchema } from "@/lib/validations";
import { requireOperator } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** POST /api/admin/outreach - log an outreach attempt against a prospect */
export async function POST(request: Request) {
  const ctx = await requireOperator();
  if (!ctx) return forbidden("Operator access required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = outreachSchema
    .extend({ prospect_id: z.string().uuid() })
    .safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id, status, attempts, do_not_contact, opt_out")
    .eq("id", parsed.data.prospect_id)
    .maybeSingle();

  if (!prospect) return notFound("Prospect not found");
  if (prospect.do_not_contact || prospect.opt_out) {
    return badRequest(
      "This prospect is on the do-not-contact / opt-out suppression list"
    );
  }

  const { data, error } = await supabase
    .from("outreach_activities")
    .insert({
      prospect_id: parsed.data.prospect_id,
      activity_type: parsed.data.activity_type,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
      created_by: ctx.user!.id,
    })
    .select("*")
    .single();

  if (error) {
    return badRequest("Could not record outreach", error.message);
  }

  await supabase
    .from("prospects")
    .update({
      attempts: (prospect.attempts ?? 0) + 1,
      status:
        parsed.data.status === "responded"
          ? "interested"
          : prospect.status === "identified"
            ? "outreach_sent"
            : prospect.status,
    })
    .eq("id", parsed.data.prospect_id);

  await logAudit(
    ctx.user!.id,
    "outreach.log",
    "outreach_activities",
    data.id,
    { prospect_id: parsed.data.prospect_id, type: parsed.data.activity_type }
  );

  return created({ outreach: data });
}
