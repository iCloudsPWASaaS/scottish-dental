import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, forbidden, notFound, ok } from "@/lib/http";
import { updateProspectSchema } from "@/lib/validations";
import { requireOperator } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await requireOperator();
  if (!ctx) return forbidden("Operator access required");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("prospects")
    .select("*, sources:prospect_sources(*), outreach:outreach_activities(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) return notFound("Prospect not found");
  return ok({ prospect: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await requireOperator();
  if (!ctx) return forbidden("Operator access required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = updateProspectSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("prospects")
    .update(parsed.data)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) {
    return badRequest("Could not update prospect", error.message);
  }

  await logAudit(ctx.user!.id, "prospect.update", "prospects", params.id, {
    changes: Object.keys(parsed.data),
  });

  return ok({ prospect: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await requireOperator();
  if (!ctx) return forbidden("Operator access required");

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("prospects")
    .update({ archived: true, status: "archived" })
    .eq("id", params.id);

  if (error) {
    return badRequest("Could not archive prospect", error.message);
  }

  await logAudit(ctx.user!.id, "prospect.archive", "prospects", params.id);

  return ok({ archived: true });
}
