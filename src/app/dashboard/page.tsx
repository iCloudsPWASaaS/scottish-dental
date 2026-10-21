import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { AccountNotReady } from "@/components/account-not-ready";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await getAuthContext();
  if (!ctx.user) redirect("/login?next=/dashboard");
  // Never redirect a sessioned user to /login: middleware sends them
  // straight back here, producing an infinite loop.
  if (!ctx.profile) return <AccountNotReady email={ctx.user.email} />;

  switch (ctx.profile.role) {
    case "patient":
      redirect("/patient");
    case "business_development":
      redirect("/admin/prospects");
    case "admin":
    case "super_admin":
      redirect("/admin");
    default:
      redirect("/dashboard/clinic");
  }
}
