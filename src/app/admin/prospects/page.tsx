import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { AccountNotReady } from "@/components/account-not-ready";
import { ProspectsTable } from "@/components/prospects-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Acquisition CRM" };
export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const ctx = await getAuthContext();
  if (!ctx.user) redirect("/login?next=/admin/prospects");
  // Session without profile must not bounce to /login (middleware loops back).
  if (!ctx.profile) return <AccountNotReady email={ctx.user.email} />;

  const isOperator = ["business_development", "admin", "super_admin"].includes(
    ctx.profile.role
  );
  if (!isOperator) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: prospects } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-slate-900">Acquisition CRM</h1>
      <p className="mt-1 text-slate-600">
        Private prospect records. These never appear on any public page.
      </p>
      <ProspectsTable prospects={(prospects ?? []) as never} />
    </div>
  );
}
