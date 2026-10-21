"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_SCHEMA } from "@/lib/constants";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { db: { schema: SUPABASE_SCHEMA } }
    );
  }
  return client;
}
