import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { COMMON_PASSWORDS, PASSWORD_MIN_LENGTH } from "@/lib/password";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .max(200)
    .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), {
      message: "Please choose a less common password.",
    }),
});

/** PATCH /api/profile/password - change own password */
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
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return badRequest("Could not change password", error.message);

  await logAudit(ctx.user!.id, "auth.password_change", "profiles", ctx.user!.id);
  return ok({ changed: true });
}
