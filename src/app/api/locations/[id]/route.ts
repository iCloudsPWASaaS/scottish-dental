import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, forbidden, notFound, ok } from "@/lib/http";
import { updateLocationSchema } from "@/lib/validations";
import { getAuthContext } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

async function ownsLocation(userId: string, locationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organisation_id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return { supabase, allowed: false, isAdmin: false };
  if (profile.role === "admin" || profile.role === "super_admin") {
    return { supabase, allowed: true, isAdmin: true };
  }

  const { data: location } = await supabase
    .from("practice_locations")
    .select("organisation_id")
    .eq("id", locationId)
    .maybeSingle();

  return {
    supabase,
    allowed: location?.organisation_id === profile.organisation_id,
    isAdmin: false,
  };
}

/** GET /api/locations/[id] - own location (any status) */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (!ctx.user) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const { supabase, allowed } = await ownsLocation(ctx.user.id, params.id);
  if (!allowed) return forbidden("Access denied");

  const { data, error } = await supabase
    .from("practice_locations")
    .select(
      "*, clinicians:clinicians(*), prices:prices(*), availability:service_availability(*)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) return notFound("Location not found");
  return ok({ location: data });
}

/** PATCH /api/locations/[id] - practice staff edit content */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (!ctx.user) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const { supabase, allowed } = await ownsLocation(ctx.user.id, params.id);
  if (!allowed) return forbidden("Access denied");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = updateLocationSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  // Material changes return the location to review.
  const materialFields: (keyof typeof parsed.data)[] = [
    "nhs_private",
    "accepting_new_nhs",
    "address",
    "postcode",
    "local_authority",
  ];
  const hasMaterialChange = materialFields.some(
    (field) => parsed.data[field] !== undefined
  );

  const updates: Record<string, unknown> = { ...parsed.data };
  if (hasMaterialChange) {
    updates.status = "in_review";
  }

  const { data, error } = await supabase
    .from("practice_locations")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) {
    return badRequest("Could not update location", error.message);
  }

  await logAudit(ctx.user.id, "location.update", "practice_locations", params.id, {
    material: hasMaterialChange,
  });

  return ok({ location: data });
}

/** DELETE /api/locations/[id] - deactivate (soft) */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (!ctx.user) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const { supabase, allowed } = await ownsLocation(ctx.user.id, params.id);
  if (!allowed) return forbidden("Access denied");

  const { data, error } = await supabase
    .from("practice_locations")
    .update({ status: "deactivated" })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) {
    return badRequest("Could not deactivate location", error.message);
  }

  await logAudit(ctx.user!.id, "location.deactivate", "practice_locations", params.id);

  return ok({ location: data });
}
