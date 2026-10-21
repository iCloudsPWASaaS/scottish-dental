import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

/** PATCH /api/profile - signed-in user updates their own profile */
export async function PATCH(request: Request) {
  const ctx = await requireUser();
  if (!ctx) return badRequest("Sign in required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(parsed.data.full_name !== undefined ? { full_name: parsed.data.full_name } : {}),
      ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone || null } : {}),
    })
    .eq("id", ctx.user!.id)
    .select("id, email, full_name, role, phone, organisation_id")
    .single();

  if (error) return badRequest("Could not update profile", error.message);

  await logAudit(ctx.user!.id, "profile.update", "profiles", ctx.user!.id);
  return ok({ profile: data });
}
