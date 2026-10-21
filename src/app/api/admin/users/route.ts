import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, forbidden, ok } from "@/lib/http";
import { setRoleSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users - assign a platform role (admin only).
 * This is the ONLY way privileged roles are granted.
 */
export async function POST(request: Request) {
  const ctx = await requireAdmin();
  if (!ctx) return forbidden("Administrator access required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = setRoleSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.user_id)
    .select("id, email, role")
    .single();

  if (error) {
    return badRequest("Could not update role", error.message);
  }

  await logAudit(ctx.user!.id, "user.set_role", "profiles", data.id, {
    role: parsed.data.role,
  });

  return ok({ profile: data });
}
