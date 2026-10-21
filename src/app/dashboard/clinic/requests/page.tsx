"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth, useLocations } from "@/components/dashboard/providers";
import { toast } from "sonner";

interface Member {
  id: string;
  profile_id: string | null;
  membership_role: string;
  created_at: string;
  profiles: { email: string; full_name: string | null } | null;
}

interface Invite {
  id: string;
  invited_email: string | null;
  invited_at: string | null;
  status: string;
}

export default function ClinicRequestsPage() {
  const { profile } = useAuth();
  const { locations } = useLocations();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [linking, setLinking] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/clinic/invitations");
    if (res.ok) {
      const json = await res.json();
      setMembers(json.data.members ?? []);
      setInvites(json.data.invites ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations.length]);

  async function linkPending() {
    setLinking(true);
    const res = await fetch("/api/clinic/link-invitations", { method: "POST" });
    setLinking(false);
    if (res.ok) {
      const json = await res.json();
      if (json.data.linked > 0) {
        toast.success(`Linked ${json.data.linked} invitation(s) to your account.`);
        load();
      } else {
        toast.info("No pending invitations for your email.");
      }
    }
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    const res = await fetch("/api/clinic/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => ({}));
    setInviting(false);
    if (!res.ok) {
      toast.error(json.error ?? "Could not send invitation.");
      return;
    }
    toast.success(
      json.data.invite?.status === "active"
        ? "Added to your practice."
        : "Invitation sent. They can join by signing up with that email."
    );
    setEmail("");
    load();
  }

  async function revoke(id: string) {
    const res = await fetch(`/api/clinic/invitations?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Removed.");
      load();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Could not remove.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Requests</h1>
        <p className="mt-1 text-sm text-ow-text-secondary">
          Invite team members to help manage your practice listing.
        </p>
      </div>

      <section className="rounded-ow-lg border border-ow-line bg-white p-5">
        <h2 className="text-base font-semibold text-ow-ink">Invite a team member</h2>
        <form onSubmit={invite} className="mt-3 flex flex-wrap gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@practice.co.uk"
            className="min-w-0 flex-1 rounded-ow-md border border-ow-line-strong px-3 py-2 text-sm text-ow-ink placeholder-ow-text-muted focus:border-ow-brand focus:outline-none"
          />
          <button
            type="submit"
            disabled={inviting}
            className="inline-flex items-center gap-1.5 rounded-ow-md bg-ow-brand px-4 py-2 text-sm font-semibold text-white hover:bg-ow-brand-hover disabled:opacity-60"
          >
            {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Invite
          </button>
        </form>
        <p className="mt-2 text-xs text-ow-text-muted">
          If they already have an account they are added immediately. Otherwise they
          join automatically when they sign up with that email.
        </p>
        <button
          type="button"
          onClick={linkPending}
          disabled={linking}
          className="mt-3 inline-flex items-center gap-1.5 rounded-ow-md border border-ow-line-strong px-3 py-1.5 text-xs font-semibold text-ow-text-secondary hover:bg-ow-bg-soft disabled:opacity-60"
        >
          {linking && <Loader2 size={12} className="animate-spin" />}
          Link invitations to my account
        </button>
      </section>

      <section className="rounded-ow-lg border border-ow-line bg-white p-5">
        <h2 className="text-base font-semibold text-ow-ink">Pending invitations</h2>
        {loading ? (
          <p className="mt-3 text-sm text-ow-text-muted">Loading…</p>
        ) : invites.length === 0 ? (
          <p className="mt-3 text-sm text-ow-text-muted">No pending invitations.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ow-line">
            {invites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ow-ink">{inv.invited_email}</p>
                  <p className="text-xs text-ow-text-muted">
                    Invited {inv.invited_at ? new Date(inv.invited_at).toLocaleDateString("en-GB") : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => revoke(inv.id)}
                  aria-label={`Revoke invitation for ${inv.invited_email}`}
                  className="rounded-ow-md p-2 text-ow-text-muted hover:bg-ow-danger-bg hover:text-ow-danger-text"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-ow-lg border border-ow-line bg-white p-5">
        <h2 className="text-base font-semibold text-ow-ink">Practice team</h2>
        {loading ? (
          <p className="mt-3 text-sm text-ow-text-muted">Loading…</p>
        ) : members.length === 0 ? (
          <p className="mt-3 text-sm text-ow-text-muted">
            No members yet{profile ? ` — you (${profile.email}) will appear here once your practice exists.` : "."}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-ow-line">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ow-ink">
                    {m.profiles?.full_name ?? m.profiles?.email ?? "Member"}
                  </p>
                  <p className="text-xs text-ow-text-muted">{m.profiles?.email}</p>
                </div>
                <span className="rounded-ow-xs bg-ow-bg-tint px-2 py-0.5 text-[11px] font-medium text-ow-brand">
                  {m.membership_role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
