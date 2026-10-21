"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLocations } from "@/components/dashboard/providers";
import { toast } from "sonner";

const DAYS = [
  { index: 0, label: "Sunday" },
  { index: 1, label: "Monday" },
  { index: 2, label: "Tuesday" },
  { index: 3, label: "Wednesday" },
  { index: 4, label: "Thursday" },
  { index: 5, label: "Friday" },
  { index: 6, label: "Saturday" },
];

interface DayState {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

const DEFAULT_DAYS: DayState[] = DAYS.map((d) => ({
  day_of_week: d.index,
  opens_at: "09:00",
  closes_at: "17:00",
  is_closed: d.index === 0 || d.index === 6,
}));

export default function ClinicAvailabilityPage() {
  const { locations, selectedId } = useLocations();
  const locationId = selectedId ?? locations[0]?.id ?? null;

  const [days, setDays] = useState<DayState[]>(DEFAULT_DAYS);
  const [mode, setMode] = useState("manual_availability");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!locationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      const [availRes, locRes] = await Promise.all([
        supabase
          .from("service_availability")
          .select("day_of_week, opens_at, closes_at, is_closed")
          .eq("practice_location_id", locationId),
        supabase
          .from("practice_locations")
          .select("appointment_mode")
          .eq("id", locationId)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const rows = (availRes.data ?? []) as Array<{
        day_of_week: number;
        opens_at: string | null;
        closes_at: string | null;
        is_closed: boolean;
      }>;

      if (rows.length > 0) {
        const byDay = new Map(rows.map((r) => [r.day_of_week, r]));
        setDays(
          DEFAULT_DAYS.map((d) => {
            const row = byDay.get(d.day_of_week);
            if (!row) return d;
            return {
              day_of_week: d.day_of_week,
              opens_at: (row.opens_at ?? "09:00").slice(0, 5),
              closes_at: (row.closes_at ?? "17:00").slice(0, 5),
              is_closed: row.is_closed,
            };
          })
        );
      } else {
        setDays(DEFAULT_DAYS);
      }

      if (locRes.data?.appointment_mode) {
        setMode(locRes.data.appointment_mode);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  function updateDay(dayOfWeek: number, patch: Partial<DayState>) {
    setDays((prev) =>
      prev.map((d) => (d.day_of_week === dayOfWeek ? { ...d, ...patch } : d))
    );
  }

  async function save() {
    if (!locationId) return;
    setSaving(true);
    const res = await fetch("/api/clinic/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ practice_location_id: locationId, days, appointment_mode: mode }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Booking settings saved.");
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Could not save.");
    }
  }

  if (!locationId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Online Booking</h1>
        <p className="mt-2 text-sm text-ow-text-secondary">Add a practice first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ow-ink">Online Booking</h1>
          <p className="mt-1 text-sm text-ow-text-secondary">
            Set the hours patients can request appointments.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || loading}
          className="inline-flex items-center gap-1.5 rounded-ow-md bg-ow-brand px-4 py-2 text-sm font-semibold text-white hover:bg-ow-brand-hover disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save changes
        </button>
      </div>

      <section className="rounded-ow-lg border border-ow-line bg-white p-5">
        <h2 className="text-base font-semibold text-ow-ink">Booking mode</h2>
        <div className="mt-3 space-y-2">
          {[
            {
              value: "enquiry_only",
              label: "Enquiry only",
              sub: "Patients send an enquiry; you contact them to book.",
            },
            {
              value: "manual_availability",
              label: "Availability requests",
              sub: "Patients request a slot within your published hours.",
            },
            {
              value: "integrated",
              label: "Integrated calendar",
              sub: "Bookings sync with your practice calendar (coming soon).",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-ow-md border p-3 transition ${
                mode === opt.value
                  ? "border-ow-brand bg-ow-bg-tint"
                  : "border-ow-line hover:border-ow-line-strong"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={opt.value}
                checked={mode === opt.value}
                onChange={(e) => setMode(e.target.value)}
                className="mt-0.5 h-4 w-4 text-ow-brand focus:ring-ow-brand"
              />
              <span>
                <span className="block text-sm font-medium text-ow-ink">{opt.label}</span>
                <span className="block text-xs text-ow-text-muted">{opt.sub}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-ow-lg border border-ow-line bg-white p-5">
        <h2 className="text-base font-semibold text-ow-ink">Weekly hours</h2>
        {loading ? (
          <p className="mt-3 text-sm text-ow-text-muted">Loading…</p>
        ) : (
          <ul className="mt-3 divide-y divide-ow-line">
            {DAYS.map((day) => {
              const d = days.find((x) => x.day_of_week === day.index)!;
              return (
                <li key={day.index} className="flex flex-wrap items-center gap-3 py-3">
                  <label className="flex w-32 items-center gap-2 text-sm font-medium text-ow-ink">
                    <input
                      type="checkbox"
                      checked={!d.is_closed}
                      onChange={(e) => updateDay(day.index, { is_closed: !e.target.checked })}
                      className="h-4 w-4 rounded-ow-xs border-ow-line-strong text-ow-brand focus:ring-ow-brand"
                    />
                    {day.label}
                  </label>
                  {d.is_closed ? (
                    <span className="text-sm text-ow-text-muted">Closed</span>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-ow-text-secondary">
                      <input
                        type="time"
                        value={d.opens_at}
                        onChange={(e) => updateDay(day.index, { opens_at: e.target.value })}
                        className="rounded-ow-xs border border-ow-line-strong px-2 py-1 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
                        aria-label={`${day.label} opening time`}
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={d.closes_at}
                        onChange={(e) => updateDay(day.index, { closes_at: e.target.value })}
                        className="rounded-ow-xs border border-ow-line-strong px-2 py-1 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
                        aria-label={`${day.label} closing time`}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
