"use client";

import { useState } from "react";

interface Prospect {
  id: string;
  practice_name: string;
  postcode: string | null;
  local_authority: string | null;
  status: string;
  general_email: string | null;
  attempts: number;
  do_not_contact: boolean;
  created_at: string;
}

export function ProspectsTable({ prospects }: { prospects: Prospect[] }) {
  const [items, setItems] = useState(prospects);
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = items.filter((p) =>
    p.practice_name.toLowerCase().includes(filter.toLowerCase())
  );

  async function createProspect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        practice_name: data.get("practice_name"),
        postcode: data.get("postcode") || undefined,
        local_authority: data.get("local_authority") || undefined,
        general_email: data.get("general_email") || undefined,
        website: data.get("website") || undefined,
        source_url: data.get("source_url") || undefined,
        source_type: data.get("source_type") || undefined,
        notes: data.get("notes") || undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not create prospect");
      return;
    }
    setItems((prev) => [json.data.prospect, ...prev]);
    setShowCreate(false);
    (e.target as HTMLFormElement).reset();
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const json = await res.json();
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...json.data.prospect } : p))
      );
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Filter by name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-xs"
          aria-label="Filter prospects"
        />
        <button onClick={() => setShowCreate((v) => !v)} className="btn-primary">
          {showCreate ? "Close" : "Add prospect"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createProspect} className="card mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Practice name</label>
            <input name="practice_name" required className="input" />
          </div>
          <div>
            <label className="label">Postcode</label>
            <input name="postcode" className="input" />
          </div>
          <div>
            <label className="label">Local authority</label>
            <input name="local_authority" className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="general_email" type="email" className="input" />
          </div>
          <div>
            <label className="label">Website</label>
            <input name="website" type="url" className="input" />
          </div>
          <div>
            <label className="label">Source URL</label>
            <input name="source_url" type="url" className="input" />
          </div>
          <div>
            <label className="label">Source type</label>
            <input name="source_type" className="input" />
          </div>
          <div>
            <label className="label">Notes</label>
            <input name="notes" className="input" />
          </div>
          <div className="sm:col-span-2">
            {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
            <button type="submit" className="btn-primary">Save prospect</button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <p className="mt-6 text-slate-600">No prospects found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">Practice</th>
                <th className="py-2 pr-4 font-medium">Region</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Attempts</th>
                <th className="py-2 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">
                    <p className="font-medium text-slate-900">{p.practice_name}</p>
                    <p className="text-xs text-slate-500">{p.general_email}</p>
                    {p.do_not_contact && (
                      <span className="badge bg-red-100 text-red-700">Do not contact</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">
                    {p.local_authority ?? "—"}
                    {p.postcode ? ` (${p.postcode})` : ""}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">{p.status}</td>
                  <td className="py-2 pr-4 text-slate-600">{p.attempts}</td>
                  <td className="py-2">
                    <select
                      className="input w-40 py-1 text-xs"
                      value={p.status}
                      onChange={(e) => updateStatus(p.id, e.target.value)}
                      aria-label={`Status for ${p.practice_name}`}
                    >
                      {[
                        "identified",
                        "deduplicated",
                        "verified",
                        "awaiting_contact",
                        "outreach_sent",
                        "interested",
                        "follow_up",
                        "invitation_sent",
                        "registered",
                        "authority_verified",
                        "profile_completed",
                        "admin_review",
                        "published",
                        "no_response",
                        "declined",
                        "do_not_contact",
                        "suspended",
                        "verification_failed",
                        "archived",
                      ].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
