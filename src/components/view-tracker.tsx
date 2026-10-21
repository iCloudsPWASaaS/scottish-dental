"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Fire-and-forget page view tracker. Sends a beacon on mount and once when
 * the tab becomes visible again; the API and RLS only accept published
 * practice locations, so this is safe to call anywhere.
 */
export function ViewTracker({ practiceId }: { practiceId: string }) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    function send() {
      supabase
        .from("page_views")
        .insert({ practice_location_id: practiceId })
        .then(() => {});
    }

    send();

    function onVisible() {
      if (document.visibilityState === "visible") send();
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [practiceId]);

  return null;
}
