import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth";
import { EnquiryList } from "@/components/enquiry-list";

export const metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

export default async function ClinicEnquiriesPage() {
  const ctx = await getAuthContext();
  if (!ctx.user || !ctx.profile) {
    return <p className="text-sm text-ow-text-muted">Sign in to view enquiries.</p>;
  }

  const isAdmin = ["admin", "super_admin"].includes(ctx.profile.role);
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("enquiries")
    .select(
      "*, practice:practice_locations(id, name, slug), treatment:treatments(id, title)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (!isAdmin) {
    const { data: locations } = await supabase
      .from("practice_locations")
      .select("id")
      .eq("organisation_id", ctx.profile.organisation_id ?? "");
    const ids = (locations ?? []).map((l) => l.id);
    if (ids.length === 0) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-ow-ink">Enquiries</h1>
            <p className="mt-1 text-sm text-ow-text-secondary">
              Enquiries are requests, not confirmed bookings.
            </p>
          </div>
          <p className="text-sm text-ow-text-muted">No enquiries yet.</p>
        </div>
      );
    }
    query = query.in("practice_location_id", ids);
  }

  const { data: enquiries } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Enquiries</h1>
        <p className="mt-1 text-sm text-ow-text-secondary">
          Enquiries are requests, not confirmed bookings. Respond quickly to convert
          more patients.
        </p>
      </div>
      <EnquiryList enquiries={(enquiries ?? []) as never} />
    </div>
  );
}
