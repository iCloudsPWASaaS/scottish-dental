"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LocationEditor } from "@/components/location-editor";
import { useLocations } from "@/components/dashboard/providers";

interface LocationRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string;
  postcode: string;
  local_authority: string | null;
  nhs_private: string;
  accepting_new_nhs: boolean;
  bio: string | null;
  image_url: string | null;
}

function ListingInner() {
  const searchParams = useSearchParams();
  const { locations, selectedId, setSelectedId, refresh } = useLocations();
  const [location, setLocation] = useState<LocationRow | null>(null);
  const [loading, setLoading] = useState(true);

  const targetId = searchParams.get("practice") ?? selectedId ?? locations[0]?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!targetId) {
        setLocation(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("practice_locations")
        .select(
          "id, name, slug, status, phone, email, website, address, postcode, local_authority, nhs_private, accepting_new_nhs, bio, image_url"
        )
        .eq("id", targetId)
        .maybeSingle();
      if (!cancelled) {
        setLocation((data as LocationRow) ?? null);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  if (locations.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-bold text-ow-ink">My Practice</h1>
        <p className="mt-2 text-sm text-ow-text-secondary">
          You have not added a practice yet. Add one to start building your listing.
        </p>
        <Link
          href="/dashboard/clinic/locations/new"
          className="mt-6 inline-flex items-center gap-2 rounded-ow-md bg-ow-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-ow-brand-hover"
        >
          <Plus size={16} aria-hidden />
          Add your practice
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ow-ink">My Practice</h1>
          <p className="mt-1 text-sm text-ow-text-secondary">
            Keep your listing accurate — patients see this information in search.
          </p>
        </div>
        <Link
          href="/dashboard/clinic/locations/new"
          className="inline-flex items-center gap-1.5 rounded-ow-md border border-ow-line-strong bg-white px-3 py-2 text-sm font-medium text-ow-text-secondary hover:bg-ow-bg-soft"
        >
          <Plus size={14} aria-hidden />
          Add practice
        </Link>
      </div>

      {locations.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {locations.map((l) => (
            <Link
              key={l.id}
              href={`/dashboard/clinic/listing?practice=${l.id}`}
              onClick={() => setSelectedId(l.id)}
              className={`rounded-ow-md border px-3 py-1.5 text-sm font-medium transition ${
                l.id === targetId
                  ? "border-ow-brand bg-ow-bg-tint text-ow-brand"
                  : "border-ow-line bg-white text-ow-text-secondary hover:bg-ow-bg-soft"
              }`}
            >
              {l.name}
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ow-text-muted">Loading…</p>
      ) : location ? (
        <section className="rounded-ow-lg border border-ow-line bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-ow-ink">{location.name}</h2>
            <span className="text-xs text-ow-text-muted">
              Listing status:{" "}
              <span
                className={`font-semibold ${
                  location.status === "published"
                    ? "text-ow-success-text"
                    : location.status === "in_review" || location.status === "pending"
                      ? "text-ow-warning-text"
                      : "text-ow-text-muted"
                }`}
              >
                {location.status.replace("_", " ")}
              </span>
            </span>
          </div>
          <LocationEditor location={location} />
          {location.status === "published" && (
            <p className="mt-4 text-sm text-ow-text-secondary">
              <Link
                href={`/practices/${location.slug}`}
                className="inline-flex items-center gap-1 font-semibold text-ow-brand hover:underline"
              >
                View public listing
                <ArrowRight size={13} aria-hidden />
              </Link>
            </p>
          )}
        </section>
      ) : (
        <p className="text-sm text-ow-text-muted">Practice not found.</p>
      )}
    </div>
  );
}

export default function ClinicListingPage() {
  return (
    <Suspense>
      <ListingInner />
    </Suspense>
  );
}
