import Link from "next/link";
import type { NhsPrivate } from "@/lib/types";

interface Props {
  slug: string;
  name: string;
  address: string;
  nhsPrivate: NhsPrivate;
  acceptingNewNhs?: boolean;
  treatments?: string[];
  distance?: string;
}

const statusLabel: Record<NhsPrivate, { text: string; className: string }> = {
  nhs: { text: "NHS", className: "bg-clinical-100 text-clinical-800" },
  private: { text: "Private", className: "bg-slate-100 text-slate-700" },
  mixed: { text: "NHS & Private", className: "bg-brand-100 text-brand-800" },
  unverified: {
    text: "Unverified",
    className: "bg-amber-100 text-amber-800",
  },
};

export function PracticeCard({
  slug,
  name,
  address,
  nhsPrivate,
  acceptingNewNhs,
  treatments = [],
  distance,
}: Props) {
  const status = statusLabel[nhsPrivate] ?? statusLabel.unverified;

  return (
    <article className="card flex flex-col gap-3 transition hover:border-brand-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">
          <Link href={`/practices/${slug}`} className="hover:text-brand-700">
            {name}
          </Link>
        </h3>
        <span className={`badge ${status.className}`}>{status.text}</span>
      </div>

      <p className="text-sm text-slate-600">{address}</p>

      {distance && (
        <p className="text-xs font-medium text-slate-500">{distance} away</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {acceptingNewNhs && (
          <span className="badge bg-emerald-100 text-emerald-800">
            Accepting new NHS patients
          </span>
        )}
        {treatments.slice(0, 3).map((t) => (
          <span key={t} className="badge bg-slate-100 text-slate-700">
            {t}
          </span>
        ))}
      </div>

      <Link
        href={`/practices/${slug}`}
        className="mt-auto pt-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        View practice →
      </Link>
    </article>
  );
}
