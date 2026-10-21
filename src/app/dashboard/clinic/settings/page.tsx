"use client";

import { useState } from "react";
import { Loader2, LogOut, Save } from "lucide-react";
import { useAuth } from "@/components/dashboard/providers";
import { passwordError } from "@/lib/password";
import { toast } from "sonner";

export default function ClinicSettingsPage() {
  const { profile, signOut } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name, phone }),
    });
    setSavingProfile(false);
    if (res.ok) {
      toast.success("Profile updated.");
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Could not update profile.");
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    const pwError = passwordError(password);
    if (pwError) {
      toast.error(pwError);
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSavingPassword(false);
    if (res.ok) {
      toast.success("Password changed.");
      setPassword("");
      setConfirm("");
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Could not change password.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Settings</h1>
        <p className="mt-1 text-sm text-ow-text-secondary">
          Manage your account details.
        </p>
      </div>

      <section className="rounded-ow-lg border border-ow-line bg-white p-5">
        <h2 className="text-base font-semibold text-ow-ink">Profile</h2>
        <p className="mt-1 text-xs text-ow-text-muted">{profile?.email}</p>
        <form onSubmit={saveProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ow-ink">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="block w-full rounded-ow-md border border-ow-line-strong px-3 py-2 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ow-ink">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full rounded-ow-md border border-ow-line-strong px-3 py-2 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 rounded-ow-md bg-ow-brand px-4 py-2 text-sm font-semibold text-white hover:bg-ow-brand-hover disabled:opacity-60"
            >
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-ow-lg border border-ow-line bg-white p-5">
        <h2 className="text-base font-semibold text-ow-ink">Change password</h2>
        <form onSubmit={savePassword} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ow-ink">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              autoComplete="new-password"
              className="block w-full rounded-ow-md border border-ow-line-strong px-3 py-2 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
            />
            <p className="mt-1 text-xs text-ow-text-muted">
              At least 12 characters, not a common password.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ow-ink">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={12}
              autoComplete="new-password"
              className="block w-full rounded-ow-md border border-ow-line-strong px-3 py-2 text-sm text-ow-ink focus:border-ow-brand focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-1.5 rounded-ow-md border border-ow-line-strong bg-white px-4 py-2 text-sm font-semibold text-ow-text-secondary hover:bg-ow-bg-soft disabled:opacity-60"
            >
              {savingPassword && <Loader2 size={14} className="animate-spin" />}
              Change password
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-ow-lg border border-ow-line bg-white p-5">
        <h2 className="text-base font-semibold text-ow-ink">Session</h2>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 inline-flex items-center gap-1.5 rounded-ow-md border border-ow-line-strong bg-white px-4 py-2 text-sm font-semibold text-ow-text-secondary hover:bg-ow-danger-bg hover:text-ow-danger-text"
        >
          <LogOut size={14} aria-hidden />
          Sign out
        </button>
      </section>
    </div>
  );
}
