import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { AccountNotReady } from "@/components/account-not-ready";
import { UsersAdmin } from "@/components/users-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Users & roles" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const ctx = await getAuthContext();
  if (!ctx.user) redirect("/login?next=/admin/users");
  // Session without profile must not bounce to /login (middleware loops back).
  if (!ctx.profile) return <AccountNotReady email={ctx.user.email} />;
  if (!["admin", "super_admin"].includes(ctx.profile.role)) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-slate-900">Users &amp; roles</h1>
      <p className="mt-1 text-slate-600">
        Privileged roles can only be assigned here by an administrator.
      </p>
      <UsersAdmin profiles={(profiles ?? []) as never} />
    </div>
  );
}
