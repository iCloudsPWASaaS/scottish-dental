import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/treatments - public treatment directory */
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("treatments")
    .select("id, slug, title, category, description, limitations")
    .eq("is_patient_facing", true)
    .order("title", { ascending: true });

  if (error) {
    return Response.json({ error: "Failed to load treatments" }, { status: 500 });
  }

  return ok({ treatments: data ?? [] });
}
