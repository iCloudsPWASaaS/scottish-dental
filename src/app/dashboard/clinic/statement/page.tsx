"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth, useLocations } from "@/components/dashboard/providers";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string | null;
  created_at: string;
}

export default function ClinicStatementPage() {
  const { profile } = useAuth();
  const { locations } = useLocations();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!profile?.organisation_id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      const [subRes, payRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("id, plan, status, starts_at, ends_at")
          .eq("organisation_id", profile.organisation_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("payments")
          .select("id, amount, currency, status, provider, created_at")
          .eq("organisation_id", profile.organisation_id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (cancelled) return;
      setSubscription((subRes.data as Subscription) ?? null);
      setPayments((payRes.data as Payment[]) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.organisation_id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Statement</h1>
        <p className="mt-1 text-sm text-ow-text-secondary">
          Your plan and payment history.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ow-text-muted">Loading…</p>
      ) : (
        <>
          <section className="rounded-ow-lg border border-ow-line bg-white p-5">
            <h2 className="text-base font-semibold text-ow-ink">Current plan</h2>
            {subscription ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-bold capitalize text-ow-ink">{subscription.plan}</p>
                  <p className="text-sm text-ow-text-muted">
                    Status: {subscription.status} · Since{" "}
                    {new Date(subscription.starts_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <span
                  className={`rounded-ow-xs px-2 py-0.5 text-xs font-medium ${
                    subscription.status === "active" || subscription.status === "trialing"
                      ? "bg-ow-success-bg text-ow-success-text"
                      : "bg-ow-warning-bg text-ow-warning-text"
                  }`}
                >
                  {subscription.status}
                </span>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-ow-text-secondary">
                  You are on the free plan. Free practices appear in search and receive
                  enquiries.
                </p>
                <p className="mt-2 text-xs text-ow-text-muted">
                  Premium placement and integrated booking are coming soon — contact us
                  to join the waitlist.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-ow-lg border border-ow-line bg-white p-5">
            <h2 className="text-base font-semibold text-ow-ink">Payment history</h2>
            {payments.length === 0 ? (
              <p className="mt-3 text-sm text-ow-text-muted">No payments yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-ow-line">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ow-ink">
                        £{Number(p.amount).toFixed(2)} {p.currency}
                      </p>
                      <p className="text-xs text-ow-text-muted">
                        {new Date(p.created_at).toLocaleDateString("en-GB")}
                        {p.provider ? ` · ${p.provider}` : ""}
                      </p>
                    </div>
                    <span className="rounded-ow-xs bg-ow-bg-soft px-2 py-0.5 text-[11px] font-medium text-ow-text-secondary">
                      {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {locations.length === 0 && (
            <p className="text-xs text-ow-text-muted">
              Add a practice to activate organisation billing.
            </p>
          )}
        </>
      )}
    </div>
  );
}
