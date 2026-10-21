"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Circle,
  Clock,
  Eye,
  Inbox,
  Pencil,
  Stethoscope,
  Users,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth, useLocations, type DashboardLocation } from "@/components/dashboard/providers";

interface Guide {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  href: string;
  icon: typeof Circle;
}

const GUIDES: Guide[] = [
  {
    id: "complete-profile",
    title: "Complete your practice profile",
    description:
      "Add your address, phone, website and opening details so patients can find and trust your listing.",
    estimatedTime: "10 minutes",
    href: "/dashboard/clinic/listing",
    icon: Stethoscope,
  },
  {
    id: "services-prices",
    title: "Set your services and prices",
    description:
      "Choose the treatments you offer and publish guide prices so patients know what to expect.",
    estimatedTime: "15 minutes",
    href: "/dashboard/clinic/treatments",
    icon: Check,
  },
  {
    id: "team",
    title: "Add your team",
    description:
      "Introduce your dentists and hygienists with GDC numbers to build patient confidence.",
    estimatedTime: "10 minutes",
    href: "/dashboard/clinic/team",
    icon: Users,
  },
  {
    id: "booking-hours",
    title: "Set online booking hours",
    description:
      "Publish the days and times you accept appointments so patients can request slots online.",
    estimatedTime: "5 minutes",
    href: "/dashboard/clinic/availability",
    icon: CalendarCheck,
  },
  {
    id: "respond-enquiries",
    title: "Respond to enquiries",
    description:
      "Reply quickly to patient enquiries — practices that respond within a day convert far more often.",
    estimatedTime: "Ongoing",
    href: "/dashboard/clinic/enquiries",
    icon: Inbox,
  },
  {
    id: "keep-fresh",
    title: "Keep your details up to date",
    description:
      "Review your listing every few weeks. Recent, accurate information ranks higher and builds trust.",
    estimatedTime: "5 minutes",
    href: "/dashboard/clinic/listing",
    icon: Clock,
  },
  {
    id: "verification",
    title: "Complete verification",
    description:
      "We verify every practice on the marketplace. Keep your contact details accurate to pass review quickly.",
    estimatedTime: "2 minutes",
    href: "/dashboard/clinic/listing",
    icon: Check,
  },
  {
    id: "get-found",
    title: "Get found by more patients",
    description:
      "Complete treatments, prices and photos to appear in more search results across Scotland.",
    estimatedTime: "20 minutes",
    href: "/dashboard/clinic/treatments",
    icon: ArrowRight,
  },
];

const GUIDES_STORAGE_KEY = "clinic_guides_completed";

interface CompletenessFactor {
  id: string;
  label: string;
  weight: number;
  done: boolean;
  fixHref: string;
}

interface LocationDetail extends DashboardLocation {
  address: string | null;
  postcode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  bio: string | null;
  image_url: string | null;
  nhs_private: string | null;
  appointment_mode: string | null;
  accepting_new_nhs: boolean | null;
  treatment_count?: number;
  price_count?: number;
  availability_count?: number;
  clinician_count?: number;
  published_at: string | null;
  verified_at: string | null;
}

function ProfileCompleteness({ location }: { location: LocationDetail }) {
  const factors: CompletenessFactor[] = useMemo(
    () => [
      { id: "name", label: "Practice name", weight: 2, done: Boolean(location.name), fixHref: "/dashboard/clinic/listing" },
      { id: "address", label: "Address", weight: 2, done: Boolean(location.address), fixHref: "/dashboard/clinic/listing" },
      { id: "phone", label: "Phone number", weight: 2, done: Boolean(location.phone), fixHref: "/dashboard/clinic/listing" },
      { id: "email", label: "Email address", weight: 2, done: Boolean(location.email), fixHref: "/dashboard/clinic/listing" },
      { id: "website", label: "Website", weight: 1, done: Boolean(location.website), fixHref: "/dashboard/clinic/listing" },
      { id: "bio", label: "Practice bio", weight: 2, done: Boolean(location.bio), fixHref: "/dashboard/clinic/listing" },
      { id: "image", label: "Practice photo", weight: 1, done: Boolean(location.image_url), fixHref: "/dashboard/clinic/listing" },
      { id: "verified", label: "Verified listing", weight: 3, done: Boolean(location.verified_at || location.published_at), fixHref: "/dashboard/clinic/listing" },
      { id: "nhs", label: "NHS / Private status", weight: 1, done: Boolean(location.nhs_private), fixHref: "/dashboard/clinic/listing" },
      { id: "treatments", label: "Services offered", weight: 2, done: (location.treatment_count ?? 0) > 0, fixHref: "/dashboard/clinic/treatments" },
      { id: "prices", label: "Guide prices", weight: 2, done: (location.price_count ?? 0) > 0, fixHref: "/dashboard/clinic/treatments" },
      { id: "availability", label: "Booking hours", weight: 1, done: (location.availability_count ?? 0) > 0, fixHref: "/dashboard/clinic/availability" },
      { id: "team", label: "Team members", weight: 2, done: (location.clinician_count ?? 0) > 0, fixHref: "/dashboard/clinic/team" },
      { id: "booking", label: "Online booking enabled", weight: 1, done: location.appointment_mode !== null && location.appointment_mode !== "enquiry_only", fixHref: "/dashboard/clinic/availability" },
    ],
    [location]
  );

  const total = factors.reduce((sum, f) => sum + f.weight, 0);
  const earned = factors.filter((f) => f.done).reduce((sum, f) => sum + f.weight, 0);
  const pct = total === 0 ? 0 : Math.round((earned / total) * 100);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <section className="rounded-ow-lg border border-ow-line bg-white p-5">
      <h2 className="text-base font-semibold text-ow-ink">Profile Completeness</h2>
      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="#e6e9f2" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#0a1ff0"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ow-ink">
            {pct}%
          </span>
        </div>
        <p className="text-sm text-ow-text-secondary">
          {pct === 100
            ? "Your profile is complete. Well done!"
            : "Complete the remaining items to improve your listing and search ranking."}
        </p>
      </div>
      <ul className="mt-4 space-y-2">
        {factors.map((f) => (
          <li key={f.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ow-text-secondary">
              {f.done ? (
                <Check size={14} className="text-ow-success-text" aria-label="Done" />
              ) : (
                <Circle size={14} className="text-ow-line-strong" aria-label="Not done" />
              )}
              {f.label}
            </span>
            {!f.done && (
              <Link href={f.fixHref} className="text-xs font-semibold text-ow-brand hover:underline">
                Fix this
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Guides() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GUIDES_STORAGE_KEY);
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  function toggleComplete(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      window.localStorage.setItem(GUIDES_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <section className="rounded-ow-lg border border-ow-line bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ow-ink">Getting Started</h2>
        <span className="text-xs text-ow-text-muted">
          {completed.size} of {GUIDES.length} complete
        </span>
      </div>
      <ul className="mt-3 divide-y divide-ow-line">
        {GUIDES.map((guide) => {
          const isOpen = openId === guide.id;
          const isDone = completed.has(guide.id);
          return (
            <li key={guide.id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : guide.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 py-3 text-left"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    role="checkbox"
                    aria-checked={isDone}
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(guide.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleComplete(guide.id);
                      }
                    }}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-ow-xs border transition ${
                      isDone
                        ? "border-ow-brand bg-ow-brand text-white"
                        : "border-ow-line-strong bg-white"
                    }`}
                  >
                    {isDone && <Check size={12} aria-hidden />}
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate text-sm font-medium ${isDone ? "text-ow-text-muted line-through" : "text-ow-ink"}`}>
                      {guide.title}
                    </span>
                    <span className="block text-xs text-ow-text-muted">{guide.estimatedTime}</span>
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-ow-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {isOpen && (
                <div className="pb-4 pl-8 pr-2">
                  <p className="text-sm text-ow-text-secondary">{guide.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={guide.href}
                      className="inline-flex items-center gap-1.5 rounded-ow-md bg-ow-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-ow-brand-hover"
                    >
                      Open guide
                      <ArrowRight size={12} aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleComplete(guide.id)}
                      className="inline-flex items-center gap-1.5 rounded-ow-md border border-ow-line-strong px-3 py-1.5 text-xs font-semibold text-ow-text-secondary hover:bg-ow-bg-soft"
                    >
                      {isDone ? "Mark incomplete" : "Mark complete"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function ClinicOverviewPage() {
  const { profile } = useAuth();
  const { locations, selectedId, loading: locationsLoading, refresh } = useLocations();

  const [details, setDetails] = useState<LocationDetail[]>([]);
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [upcoming, setUpcoming] = useState<
    Array<{ id: string; patient_name: string | null; scheduled_at: string | null; status: string; location_name: string }>
  >([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (locations.length === 0) {
        setDetails([]);
        setEnquiryCount(0);
        setViewCount(0);
        setUpcoming([]);
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      const supabase = createSupabaseBrowserClient();
      const ids = locations.map((l) => l.id);

      const [detailRes, enquiryRes, viewRes, bookingRes] = await Promise.all([
        supabase
          .from("practice_locations")
          .select(
            "id, name, slug, status, address, postcode, phone, email, website, bio, image_url, nhs_private, appointment_mode, accepting_new_nhs, published_at, verified_at"
          )
          .in("id", ids),
        supabase.from("enquiries").select("id, status").in("practice_location_id", ids),
        supabase.from("page_views").select("id").in("practice_location_id", ids),
        supabase
          .from("bookings")
          .select("id, patient_name, scheduled_at, status, practice_location_id")
          .in("practice_location_id", ids)
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at")
          .limit(8),
      ]);

      if (cancelled) return;

      const base = (detailRes.data ?? []) as LocationDetail[];

      const [treatmentsRes, pricesRes, availabilityRes, cliniciansRes] = await Promise.all([
        supabase
          .from("practice_treatments")
          .select("practice_location_id")
          .in("practice_location_id", ids)
          .eq("is_offered", true),
        supabase.from("prices").select("id, practice_location_id").in("practice_location_id", ids),
        supabase
          .from("service_availability")
          .select("id, practice_location_id")
          .in("practice_location_id", ids)
          .eq("is_closed", false),
        supabase.from("clinicians").select("id, practice_location_id").in("practice_location_id", ids),
      ]);

      if (cancelled) return;

      const countBy = (rows: Array<{ practice_location_id: string }> | null) =>
        (rows ?? []).reduce<Record<string, number>>((acc, r) => {
          acc[r.practice_location_id] = (acc[r.practice_location_id] ?? 0) + 1;
          return acc;
        }, {});

      const tCounts = countBy(treatmentsRes.data as never);
      const pCounts = countBy(pricesRes.data as never);
      const aCounts = countBy(availabilityRes.data as never);
      const cCounts = countBy(cliniciansRes.data as never);

      setDetails(
        base.map((d) => ({
          ...d,
          treatment_count: tCounts[d.id] ?? 0,
          price_count: pCounts[d.id] ?? 0,
          availability_count: aCounts[d.id] ?? 0,
          clinician_count: cCounts[d.id] ?? 0,
        }))
      );
      setEnquiryCount(enquiryRes.data?.length ?? 0);
      setViewCount(viewRes.data?.length ?? 0);

      const nameById = Object.fromEntries(locations.map((l) => [l.id, l.name]));
      setUpcoming(
        ((bookingRes.data ?? []) as Array<{
          id: string;
          patient_name: string | null;
          scheduled_at: string | null;
          status: string;
          practice_location_id: string;
        }>).map((b) => ({
          id: b.id,
          patient_name: b.patient_name,
          scheduled_at: b.scheduled_at,
          status: b.status,
          location_name: nameById[b.practice_location_id] ?? "",
        }))
      );
      setDataLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locations]);

  const loading = locationsLoading || dataLoading;
  const focusLocation = details.find((d) => d.id === selectedId) ?? details[0] ?? null;
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  if (loading) {
    return <p className="text-sm text-ow-text-muted">Loading your dashboard…</p>;
  }

  if (locations.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-ow-xl bg-ow-bg-tint text-ow-brand">
          <Stethoscope size={26} aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold text-ow-ink">No practice added yet</h1>
        <p className="mt-2 text-sm text-ow-text-secondary">
          Add your practice to start appearing in search results and receiving patient enquiries.
        </p>
        <Link
          href="/dashboard/clinic/locations/new"
          className="mt-6 inline-flex items-center gap-2 rounded-ow-md bg-ow-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-ow-brand-hover"
        >
          Add your practice
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    );
  }

  const inReview = details.some((d) => d.status === "in_review" || d.status === "pending");

  const statCards = [
    { label: "Practices", value: locations.length },
    { label: "Total Enquiries", value: enquiryCount },
    { label: "Profile Views", value: viewCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Welcome back, {firstName}!</h1>
        <p className="mt-1 text-sm text-ow-text-secondary">
          Here is what is happening with your practice today.
        </p>
      </div>

      {inReview && (
        <div className="rounded-ow-md border border-ow-warning-text/20 bg-ow-warning-bg p-4">
          <p className="text-sm font-medium text-ow-warning-text">
            Your listing is being reviewed by our team. You can keep editing while you wait.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-ow-lg border border-ow-line bg-white p-5">
            <p className="text-sm text-ow-text-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-ow-ink">{card.value}</p>
          </div>
        ))}
        <Link
          href="/dashboard/clinic/bookings"
          className="rounded-ow-lg bg-ow-brand p-5 text-white transition hover:bg-ow-brand-hover"
        >
          <CalendarCheck size={20} aria-hidden />
          <p className="mt-2 text-sm text-white/80">Upcoming Bookings</p>
          <p className="mt-1 text-2xl font-bold">{upcoming.length}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
            View bookings
            <ArrowRight size={12} aria-hidden />
          </span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Guides />

        <div className="space-y-6">
          <section className="rounded-ow-lg border border-ow-line bg-white p-5">
            <h2 className="text-base font-semibold text-ow-ink">Upcoming Bookings</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-ow-text-muted">
                No upcoming bookings. Make sure your booking hours are set.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-ow-line">
                {upcoming.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ow-ink">{b.patient_name ?? "Patient"}</p>
                      <p className="truncate text-xs text-ow-text-muted">{b.location_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ow-text-secondary">
                        {b.scheduled_at
                          ? new Date(b.scheduled_at).toLocaleString("en-GB", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Date to confirm"}
                      </p>
                      <span className="text-xs text-ow-text-muted">{b.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-ow-lg border border-ow-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ow-ink">Your Practices</h2>
              <Link
                href="/dashboard/clinic/locations/new"
                className="text-xs font-semibold text-ow-brand hover:underline"
              >
                + Add practice
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-ow-line">
              {details.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ow-ink">{d.name}</p>
                    <p className="truncate text-xs text-ow-text-muted">
                      {d.address}
                      {d.postcode ? `, ${d.postcode}` : ""}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-ow-xs px-1.5 py-0.5 text-[11px] font-medium ${
                        d.status === "published"
                          ? "bg-ow-success-bg text-ow-success-text"
                          : d.status === "in_review" || d.status === "pending"
                            ? "bg-ow-warning-bg text-ow-warning-text"
                            : "bg-ow-bg-soft text-ow-text-muted"
                      }`}
                    >
                      {d.status.replace("_", " ")}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/clinic/listing?practice=${d.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-ow-md border border-ow-line-strong px-3 py-1.5 text-xs font-semibold text-ow-text-secondary hover:bg-ow-bg-soft"
                  >
                    <Pencil size={12} aria-hidden />
                    Edit Listing
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {focusLocation && <ProfileCompleteness location={focusLocation} />}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/clinic/enquiries"
          className="inline-flex items-center gap-1.5 rounded-ow-md border border-ow-line-strong bg-white px-3 py-2 text-sm font-medium text-ow-text-secondary hover:bg-ow-bg-soft"
        >
          <Inbox size={14} aria-hidden />
          View enquiries
        </Link>
        <Link
          href="/dashboard/clinic/performance"
          className="inline-flex items-center gap-1.5 rounded-ow-md border border-ow-line-strong bg-white px-3 py-2 text-sm font-medium text-ow-text-secondary hover:bg-ow-bg-soft"
        >
          <Eye size={14} aria-hidden />
          See performance
        </Link>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-ow-md border border-ow-line-strong bg-white px-3 py-2 text-sm font-medium text-ow-text-secondary hover:bg-ow-bg-soft"
        >
          Refresh data
        </button>
      </div>
    </div>
  );
}
