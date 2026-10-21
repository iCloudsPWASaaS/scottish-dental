"use client";

import { useState } from "react";

interface Location {
  id: string;
  name: string;
  slug: string;
  postcode: string;
  local_authority: string | null;
  nhs_private: string;
  status: string;
  published_at: string | null;
  organisation?: { name: string } | null;
}

export function LocationsAdminTable({ locations }: { locations: Location[] }) {
  const [items, setItems] = useState(locations);
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(id: string, decision: "approve" | "reject" | "request_changes") {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_id: id, decision }),
      });
      if (res.ok) {
        const json = await res.json();
        setItems((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...json.data.location } : l))
        );
      }
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return <p className="mt-6 text-slate-600">No locations to review.</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {items.map((loc) => (
        <li key={loc.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{loc.name}</p>
              <p className="text-sm text-slate-600">
                {loc.postcode}
                {loc.local_authority ? `, ${loc.local_authority}` : ""}
              </p>
              <p className="text-xs text-slate-500">
                {loc.organisation?.name ?? "—"} · {loc.nhs_private}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge bg-slate-100 text-slate-700">{loc.status}</span>
              {loc.status !== "published" && (
                <button
                  onClick={() => decide(loc.id, "approve")}
                  disabled={busy === loc.id}
                  className="btn-primary py-1.5 text-xs"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => decide(loc.id, "request_changes")}
                disabled={busy === loc.id}
                className="btn-secondary py-1.5 text-xs"
              >
                Request changes
              </button>
              {loc.status === "published" && (
                <button
                  onClick={() => decide(loc.id, "reject")}
                  disabled={busy === loc.id}
                  className="btn-secondary py-1.5 text-xs"
                >
                  Suspend
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
