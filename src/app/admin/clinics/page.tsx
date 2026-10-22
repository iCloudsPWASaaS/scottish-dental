import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { AccountNotReady } from "@/components/account-not-ready";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ClinicsAdminTable } from "@/components/clinics-admin-table";

export const metadata = { title: "Clinic registrations" };
export const dynamic = "force-dynamic";

export default async function AdminClinicsPage() {
  const ctx = await getAuthContext();
  if (!ctx.user) redirect("/login?next=/admin/clinics");
  // Session without profile must not bounce to /login (middleware loops back).
  if (!ctx.profile) return <AccountNotReady email={ctx.user.email} />;

  if (!["admin", "super_admin"].includes(ctx.profile.role)) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: organisations } = await supabase
    .from("organisations")
    .select(
      `id, name, created_at,
       owner:profiles!organisations_owner_id_fkey(id, email, full_name),
       credentials:clinic_credentials(login_email, login_password),
       locations:practice_locations(id, name, town, postcode, status, rating)`
    )
    .order("created_at", { ascending: false });

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-slate-900">Clinic registrations</h1>
      <p className="mt-1 text-slate-600">
        Every registered clinic with its portal login credentials. Reveal, copy
        or reset a clinic portal password, and approve or suspend its listings.
      </p>
      <ClinicsAdminTable clinics={(organisations ?? []) as never} />
    </div>
  );
}
