import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SCHEMA } from "@/lib/constants";

/**
 * Service-role client. SERVER-ONLY.
 * Bypasses Row Level Security. Never import from client components.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  return createClient(url, serviceRoleKey, {
    db: { schema: SUPABASE_SCHEMA },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
