"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLocations } from "@/components/dashboard/providers";

interface PerformanceData {
  views: number;
  enquiries: number;
  byStatus: Record<string, number>;
  bookings: number;
  conversionPct: number;
  avgRating: number | null;
  reviewCount: number;
}

export default function ClinicPerformancePage() {
  const { locations, selectedId } = useLocations();
  const locationId = selectedId ?? locations[0]?.id ?? null;
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!locationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const [viewsRes, enquiriesRes, bookingsRes, reviewsRes] = await Promise.all([
        supabase
          .from("page_views")
          .select("id")
          .eq("practice_location_id", locationId)
          .gte("created_at", since.toISOString()),
        supabase
          .from("enquiries")
          .select("id, status, created_at")
          .eq("practice_location_id", locationId)
          .gte("created_at", since.toISOString()),
        supabase
          .from("bookings")
          .select("id, status")
          .eq("practice_location_id", locationId)
          .gte("created_at", since.toISOString()),
        supabase
          .from("reviews")
          .select("rating")
          .eq("practice_location_id", locationId)
          .eq("status", "approved"),
      ]);

      if (cancelled) return;

      const enquiries = (enquiriesRes.data ?? []) as Array<{ status: string }>;
      const byStatus = enquiries.reduce<Record<string, number>>((acc, e) => {
        acc[e.status] = (acc[e.status] ?? 0) + 1;
        return acc;
      }, {});

      const converted = (byStatus["converted"] ?? 0) + (byStatus["contacted"] ?? 0);
      const ratings = ((reviewsRes.data ?? []) as Array<{ rating: number | null }>)
        .map((r) => r.rating)
        .filter((r): r is number => typeof r === "number");

      setData({
        views: viewsRes.data?.length ?? 0,
        enquiries: enquiries.length,
        byStatus,
        bookings: bookingsRes.data?.length ?? 0,
        conversionPct: enquiries.length === 0 ? 0 : Math.round((converted / enquiries.length) * 100),
        avgRating:
          ratings.length === 0
            ? null
            : Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
        reviewCount: ratings.length,
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  if (!locationId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Performance</h1>
        <p className="mt-2 text-sm text-ow-text-secondary">Add a practice first.</p>
      </div>
    );
  }

  const cards = data
    ? [
        { label: "Profile views (30 days)", value: data.views },
        { label: "Enquiries (30 days)", value: data.enquiries },
        { label: "Bookings (30 days)", value: data.bookings },
        { label: "Response conversion", value: `${data.conversionPct}%` },
        {
          label: "Average rating",
          value: data.avgRating === null ? "—" : `${data.avgRating} ★`,
        },
        { label: "Approved reviews", value: data.reviewCount },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Performance</h1>
        <p className="mt-1 text-sm text-ow-text-secondary">
          Last 30 days for the selected practice.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ow-text-muted">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div key={card.label} className="rounded-ow-lg border border-ow-line bg-white p-5">
                <p className="text-sm text-ow-text-muted">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-ow-ink">{card.value}</p>
              </div>
            ))}
          </div>

          {data && data.enquiries > 0 && (
            <section className="rounded-ow-lg border border-ow-line bg-white p-5">
              <h2 className="text-base font-semibold text-ow-ink">Enquiries by status</h2>
              <ul className="mt-3 space-y-2">
                {Object.entries(data.byStatus).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <span className="text-ow-text-secondary">{status}</span>
                    <span className="font-semibold text-ow-ink">{count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
