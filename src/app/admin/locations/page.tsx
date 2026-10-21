import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { AccountNotReady } from "@/components/account-not-ready";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LocationsAdminTable } from "@/components/locations-admin-table";

export const metadata = { title: "Listings & approvals" };
export const dynamic = "force-dynamic";

export default async function AdminLocationsPage() {
  const ctx = await getAuthContext();
  if (!ctx.user) redirect("/login?next=/admin/locations");
  // Session without profile must not bounce to /login (middleware loops back).
  if (!ctx.profile) return <AccountNotReady email={ctx.user.email} />;

  if (!["admin", "super_admin"].includes(ctx.profile.role)) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: locations } = await supabase
    .from("practice_locations")
    .select(
      "id, name, slug, postcode, local_authority, nhs_board, nhs_private, status, published_at, last_confirmed_at, organisation:organisations(id, name)"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-slate-900">Listings &amp; approvals</h1>
      <p className="mt-1 text-slate-600">
        Approve, request changes or suspend live listings. Approval is the only
        path to publication.
      </p>
      <LocationsAdminTable locations={(locations ?? []) as never} />
    </div>
  );
}
