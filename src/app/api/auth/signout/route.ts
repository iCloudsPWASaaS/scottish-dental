import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

/** POST /api/auth/signout */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return ok({ signedOut: true });
}
