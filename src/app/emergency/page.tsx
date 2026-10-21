import Link from "next/link";
import { SearchBar } from "@/components/search-bar";

export const metadata = { title: "Emergency Dentistry" };

export default function EmergencyPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Emergency dentistry</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        If you are in severe pain, have swelling, bleeding that will not stop, or
        have suffered facial trauma, seek urgent care immediately.
      </p>

      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-900">Urgent? Call now</h2>
        <ul className="mt-2 space-y-1 text-red-800">
          <li>NHS 24: <strong>111</strong></li>
          <li>Life-threatening emergency: <strong>999</strong></li>
        </ul>
        <p className="mt-2 text-sm text-red-700">
          If your practice is closed, they will provide details of their
          out-of-hours emergency arrangements.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">
          Find a practice offering emergency care
        </h2>
        <div className="mt-4 max-w-2xl">
          <SearchBar />
        </div>
      </section>
    </div>
  );
}
