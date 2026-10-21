import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/auth/session */
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return ok({ user: null, profile: null });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, full_name, organisation_id")
    .eq("id", user.id)
    .maybeSingle();

  return ok({ user: { id: user.id, email: user.email }, profile: profile ?? null });
}
