import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PracticeCard } from "@/components/practice-card";
import { SearchBar } from "@/components/search-bar";
import { searchPracticesSchema } from "@/lib/validations";
import { normalisePostcode } from "@/lib/utils";

export const metadata = { title: "Search practices" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function SearchPage({ searchParams }: Props) {
  const raw = {
    postcode: typeof searchParams.postcode === "string" ? searchParams.postcode : undefined,
    q: typeof searchParams.q === "string" ? searchParams.q : undefined,
    treatment: typeof searchParams.treatment === "string" ? searchParams.treatment : undefined,
    nhs: typeof searchParams.nhs === "string" ? searchParams.nhs : undefined,
    acceptingNewNhs: typeof searchParams.acceptingNewNhs === "string" ? searchParams.acceptingNewNhs : undefined,
  };

  const parsed = searchPracticesSchema.safeParse(raw);
  const params = parsed.success ? parsed.data : searchPracticesSchema.parse({});

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("practice_locations")
    .select(
      "id, name, slug, address, postcode, local_authority, nhs_board, nhs_private, accepting_new_nhs, latitude, longitude"
    )
    .eq("status", "published");

  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,address.ilike.%${params.q}%,local_authority.ilike.%${params.q}%`
    );
  }

  if (params.postcode) {
    const normalised = normalisePostcode(params.postcode);
    const outward = normalised.replace(/[0-9][A-Z]{2}$/, "");
    query = query.ilike("postcode", `${outward}%`);
  }

  if (params.nhs) {
    if (params.nhs === "mixed") {
      query = query.eq("nhs_private", "mixed");
    } else {
      query = query.in("nhs_private", [params.nhs, "mixed"]);
    }
  }

  if (params.acceptingNewNhs) query = query.eq("accepting_new_nhs", true);

  if (params.treatment) {
    const { data: treatmentRows } = await supabase
      .from("treatments")
      .select("id")
      .eq("slug", params.treatment)
      .limit(1);
    const treatmentId = treatmentRows?.[0]?.id;

    const { data: practiceTreatments } = treatmentId
      ? await supabase
          .from("practice_treatments")
          .select("practice_location_id")
          .eq("treatment_id", treatmentId)
          .eq("is_offered", true)
      : { data: null };

    const ids = (practiceTreatments ?? []).map((r) => r.practice_location_id);
    query = query.in("id", ids);
  }

  query = query
    .order("published_at", { ascending: false })
    .range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);

  const { data, error } = await query;
  const results = error ? [] : (data ?? []);

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-slate-900">Find a dentist</h1>
      <p className="mt-1 text-slate-600">
        Search verified practices across Scotland.
      </p>

      <div className="mt-6 max-w-2xl">
        <SearchBar defaultValue={params.postcode ?? params.q ?? ""} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={`/search?${withParam(raw, "nhs", "nhs")}`} className="btn-secondary text-xs">
          NHS
        </Link>
        <Link href={`/search?${withParam(raw, "nhs", "private")}`} className="btn-secondary text-xs">
          Private
        </Link>
        <Link
          href={`/search?${withParam(raw, "acceptingNewNhs", "true")}`}
          className="btn-secondary text-xs"
        >
          Accepting new NHS patients
        </Link>
      </div>

      <p className="mt-8 text-sm text-slate-500" role="status">
        {results.length} verified practice{results.length === 1 ? "" : "s"} found
      </p>

      {results.length === 0 ? (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-slate-900">No results found</h2>
          <p className="mt-2 text-slate-600">
            Try widening your search radius or choosing a related treatment. We
            never show unverified practices.
          </p>
          <Link href="/search" className="btn-secondary mt-4">
            Clear search
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <PracticeCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              address={`${p.address}, ${p.postcode}`}
              nhsPrivate={p.nhs_private}
              acceptingNewNhs={p.accepting_new_nhs}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function withParam(
  base: Record<string, string | undefined>,
  key: string,
  value: string
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (v) params.set(k, v);
  }
  params.set(key, value);
  return params.toString();
}
