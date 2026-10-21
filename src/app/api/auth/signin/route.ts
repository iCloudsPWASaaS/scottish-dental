import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";
import { signinSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** POST /api/auth/signin */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = signinSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return badRequest("Invalid email or password");
  }

  await logAudit(data.user.id, "auth.signin", "profiles", data.user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, full_name, organisation_id")
    .eq("id", data.user.id)
    .maybeSingle();

  return ok({
    user: { id: data.user.id, email: data.user.email },
    profile: profile ?? null,
  });
}
