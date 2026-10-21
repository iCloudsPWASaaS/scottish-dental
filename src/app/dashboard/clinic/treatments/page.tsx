"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLocations } from "@/components/dashboard/providers";
import { toast } from "sonner";

interface TreatmentRow {
  id: string;
  title: string;
  category: string;
}

interface TreatmentState {
  treatment_id: string;
  is_offered: boolean;
  nhs_available: boolean;
  private_available: boolean;
  price_from: number | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General Dentistry",
  emergency: "Emergency Dentistry",
  hygiene: "Hygiene & Cleaning",
  restorative: "Restorative Dentistry",
  cosmetic: "Cosmetic Dentistry",
  orthodontic: "Orthodontics",
  implants: "Dental Implants",
  oral_surgery: "Oral Surgery",
  sedation: "Sedation Dentistry",
};

export default function ClinicTreatmentsPage() {
  const { locations, selectedId } = useLocations();
  const locationId = selectedId ?? locations[0]?.id ?? null;

  const [catalogue, setCatalogue] = useState<TreatmentRow[]>([]);
  const [states, setStates] = useState<Map<string, TreatmentState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      const [catalogueRes, offeredRes, pricesRes] = await Promise.all([
        supabase.from("treatments").select("id, title, category").order("category"),
        locationId
          ? supabase
              .from("practice_treatments")
              .select("treatment_id, is_offered, nhs_available, private_available")
              .eq("practice_location_id", locationId)
          : Promise.resolve({ data: [] }),
        locationId
          ? supabase
              .from("prices")
              .select("treatment_id, amount")
              .eq("practice_location_id", locationId)
              .eq("price_type", "from")
          : Promise.resolve({ data: [] }),
      ]);

      if (cancelled) return;

      const rows = (catalogueRes.data ?? []) as TreatmentRow[];
      setCatalogue(rows);

      const offeredMap = new Map(
        ((offeredRes.data ?? []) as Array<{
          treatment_id: string;
          is_offered: boolean;
          nhs_available: boolean;
          private_available: boolean;
        }>).map((r) => [r.treatment_id, r])
      );
      const priceMap = new Map(
        ((pricesRes.data ?? []) as Array<{ treatment_id: string; amount: number | null }>).map(
          (r) => [r.treatment_id, r.amount]
        )
      );

      setStates(
        new Map(
          rows.map((t) => [
            t.id,
            {
              treatment_id: t.id,
              is_offered: offeredMap.get(t.id)?.is_offered ?? false,
              nhs_available: offeredMap.get(t.id)?.nhs_available ?? false,
              private_available: offeredMap.get(t.id)?.private_available ?? true,
              price_from: priceMap.get(t.id) ?? null,
            },
          ])
        )
      );
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  const grouped = useMemo(() => {
    const groups = new Map<string, TreatmentRow[]>();
    for (const t of catalogue) {
      const list = groups.get(t.category) ?? [];
      list.push(t);
      groups.set(t.category, list);
    }
    return [...groups.entries()];
  }, [catalogue]);

  function update(id: string, patch: Partial<TreatmentState>) {
    setStates((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current) next.set(id, { ...current, ...patch });
      return next;
    });
  }

  async function save() {
    if (!locationId) return;
    setSaving(true);
    const items = [...states.values()].filter(
      (s) => s.is_offered || s.price_from !== null || s.nhs_available
    );

    const res = await fetch("/api/clinic/treatments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ practice_location_id: locationId, items }),
    });

    setSaving(false);
    if (res.ok) {
      toast.success("Services saved.");
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Could not save services.");
    }
  }

  if (!locationId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Services</h1>
        <p className="mt-2 text-sm text-ow-text-secondary">
          Add a practice first to manage your services.
        </p>
      </div>
    );
  }

  const offeredCount = [...states.values()].filter((s) => s.is_offered).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ow-ink">Services</h1>
          <p className="mt-1 text-sm text-ow-text-secondary">
            {loading
              ? "Loading…"
              : `${offeredCount} of ${catalogue.length} treatments offered`}
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

      {loading ? (
        <p className="text-sm text-ow-text-muted">Loading treatments…</p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, treatments]) => (
            <section key={category} className="rounded-ow-lg border border-ow-line bg-white p-5">
              <h2 className="text-base font-semibold text-ow-ink">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <ul className="mt-3 divide-y divide-ow-line">
                {treatments.map((t) => {
                  const s = states.get(t.id);
                  if (!s) return null;
                  return (
                    <li key={t.id} className="flex flex-wrap items-center gap-3 py-3">
                      <label className="flex min-w-0 flex-1 items-center gap-2.5 text-sm">
                        <input
                          type="checkbox"
                          checked={s.is_offered}
                          onChange={(e) => update(t.id, { is_offered: e.target.checked })}
                          className="h-4 w-4 rounded-ow-xs border-ow-line-strong text-ow-brand focus:ring-ow-brand"
                        />
                        <span className={`truncate ${s.is_offered ? "font-medium text-ow-ink" : "text-ow-text-muted"}`}>
                          {t.title}
                        </span>
                        {s.is_offered && (
                          <Check size={14} className="shrink-0 text-ow-success-text" aria-label="Offered" />
                        )}
                      </label>

                      {s.is_offered && (
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-ow-text-secondary">
                            <input
                              type="checkbox"
                              checked={s.nhs_available}
                              onChange={(e) => update(t.id, { nhs_available: e.target.checked })}
                              className="h-3.5 w-3.5 rounded-ow-xs border-ow-line-strong text-ow-brand focus:ring-ow-brand"
                            />
                            NHS
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-ow-text-secondary">
                            <input
                              type="checkbox"
                              checked={s.private_available}
                              onChange={(e) => update(t.id, { private_available: e.target.checked })}
                              className="h-3.5 w-3.5 rounded-ow-xs border-ow-line-strong text-ow-brand focus:ring-ow-brand"
                            />
                            Private
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-ow-text-secondary">
                            From £
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={s.price_from ?? ""}
                              placeholder="—"
                              onChange={(e) =>
                                update(t.id, {
                                  price_from: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              className="w-20 rounded-ow-xs border border-ow-line-strong px-2 py-1 text-xs text-ow-ink focus:border-ow-brand focus:outline-none"
                            />
                          </label>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
