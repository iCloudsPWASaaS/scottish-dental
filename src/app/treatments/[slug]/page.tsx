import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export default async function TreatmentDetailPage({ params }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data: treatment } = await supabase
    .from("treatments")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_patient_facing", true)
    .maybeSingle();

  if (!treatment) notFound();

  type PracticeRef = {
    id: string;
    name: string;
    slug: string;
    address: string;
    postcode: string;
    nhs_private: string;
    status: string;
  };

  const { data: practices } = await supabase
    .from("practice_treatments")
    .select(
      "practice_location:practice_locations(id, name, slug, address, postcode, nhs_private, status)"
    )
    .eq("treatment_id", treatment.id)
    .eq("is_offered", true);

  const published = ((practices ?? []) as Array<{
    practice_location: PracticeRef | PracticeRef[] | null;
  }>)
    .map((r) =>
      Array.isArray(r.practice_location)
        ? r.practice_location[0] ?? null
        : r.practice_location
    )
    .filter((p): p is PracticeRef => p !== null && p.status === "published");

  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/treatments" className="hover:text-brand-700">Treatments</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{treatment.title}</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold text-slate-900">{treatment.title}</h1>
      <p className="mt-1 text-sm uppercase tracking-wide text-brand-700">
        {treatment.category}
      </p>

      <div className="mt-6 max-w-3xl space-y-4 text-slate-700">
        {treatment.description ? (
          <p className="whitespace-pre-line">{treatment.description}</p>
        ) : (
          <p>Detailed patient information for this treatment is coming soon.</p>
        )}
      </div>

      {treatment.limitations?.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-lg font-semibold text-slate-900">Important limitations</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
            {treatment.limitations.map((l: string, i: number) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </section>
      )}

      {published.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">
            Practices offering this treatment
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {published.map((p) => (
              <li key={p.id} className="card">
                <Link href={`/practices/${p.slug}`} className="font-medium text-brand-700 hover:underline">
                  {p.name}
                </Link>
                <p className="text-sm text-slate-600">
                  {p.address}, {p.postcode}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
