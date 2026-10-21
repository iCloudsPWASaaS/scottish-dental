"use client";

import { useState } from "react";

interface EnquiryRow {
  id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
  practice?: { name: string } | null;
  treatment?: { title: string } | null;
}

const NEXT_STATUSES = [
  "acknowledged",
  "contacted",
  "converted",
  "closed",
  "declined",
] as const;

export function EnquiryList({ enquiries }: { enquiries: EnquiryRow[] }) {
  const [items, setItems] = useState(enquiries);
  const [busy, setBusy] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        setItems((prev) =>
          prev.map((e) => (e.id === id ? { ...e, ...json.data.enquiry } : e))
        );
      }
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return <p className="mt-6 text-slate-600">No enquiries yet.</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {items.map((e) => (
        <li key={e.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{e.patient_name}</p>
              <p className="text-sm text-slate-600">
                {e.patient_email}
                {e.patient_phone ? ` · ${e.patient_phone}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {e.practice?.name}
                {e.treatment ? ` — ${e.treatment.title}` : ""}
              </p>
              {e.message && (
                <p className="mt-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-700">
                  {e.message}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="badge bg-slate-100 text-slate-700">{e.status}</span>
              <select
                className="input w-40 py-1 text-xs"
                value={e.status}
                disabled={busy === e.id}
                onChange={(ev) => updateStatus(e.id, ev.target.value)}
                aria-label={`Update status for enquiry from ${e.patient_name}`}
              >
                {[e.status, ...NEXT_STATUSES.filter((s) => s !== e.status)].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
