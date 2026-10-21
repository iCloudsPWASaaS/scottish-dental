"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Location {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string;
  postcode: string;
  local_authority: string | null;
  nhs_private: string;
  accepting_new_nhs: boolean;
  bio: string | null;
  image_url: string | null;
}

export function LocationEditor({ location }: { location: Location }) {
  const router = useRouter();
  const [state, setState] = useState(location);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const res = await fetch(`/api/locations/${location.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not update location");
      setLoading(false);
      return;
    }

    setMessage(
      json.data.location.status === "in_review"
        ? "Saved. Material changes have been sent for review."
        : "Saved."
    );
    setState((prev) => ({ ...prev, ...json.data.location }));
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label">Practice name</label>
        <input
          className="input"
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Address</label>
        <input
          className="input"
          value={state.address}
          onChange={(e) => setState({ ...state, address: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Postcode</label>
        <input
          className="input"
          value={state.postcode}
          onChange={(e) => setState({ ...state, postcode: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Local authority</label>
        <input
          className="input"
          value={state.local_authority ?? ""}
          onChange={(e) => setState({ ...state, local_authority: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Phone</label>
        <input
          className="input"
          value={state.phone ?? ""}
          onChange={(e) => setState({ ...state, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          value={state.email ?? ""}
          onChange={(e) => setState({ ...state, email: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Website</label>
        <input
          className="input"
          type="url"
          value={state.website ?? ""}
          onChange={(e) => setState({ ...state, website: e.target.value })}
        />
      </div>
      <div>
        <label className="label">NHS / Private</label>
        <select
          className="input"
          value={state.nhs_private}
          onChange={(e) => setState({ ...state, nhs_private: e.target.value })}
        >
          <option value="private">Private</option>
          <option value="nhs">NHS</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={state.accepting_new_nhs}
          onChange={(e) =>
            setState({ ...state, accepting_new_nhs: e.target.checked })
          }
        />
        Accepting new NHS patients
      </label>
      <div className="sm:col-span-2">
        <label className="label">Practice bio</label>
        <textarea
          className="input min-h-[120px]"
          value={state.bio ?? ""}
          placeholder="Tell patients what makes your practice special…"
          onChange={(e) => setState({ ...state, bio: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Practice photo URL</label>
        <input
          className="input"
          type="url"
          value={state.image_url ?? ""}
          placeholder="https://…"
          onChange={(e) => setState({ ...state, image_url: e.target.value })}
        />
      </div>

      {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}
      {message && (
        <p className="text-sm text-emerald-700 sm:col-span-2" role="status">
          {message}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
