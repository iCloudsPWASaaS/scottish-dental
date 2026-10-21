import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

/** POST /api/views - fire-and-forget practice profile view (anon, published only). */
export async function POST(request: Request) {
  let body: { practice_location_id?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body.practice_location_id) {
    return badRequest("practice_location_id is required");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("page_views").insert({
    practice_location_id: body.practice_location_id,
  });

  if (error) return badRequest("Could not record view");
  return ok({ recorded: true });
}
