"use client";

import { useState } from "react";

interface ClinicLocation {
  id: string;
  name: string;
  town: string | null;
  postcode: string;
  status: string;
  rating: number | null;
}

interface Clinic {
  id: string;
  name: string;
  created_at: string;
  owner: { email: string; full_name: string | null } | null;
  credentials: { login_email: string; login_password: string }[] | null;
  locations: ClinicLocation[];
}

export function ClinicsAdminTable({ clinics }: { clinics: Clinic[] }) {
  const [items, setItems] = useState(clinics);
  const [busy, setBusy] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? items.filter((c) =>
        [c.name, c.owner?.email, c.credentials?.[0]?.login_email, ...(c.locations?.map((l) => l.town ?? "") ?? [])]
          .filter((v): v is string => Boolean(v))
          .some((v) => v.toLowerCase().includes(filter.toLowerCase()))
      )
    : items;

  function cred(clinic: Clinic) {
    return clinic.credentials?.[0];
  }

  function loc(clinic: Clinic) {
    return clinic.locations?.[0];
  }

  function statusOf(clinic: Clinic): string {
    const statuses = (clinic.locations ?? []).map((l) => l.status);
    if (statuses.length === 0) return "no listing";
    if (statuses.every((s) => s === "published")) return "published";
    if (statuses.some((s) => s === "published")) return "mixed";
    return statuses[0];
  }

  async function patchClinic(orgId: string, action: string, newPassword?: string) {
    setBusy(orgId);
    try {
      const res = await fetch("/api/admin/clinics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisation_id: orgId,
          action,
          ...(newPassword ? { new_password: newPassword } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "Action failed");
        return;
      }
      if (action === "reset_password") {
        setItems((prev) =>
          prev.map((c) =>
            c.id === orgId
              ? {
                  ...c,
                  credentials: [
                    {
                      login_email: json.data.login_email,
                      login_password: json.data.login_password,
                    },
                  ],
                }
              : c
          )
        );
        setRevealed((prev) => ({ ...prev, [orgId]: true }));
      } else {
        const newStatus = action === "approve" ? "published" : "suspended";
        setItems((prev) =>
          prev.map((c) =>
            c.id === orgId
              ? {
                  ...c,
                  locations: (c.locations ?? []).map((l) => ({ ...l, status: newStatus })),
                }
              : c
          )
        );
      }
    } finally {
      setBusy(null);
    }
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (items.length === 0) {
    return <p className="mt-6 text-slate-600">No clinic registrations yet.</p>;
  }

  return (
    <div className="mt-6">
      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by clinic, town or email…"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <p className="mt-3 text-sm text-slate-500" role="status">
        {filtered.length} clinic{filtered.length === 1 ? "" : "s"}
      </p>
      <ul className="mt-4 space-y-3">
        {filtered.map((clinic) => {
          const c = cred(clinic);
          const l = loc(clinic);
          const status = statusOf(clinic);
          const isBusy = busy === clinic.id;
          const isOpen = !!revealed[clinic.id];
          return (
            <li key={clinic.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{clinic.name}</p>
                  <p className="text-sm text-slate-600">
                    {l ? `${l.town ? `${l.town}, ` : ""}${l.postcode}` : "No listing"}
                    {l?.rating ? ` · ★ ${l.rating.toFixed(1)}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    Owner: {clinic.owner?.email ?? "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{status}</span>
                  {status === "published" ? (
                    <button
                      onClick={() => patchClinic(clinic.id, "suspend")}
                      disabled={isBusy}
                      className="btn-secondary py-1.5 text-xs"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => patchClinic(clinic.id, "approve")}
                      disabled={isBusy}
                      className="btn-primary py-1.5 text-xs"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => patchClinic(clinic.id, "reset_password")}
                    disabled={isBusy}
                    className="btn-secondary py-1.5 text-xs"
                  >
                    Reset password
                  </button>
                </div>
              </div>

              {c && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Portal login
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-mono text-slate-900">{c.login_email}</span>
                    <button
                      onClick={() => copy(c.login_email, `${clinic.id}-email`)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {copied === `${clinic.id}-email` ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-mono text-slate-900">
                      {isOpen ? c.login_password : "••••••••"}
                    </span>
                    <button
                      onClick={() =>
                        setRevealed((prev) => ({ ...prev, [clinic.id]: !isOpen }))
                      }
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {isOpen ? "Hide" : "Reveal"}
                    </button>
                    <button
                      onClick={() => copy(c.login_password, `${clinic.id}-pw`)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {copied === `${clinic.id}-pw` ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
