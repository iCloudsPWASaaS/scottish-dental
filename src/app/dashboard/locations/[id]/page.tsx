import { redirect } from "next/navigation";

export default function LegacyLocationRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/dashboard/clinic/listing?practice=${params.id}`);
}
