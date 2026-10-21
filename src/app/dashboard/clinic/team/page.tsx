"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLocations } from "@/components/dashboard/providers";
import { toast } from "sonner";

interface Clinician {
  id: string;
  full_name: string;
  gdc_number: string | null;
  bio: string | null;
  specialties: string[];
}

export default function ClinicTeamPage() {
  const { locations, selectedId } = useLocations();
  const locationId = selectedId ?? locations[0]?.id ?? null;

  const [team, setTeam] = useState<Clinician[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", gdc_number: "", bio: "", specialties: "" });

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
        .from("clinicians")
        .select("id, full_name, gdc_number, bio, specialties")
        .eq("practice_location_id", locationId)
        .order("full_name");
      if (!cancelled) {
        setTeam((data as Clinician[]) ?? []);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!locationId) return;
    setSaving(true);

    const res = await fetch("/api/clinic/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        practice_location_id: locationId,
        full_name: form.full_name,
        gdc_number: form.gdc_number || undefined,
        bio: form.bio || undefined,
        specialties: form.specialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });

    const json = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      toast.error(json.error ?? "Could not add team member.");
      return;
    }

    setTeam((prev) =>
      [...prev, json.data.clinician as Clinician].sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      )
    );
    setForm({ full_name: "", gdc_number: "", bio: "", specialties: "" });
    setShowForm(false);
    toast.success("Team member added.");
  }

  async function removeMember(id: string) {
    if (!window.confirm("Remove this team member?")) return;
    const res = await fetch(`/api/clinic/team/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTeam((prev) => prev.filter((c) => c.id !== id));
      toast.success("Team member removed.");
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Could not remove.");
    }
  }

  if (!locationId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Team</h1>
        <p className="mt-2 text-sm text-ow-text-secondary">Add a practice first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ow-ink">Team</h1>
          <p className="mt-1 text-sm text-ow-text-secondary">
            {loading ? "Loading…" : `${team.length} team member${team.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-ow-md bg-ow-brand px-4 py-2 text-sm font-semibold text-white hover:bg-ow-brand-hover"
        >
          <Plus size={14} aria-hidden />
          Add team member
        </button>
      </div>

      {showForm && (
        <form onSubmit={addMember} className="space-y-4 rounded-ow-lg border border-ow-line bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ow-ink">Full name</label>
              <input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="block w-full rounded-ow-md border border-ow-line-strong px-3 py-2 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ow-ink">GDC number</label>
              <input
                value={form.gdc_number}
                onChange={(e) => setForm({ ...form, gdc_number: e.target.value })}
                className="block w-full rounded-ow-md border border-ow-line-strong px-3 py-2 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-ow-ink">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="block w-full rounded-ow-md border border-ow-line-strong px-3 py-2 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
                rows={3}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-ow-ink">
                Specialties (comma separated)
              </label>
              <input
                value={form.specialties}
                onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                placeholder="e.g. Orthodontics, Implants"
                className="block w-full rounded-ow-md border border-ow-line-strong px-3 py-2 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-ow-md bg-ow-brand px-4 py-2 text-sm font-semibold text-white hover:bg-ow-brand-hover disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-ow-md border border-ow-line-strong px-4 py-2 text-sm font-medium text-ow-text-secondary hover:bg-ow-bg-soft"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ow-text-muted">Loading…</p>
      ) : team.length === 0 ? (
        <div className="rounded-ow-lg border border-ow-line bg-white p-10 text-center">
          <p className="text-sm text-ow-text-secondary">
            No team members yet. Add your dentists and hygienists to build patient trust.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {team.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 rounded-ow-lg border border-ow-line bg-white p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ow-ink">{c.full_name}</p>
                {c.gdc_number && (
                  <p className="text-xs text-ow-text-muted">GDC {c.gdc_number}</p>
                )}
                {c.bio && <p className="mt-1 text-sm text-ow-text-secondary">{c.bio}</p>}
                {c.specialties?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-ow-xs bg-ow-bg-tint px-2 py-0.5 text-[11px] font-medium text-ow-brand"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeMember(c.id)}
                aria-label={`Remove ${c.full_name}`}
                className="shrink-0 rounded-ow-md p-2 text-ow-text-muted hover:bg-ow-danger-bg hover:text-ow-danger-text"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
