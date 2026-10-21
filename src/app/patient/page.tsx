import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";

export const metadata = { title: "Patient portal" };

export default async function PatientPortalPage() {
  const ctx = await getAuthContext();
  if (!ctx.user) redirect("/login?next=/patient");

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-slate-900">Patient portal</h1>
      <p className="mt-1 text-slate-600">
        Welcome back{ctx.profile?.full_name ? `, ${ctx.profile.full_name}` : ""}.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold text-slate-900">Find a dentist</h2>
          <p className="mt-2 text-sm text-slate-600">
            Search verified practices by postcode or town and send an enquiry.
          </p>
          <Link href="/search" className="btn-primary mt-4">Search practices</Link>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-900">Your enquiries</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enquiry history will appear here in a future release. For now,
            contact the practice directly to check the status of a request.
          </p>
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Reminder: an enquiry is a request, not a confirmed booking.
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Signed in as {ctx.user.email}
      </p>
    </div>
  );
}
