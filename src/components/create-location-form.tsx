"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateLocationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = new FormData(e.currentTarget);

    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        address: data.get("address"),
        postcode: data.get("postcode"),
        local_authority: data.get("local_authority") || undefined,
        nhs_board: data.get("nhs_board") || undefined,
        phone: data.get("phone") || undefined,
        email: data.get("email") || undefined,
        website: data.get("website") || undefined,
        nhs_private: data.get("nhs_private"),
        accepting_new_nhs: data.get("accepting_new_nhs") === "on",
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not create location");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/clinic/listing?practice=${json.data.location.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label">Practice name</label>
        <input name="name" required minLength={2} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Address</label>
        <input name="address" required className="input" />
      </div>
      <div>
        <label className="label">Postcode</label>
        <input name="postcode" required className="input" />
      </div>
      <div>
        <label className="label">Local authority</label>
        <input name="local_authority" className="input" />
      </div>
      <div>
        <label className="label">NHS board</label>
        <input name="nhs_board" className="input" />
      </div>
      <div>
        <label className="label">Phone</label>
        <input name="phone" className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" className="input" />
      </div>
      <div>
        <label className="label">Website</label>
        <input name="website" type="url" className="input" />
      </div>
      <div>
        <label className="label">NHS / Private</label>
        <select name="nhs_private" className="input" defaultValue="private">
          <option value="private">Private</option>
          <option value="nhs">NHS</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="accepting_new_nhs" />
        Accepting new NHS patients
      </label>

      {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}

      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating…" : "Create location"}
        </button>
      </div>
    </form>
  );
}
