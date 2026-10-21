"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLocations } from "@/components/dashboard/providers";
import { toast } from "sonner";

interface Booking {
  id: string;
  patient_name: string | null;
  scheduled_at: string | null;
  status: string;
  created_at: string;
  practice_location_id: string;
  location_name?: string;
  enquiry?: { patient_email: string | null; patient_phone: string | null } | null;
}

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

export default function ClinicBookingsPage() {
  const { locations, selectedId } = useLocations();
  const locationId = selectedId ?? locations[0]?.id ?? null;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!locationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("bookings")
        .select(
          "id, patient_name, scheduled_at, status, created_at, practice_location_id, enquiry:enquiries(patient_email, patient_phone)"
        )
        .eq("practice_location_id", locationId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!cancelled) {
        const nameById = Object.fromEntries(locations.map((l) => [l.id, l.name]));
        setBookings(
          ((data ?? []) as Booking[]).map((b) => ({
            ...b,
            location_name: nameById[b.practice_location_id] ?? "",
          }))
        );
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locationId, locations]);

  async function updateStatus(id: string, status: string) {
    setBusy(id);
    const res = await fetch(`/api/clinic/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    if (res.ok) {
      const json = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...json.data.booking } : b))
      );
      toast.success("Booking updated.");
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Could not update booking.");
    }
  }

  if (!locationId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Bookings</h1>
        <p className="mt-2 text-sm text-ow-text-secondary">Add a practice first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Bookings</h1>
        <p className="mt-1 text-sm text-ow-text-secondary">
          {loading ? "Loading…" : `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ow-text-muted">Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-ow-lg border border-ow-line bg-white p-10 text-center">
          <p className="text-sm text-ow-text-secondary">
            No bookings yet. Set your booking mode and hours to start receiving them.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="flex flex-wrap items-start justify-between gap-3 rounded-ow-lg border border-ow-line bg-white p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ow-ink">{b.patient_name ?? "Patient"}</p>
                <p className="text-xs text-ow-text-muted">
                  {b.enquiry?.patient_email ?? ""}
                  {b.enquiry?.patient_phone ? ` · ${b.enquiry.patient_phone}` : ""}
                </p>
                <p className="mt-1 text-sm text-ow-text-secondary">
                  {b.scheduled_at
                    ? new Date(b.scheduled_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Date to be confirmed"}
                </p>
                <p className="text-xs text-ow-text-muted">
                  Requested {new Date(b.created_at).toLocaleDateString("en-GB")}
                </p>
              </div>
              <select
                value={b.status}
                disabled={busy === b.id}
                onChange={(e) => updateStatus(b.id, e.target.value)}
                aria-label={`Status for booking from ${b.patient_name ?? "patient"}`}
                className="rounded-ow-md border border-ow-line-strong bg-white px-3 py-1.5 text-sm text-ow-ink focus:border-ow-brand focus:outline-none disabled:opacity-60"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
