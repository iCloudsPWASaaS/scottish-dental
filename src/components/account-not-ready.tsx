"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, UserCircle } from "lucide-react";

/**
 * Shown when a user has a valid session but no usable profile row.
 * Redirecting to /login here would loop forever (middleware sends
 * authenticated users straight back to /dashboard).
 */
export function AccountNotReady({ email }: { email?: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ow-bg-soft px-4 font-ow">
      <div className="w-full max-w-md rounded-ow-lg border border-ow-line bg-white p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-ow-xl bg-ow-bg-tint text-ow-brand">
          <UserCircle size={24} aria-hidden />
        </span>
        <h1 className="mt-4 text-lg font-bold text-ow-ink">Account not ready</h1>
        <p className="mt-2 text-sm text-ow-text-secondary">
          We could not find a profile for{" "}
          <span className="font-medium text-ow-ink">{email ?? "this account"}</span>.
          If you signed up moments ago, try reloading — otherwise sign out and
          sign back in.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-ow-md bg-ow-brand px-4 py-2 text-sm font-semibold text-white hover:bg-ow-brand-hover"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-ow-md border border-ow-line-strong px-4 py-2 text-sm font-medium text-ow-text-secondary transition hover:bg-ow-bg-soft disabled:opacity-60"
          >
            <LogOut size={14} aria-hidden />
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
