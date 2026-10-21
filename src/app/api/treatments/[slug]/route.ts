import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/treatments/[slug] */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_patient_facing", true)
    .maybeSingle();

  if (error || !data) {
    return notFound("Treatment not found");
  }

  return ok({ treatment: data });
}
