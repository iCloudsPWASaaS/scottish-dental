"use client";

import { useState } from "react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

const ROLES = [
  "patient",
  "practice_owner",
  "practice_member",
  "business_development",
  "admin",
  "super_admin",
];

export function UsersAdmin({ profiles }: { profiles: Profile[] }) {
  const [items, setItems] = useState(profiles);

  async function setRole(userId: string, role: string) {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, role }),
    });
    if (res.ok) {
      const json = await res.json();
      setItems((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, ...json.data.profile } : p))
      );
    }
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Current role</th>
            <th className="py-2 font-medium">Change role</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-b border-slate-100">
              <td className="py-2 pr-4 text-slate-900">{p.email}</td>
              <td className="py-2 pr-4 text-slate-600">{p.full_name ?? "—"}</td>
              <td className="py-2 pr-4 text-slate-600">{p.role}</td>
              <td className="py-2">
                <select
                  className="input w-48 py-1 text-xs"
                  value={p.role}
                  onChange={(e) => setRole(p.id, e.target.value)}
                  aria-label={`Role for ${p.email}`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
