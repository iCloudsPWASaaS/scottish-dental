import { redirect } from "next/navigation";

export default function LegacyNewLocationRedirect() {
  redirect("/dashboard/clinic/locations/new");
}
