import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, forbidden, notFound, ok } from "@/lib/http";
import { updateEnquiryStatusSchema } from "@/lib/validations";
import { getAuthContext } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** PATCH /api/enquiries/[id] - update enquiry status (practice staff/admin) */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (!ctx.user || !ctx.profile) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = updateEnquiryStatusSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .select("*, practice:practice_locations(id, organisation_id)")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !enquiry) {
    return notFound("Enquiry not found");
  }

  const isAdmin =
    ctx.profile.role === "admin" || ctx.profile.role === "super_admin";
  const ownsPractice =
    enquiry.practice?.organisation_id === ctx.profile.organisation_id;

  if (!isAdmin && !ownsPractice) {
    return forbidden("You do not have access to this enquiry");
  }

  const { data: updated, error: updateError } = await supabase
    .from("enquiries")
    .update({ status: parsed.data.status })
    .eq("id", params.id)
    .select("*")
    .single();

  if (updateError) {
    return badRequest("Could not update enquiry", updateError.message);
  }

  await logAudit(
    ctx.user.id,
    `enquiry.${parsed.data.status}`,
    "enquiries",
    params.id,
    { note: parsed.data.note ?? null }
  );

  return ok({ enquiry: updated });
}
