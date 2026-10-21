import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { AccountNotReady } from "@/components/account-not-ready";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Audit trail" };
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const ctx = await getAuthContext();
  if (!ctx.user) redirect("/login?next=/admin/audit");
  // Session without profile must not bounce to /login (middleware loops back).
  if (!ctx.profile) return <AccountNotReady email={ctx.user.email} />;
  if (!["admin", "super_admin"].includes(ctx.profile.role)) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: events } = await supabase
    .from("audit_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-slate-900">Audit trail</h1>
      <p className="mt-1 text-slate-600">Platform changes and operator activity.</p>

      {(!events || events.length === 0) ? (
        <p className="mt-6 text-slate-600">No audit events recorded yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">When</th>
                <th className="py-2 pr-4 font-medium">Action</th>
                <th className="py-2 pr-4 font-medium">Entity</th>
                <th className="py-2 font-medium">Actor</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-600">
                    {new Date(e.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="py-2 pr-4 font-medium text-slate-900">{e.action}</td>
                  <td className="py-2 pr-4 text-slate-600">{e.entity}</td>
                  <td className="py-2 text-slate-600">
                    {e.actor_id ? (
                      <Link href={`/admin/users?id=${e.actor_id}`} className="text-brand-700 hover:underline">
                        {e.actor_id.slice(0, 8)}â€¦
                      </Link>
                    ) : (
                      "system"
                    )}
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
