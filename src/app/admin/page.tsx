import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { AccountNotReady } from "@/components/account-not-ready";

export const metadata = { title: "Admin console" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const ctx = await getAuthContext();
  if (!ctx.user) redirect("/login?next=/admin");
  // Session without profile must not bounce to /login (middleware loops back).
  if (!ctx.profile) return <AccountNotReady email={ctx.user.email} />;

  const isAdmin = ["admin", "super_admin"].includes(ctx.profile.role);
  const isOperator = isAdmin || ctx.profile.role === "business_development";

  if (!isOperator) redirect("/dashboard");

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin console</h1>
      <p className="mt-1 text-slate-600">Signed in as {ctx.profile.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isOperator && (
          <Link href="/admin/prospects" className="card transition hover:border-brand-300">
            <h2 className="font-semibold text-slate-900">Acquisition CRM</h2>
            <p className="mt-1 text-sm text-slate-600">
              Private prospect research, outreach and invitations.
            </p>
          </Link>
        )}
        {isAdmin && (
          <>
            <Link href="/admin/locations" className="card transition hover:border-brand-300">
              <h2 className="font-semibold text-slate-900">Listings &amp; approvals</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review, approve, suspend or deactivate live practice listings.
              </p>
            </Link>
            <Link href="/admin/audit" className="card transition hover:border-brand-300">
              <h2 className="font-semibold text-slate-900">Audit trail</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review platform changes and operator activity.
              </p>
            </Link>
            <Link href="/admin/users" className="card transition hover:border-brand-300">
              <h2 className="font-semibold text-slate-900">Users &amp; roles</h2>
              <p className="mt-1 text-sm text-slate-600">
                Assign platform roles and manage access.
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
