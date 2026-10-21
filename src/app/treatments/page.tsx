import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Treatments" };
export const dynamic = "force-dynamic";

export default async function TreatmentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: treatments } = await supabase
    .from("treatments")
    .select("id, slug, title, category, description")
    .eq("is_patient_facing", true)
    .order("title", { ascending: true });

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Treatments</h1>
      <p className="mt-2 text-slate-600">
        Patient information about common dental treatments. Descriptions explain
        limitations and do not guarantee suitability or outcomes.
      </p>

      {(!treatments || treatments.length === 0) ? (
        <div className="card mt-8">
          <p className="text-slate-600">
            The treatment directory is being populated. Please check back soon.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.map((t) => (
            <Link key={t.id} href={`/treatments/${t.slug}`} className="card transition hover:border-brand-300">
              <p className="text-xs uppercase tracking-wide text-brand-700">{t.category}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{t.title}</h2>
              <p className="mt-2 text-sm text-slate-600 line-clamp-3">{t.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
