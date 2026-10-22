import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { badRequest, forbidden, notFound, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/clinics
 * Full clinic registry: organisation + owner + location + portal credentials.
 */
export async function GET() {
  const ctx = await requireAdmin();
  if (!ctx) return forbidden("Admin access required");

  const supabase = await createSupabaseServerClient();

  const { data: organisations, error } = await supabase
    .from("organisations")
    .select(
      `id, name, created_at,
       owner:profiles!organisations_owner_id_fkey(id, email, full_name),
       credentials:clinic_credentials(login_email, login_password, auth_user_id),
       locations:practice_locations(id, name, slug, town, postcode, status, nhs_private, rating, rating_count, image_url)`
    )
    .order("created_at", { ascending: false });

  if (error) return badRequest("Could not load clinics", error.message);

  return ok({ clinics: organisations ?? [] });
}

const patchSchema = z.object({
  organisation_id: z.string().uuid(),
  action: z.enum(["reset_password", "suspend", "approve"]),
  new_password: z.string().min(8).max(128).optional(),
});

/**
 * PATCH /api/admin/clinics
 * reset_password -> rotates the portal auth user's password and stored credential
 * approve/suspend -> publishes or suspends all of the org's locations
 */
export async function PATCH(request: Request) {
  const ctx = await requireAdmin();
  if (!ctx) return forbidden("Admin access required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const { organisation_id: orgId, action } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (action === "reset_password") {
    const newPassword =
      parsed.data.new_password ??
      `Clinic${Math.random().toString(36).slice(2, 8).toUpperCase()}!2026`;

    const { data: credential, error: credError } = await supabase
      .from("clinic_credentials")
      .select("auth_user_id, login_email")
      .eq("organisation_id", orgId)
      .maybeSingle();

    if (credError || !credential) return notFound("Credentials not found");

    const { error: authError } = await admin.auth.admin.updateUserById(
      credential.auth_user_id,
      { password: newPassword }
    );
    if (authError) {
      return badRequest("Could not reset password", authError.message);
    }

    const { error: updateError } = await supabase
      .from("clinic_credentials")
      .update({ login_password: newPassword, updated_at: new Date().toISOString() })
      .eq("organisation_id", orgId);
    if (updateError) {
      return badRequest("Could not store new password", updateError.message);
    }

    await logAudit(ctx.user!.id, "clinic.reset_password", "organisations", orgId, {
      login_email: credential.login_email,
    });

    return ok({ login_email: credential.login_email, login_password: newPassword });
  }

  // approve / suspend locations for this org
  const status = action === "approve" ? "published" : "suspended";
  const patch: Record<string, unknown> = { status };
  if (action === "approve") {
    patch.published_at = new Date().toISOString();
    patch.verified_at = new Date().toISOString();
  }

  const { data: updated, error: locError } = await supabase
    .from("practice_locations")
    .update(patch)
    .eq("organisation_id", orgId)
    .select("id, status");

  if (locError) {
    return badRequest("Could not update locations", locError.message);
  }

  await logAudit(ctx.user!.id, `clinic.${action}`, "organisations", orgId, {
    locations: updated?.length ?? 0,
  });

  return ok({ locations: updated ?? [] });
}
