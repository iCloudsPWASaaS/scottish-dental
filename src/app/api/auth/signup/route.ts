import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, created, ok } from "@/lib/http";
import { signupSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/signup
 * Creates an auth user + profile (patient | practice_owner | practice_member).
 * Privileged roles (admin/bd) can only be assigned by an existing admin.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const { email, password, full_name, role } = parsed.data;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
    },
  });

  if (error) {
    return badRequest(error.message);
  }

  if (data.user) {
    await logAudit(data.user.id, "auth.signup", "profiles", data.user.id, {
      role,
    });
  }

  return created({
    user: data.user
      ? { id: data.user.id, email: data.user.email }
      : null,
    session: data.session ? true : false,
    message:
      "Account created. Check your email to confirm your address if required.",
  });
}
