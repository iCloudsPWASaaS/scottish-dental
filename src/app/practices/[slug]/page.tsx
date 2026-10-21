import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EnquiryForm } from "@/components/enquiry-form";
import { ViewTracker } from "@/components/view-tracker";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export default async function PracticeProfilePage({ params }: Props) {
  const supabase = await createSupabaseServerClient();

  const { data: practice, error } = await supabase
    .from("practice_locations")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !practice) notFound();

  const [treatmentsRes, cliniciansRes, pricesRes] = await Promise.all([
    supabase
      .from("practice_treatments")
      .select(
        "is_offered, nhs_available, private_available, treatment:treatments(id, slug, title, category, description, limitations)"
      )
      .eq("practice_location_id", practice.id)
      .eq("is_offered", true),
    supabase
      .from("clinicians")
      .select("id, full_name, gdc_number, bio, specialties, is_verified")
      .eq("practice_location_id", practice.id),
    supabase
      .from("prices")
      .select("*")
      .eq("practice_location_id", practice.id),
  ]);

  type TreatmentRow = {
    is_offered: boolean;
    nhs_available: boolean;
    private_available: boolean;
    treatment:
      | {
          id: string;
          slug: string;
          title: string;
          category: string;
          description: string | null;
          limitations: string[];
        }
      | null;
  };

  const treatments = ((treatmentsRes.data ?? []) as Array<
    Omit<TreatmentRow, "treatment"> & { treatment: TreatmentRow["treatment"] | TreatmentRow["treatment"][] }
  >).map((row) => ({
    ...row,
    treatment: Array.isArray(row.treatment)
      ? (row.treatment[0] ?? null)
      : row.treatment,
  }));

  const clinicians = cliniciansRes.data ?? [];
  const prices = pricesRes.data ?? [];

  return (
    <div className="container-page py-10">
      <ViewTracker practiceId={practice.id} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/search" className="hover:text-brand-700">Practices</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{practice.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900">{practice.name}</h1>
            <span className="badge bg-emerald-100 text-emerald-800">
              Verified listing
            </span>
          </div>

          <p className="mt-2 text-slate-600">
            {practice.address}, {practice.postcode}
            {practice.local_authority ? `, ${practice.local_authority}` : ""}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="badge bg-brand-100 text-brand-800">
              {practice.nhs_private === "mixed"
                ? "NHS & Private"
                : practice.nhs_private === "nhs"
                  ? "NHS"
                  : "Private"}
            </span>
            {practice.accepting_new_nhs && (
              <span className="badge bg-emerald-100 text-emerald-800">
                Accepting new NHS patients
              </span>
            )}
            <span className="badge bg-slate-100 text-slate-700">
              Last confirmed {practice.last_confirmed_at ? formatDate(practice.last_confirmed_at) : "recently"}
            </span>
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">Services &amp; treatments</h2>
            {treatments.length === 0 ? (
              <p className="mt-3 text-slate-600">
                This practice has not published a detailed treatment list yet.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {treatments.map((row, index) => {
                  const t = row.treatment;
                  return (
                    <li key={t?.id ?? index} className="card">
                      <p className="font-medium text-slate-900">{t?.title}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{t?.category}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {row.nhs_available && (
                          <span className="badge bg-clinical-100 text-clinical-800">NHS</span>
                        )}
                        {row.private_available && (
                          <span className="badge bg-slate-100 text-slate-700">Private</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">Published prices</h2>
            {prices.length === 0 ? (
              <p className="mt-3 text-slate-600">
                Prices are available on enquiry.
              </p>
            ) : (
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 font-medium">Treatment</th>
                    <th className="py-2 font-medium">Price</th>
                    <th className="py-2 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price) => (
                    <tr key={price.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-900">{price.label}</td>
                      <td className="py-2 text-slate-900">
                        {formatPrice(price.amount, price.currency, price.price_type)}
                      </td>
                      <td className="py-2 text-slate-600">
                        {price.nhs ? "NHS" : "Private"}
                        {price.conditions ? ` · ${price.conditions}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {clinicians.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900">Clinicians</h2>
              <ul className="mt-4 space-y-4">
                {clinicians.map((c) => (
                  <li key={c.id} className="card">
                    <p className="font-medium text-slate-900">{c.full_name}</p>
                    {c.gdc_number && (
                      <p className="text-xs text-slate-500">GDC {c.gdc_number}</p>
                    )}
                    {c.bio && <p className="mt-2 text-sm text-slate-600">{c.bio}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900">Make an enquiry</h2>
            <p className="mt-2 text-sm text-slate-600">
              Send a request to {practice.name}. The practice will contact you to
              arrange an appointment.
            </p>
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              This is an appointment request, not a confirmed booking.
            </p>
            <EnquiryForm
              practiceLocationId={practice.id}
              treatments={treatments
                .map((r) => r.treatment)
                .filter(
                  (t): t is NonNullable<TreatmentRow["treatment"]> =>
                    t !== null
                )
                .map((t) => ({ id: t.id, title: t.title }))}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
