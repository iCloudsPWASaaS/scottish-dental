import Image from "next/image";
import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { Reveal } from "@/components/reveal";
import { SearchBar } from "@/components/search-bar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const HERO_CHIPS = [
  { label: "Find a dentist", href: "/search" },
  { label: "Emergency", href: "/emergency" },
  { label: "Browse treatments", href: "/treatments" },
];

const STATS = [
  { figure: "100%", label: "Verified before publishing — every listing is reviewed by our team." },
  { figure: "Direct", label: "Enquiries go straight to the practice — no call centres, no middlemen." },
  { figure: "Free", label: "Search, compare and enquire as a patient — always free." },
];

const FEATURED_FALLBACK = [
  { name: "Example Glasgow Dental", city: "Glasgow", img: "/images/clinic-1.jpg" },
  { name: "Example Edinburgh Dental", city: "Edinburgh", img: "/images/clinic-2.jpg" },
  { name: "Example Aberdeen Dental", city: "Aberdeen", img: "/images/clinic-3.jpg" },
  { name: "Example Dundee Dental", city: "Dundee", img: "/images/clinic-1.jpg" },
  { name: "Example Stirling Dental", city: "Stirling", img: "/images/clinic-2.jpg" },
  { name: "Example Inverness Dental", city: "Inverness", img: "/images/clinic-3.jpg" },
  { name: "Example Paisley Dental", city: "Paisley", img: "/images/clinic-1.jpg" },
  { name: "Example Ayr Dental", city: "Ayr", img: "/images/clinic-2.jpg" },
];

const STEPS = [
  {
    title: "Search",
    body: "Enter your postcode or town to find verified practices near you.",
  },
  {
    title: "Compare",
    body: "Browse treatments, pricing and NHS/private status side by side.",
  },
  {
    title: "Enquire",
    body: "Send a request directly — the practice contacts you to arrange the appointment.",
  },
];

const TREATMENTS = [
  {
    title: "General Dentistry",
    body: "Routine check-ups, fillings and preventive care from verified practices.",
    href: "/treatments/general",
    img: "/images/treat-general.jpg",
  },
  {
    title: "Hygiene & Cleaning",
    body: "Scale and polish, hygiene appointments and fresh-smile care.",
    href: "/treatments/hygiene",
    img: "/images/treat-hygiene.jpg",
  },
  {
    title: "Dental Implants",
    body: "Replace missing teeth with natural-looking, long-lasting implants.",
    href: "/treatments/implants",
    img: "/images/treat-implants.jpg",
  },
  {
    title: "Cosmetic Dentistry",
    body: "Whitening, veneers and smile makeovers with transparent pricing.",
    href: "/treatments/cosmetic",
    img: "/images/treat-whitening.jpg",
  },
  {
    title: "Orthodontics",
    body: "Braces and clear aligners for adults and children.",
    href: "/treatments/orthodontic",
    img: "/images/treat-ortho.png",
  },
  {
    title: "Emergency Dentistry",
    body: "Urgent appointments when you need pain relief fast.",
    href: "/emergency",
    img: "/images/treat-emergency.jpg",
  },
];

const CITIES_FALLBACK = [
  "Glasgow",
  "Edinburgh",
  "Aberdeen",
  "Dundee",
  "Stirling",
  "Inverness",
  "Paisley",
  "Ayr",
  "Perth",
  "Falkirk",
];

const FAQS = [
  {
    q: "How do enquiries work?",
    a: "Search for a practice, then send an enquiry with the treatment you need. The practice contacts you directly to arrange the appointment. Enquiries are requests, not confirmed bookings.",
  },
  {
    q: "Are all practices verified?",
    a: "Yes. Every listing is reviewed and approved by our team before it goes live, including services, pricing and NHS/private offering.",
  },
  {
    q: "Is it free for patients?",
    a: "Searching, comparing and sending enquiries is completely free for patients. Practices pay a subscription to join the marketplace.",
  },
  {
    q: "Can I enquire with more than one practice?",
    a: "Absolutely. There is no limit — enquire with as many practices as you like and choose the appointment that suits you.",
  },
  {
    q: "Do you list NHS and private practices?",
    a: "Both. Every practice shows whether it offers NHS, private or mixed care, and whether it is accepting new NHS patients.",
  },
  {
    q: "How does a practice join?",
    a: "Sign up for a practice account, add your locations, services and prices, then pass verification. Your listing goes live once approved.",
  },
];

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const { data: published } = await supabase
    .from("practice_locations")
    .select("name, slug, town, image_url, rating")
    .eq("status", "published")
    .order("rating", { ascending: false })
    .limit(12);

  const featured =
    published && published.length > 0
      ? published.map((p) => ({
          name: p.name,
          city: p.town ?? "",
          img: p.image_url || "/images/clinic-1.jpg",
          slug: p.slug,
        }))
      : FEATURED_FALLBACK;

  const towns = published
    ? Array.from(new Set(published.map((p) => p.town).filter(Boolean) as string[])).slice(0, 10)
    : [];
  const cities = towns.length >= 4 ? towns : CITIES_FALLBACK;
return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-bowl relative overflow-hidden bg-[#f0f5ff]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/images/hero-gradient.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f0f5ff] via-[#f0f5ff]/85 to-[#f0f5ff]/40" />
        </div>

        <div className="container-page relative py-16 text-center sm:py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full border border-[#d0dff8] bg-white/90 px-4 py-1.5 text-xs font-semibold text-brand-800 shadow-sm transition hover:border-brand-400"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Verified Scottish dental practices
            </Link>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] text-brand-950 sm:text-5xl md:text-6xl">
              Find trusted dental care in Scotland.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Search verified practices by location, treatment and NHS/private
              offering. Send an enquiry — the practice contacts you directly.
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <SearchBar />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {HERO_CHIPS.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="rounded-full border border-[#d0dff8] bg-white/80 px-4 py-1.5 text-xs font-semibold text-brand-950 backdrop-blur transition hover:border-brand-400 hover:bg-white"
                >
                  {chip.label}
                </Link>
              ))}
            </div>

            <p className="mx-auto mt-5 max-w-2xl text-xs text-slate-500">
              Enquiries are requests, not confirmed bookings. The practice will
              contact you to arrange an appointment.
            </p>
          </div>
        </div>
      </section>

      {/* ── Problem / stats ──────────────────────────────────── */}
      <Reveal className="section bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Solving dental access in Scotland</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-brand-950 sm:text-4xl md:text-5xl">
              Great dental care shouldn&apos;t hide behind phone lines.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Across Scotland, practices have capacity while patients struggle
              to find care. We make treatments, pricing and NHS/private status
              visible in one place — and let you contact the practice directly.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.figure}
                className="rounded-2xl border border-[#d0dff8] bg-brand-50 p-6 text-center"
              >
                <p className="font-display text-3xl font-bold text-brand-600">
                  {stat.figure}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── Practice marquee ─────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-[#d0dff8] bg-white py-12">
        <div className="container-page mb-8 text-center">
          <p className="eyebrow">Trusted care across Scotland</p>
          <h2 className="mt-3 text-2xl font-semibold text-brand-950 sm:text-3xl">
            Verified practices, reviewed before going live
          </h2>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24"
          />

          <div className="flex w-max animate-scroll-x gap-4">
            {[...featured, ...featured].map((practice, i) => {
              const card = (
                <div
                  key={`${practice.name}-${i}`}
                  aria-hidden={i >= featured.length}
                  className="w-[260px] shrink-0 rounded-xl border border-[#d0dff8] bg-white p-3 shadow-card transition hover:shadow-card-hover"
                >
                  <div className="relative h-32 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={practice.img}
                      alt=""
                      fill
                      sizes="260px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-2 px-1 pb-1 pt-3">
                    <div>
                      <p className="text-sm font-semibold text-brand-950">
                        {practice.name}
                      </p>
                      <p className="text-xs text-slate-500">{practice.city}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                      <svg
                        aria-hidden
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>
              );
              return "slug" in practice && practice.slug ? (
                <Link key={`${practice.name}-${i}`} href={`/practices/${practice.slug}`}>
                  {card}
                </Link>
              ) : (
                card
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <Reveal className="section bg-brand-50">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-brand-950 sm:text-4xl">
              Three steps to your next appointment
            </h2>

            <ol className="mt-8 space-y-7">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span
                    aria-hidden
                    className="select-none font-display text-4xl font-light leading-none text-brand-300"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-brand-950">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Link href="/signup" className="btn-primary mt-9">
              Create a patient account
            </Link>
          </div>

          <div className="relative">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-[#d0dff8] shadow-card">
              <Image
                src="/images/how-it-works.jpg"
                alt="Patient booking a dental appointment on their phone"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-4 rounded-xl border border-[#d0dff8] bg-white px-4 py-3 shadow-card-hover sm:left-8">
              <p className="text-xs font-semibold text-brand-950">
                Enquiries go direct to the practice
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                No call centres. No waiting on hold.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Treatments ───────────────────────────────────────── */}
      <Reveal className="section bg-white">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Browse by treatment</p>
              <h2 className="mt-3 text-3xl font-semibold text-brand-950 sm:text-4xl">
                Popular treatments
              </h2>
              <p className="mt-2 text-slate-600">
                Find trusted local experts just around the corner.
              </p>
            </div>
            <Link
              href="/treatments"
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              View all treatments →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TREATMENTS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group overflow-hidden rounded-2xl border border-[#d0dff8] bg-gradient-to-br from-brand-50 to-slate-50 shadow-card transition hover:shadow-card-hover"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <Image
                    src={t.img}
                    alt={t.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-brand-950">
                    {t.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {t.body}
                  </p>
                  <span className="mt-4 inline-block text-sm font-semibold text-brand-600 transition group-hover:underline">
                    Find a practice →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── Locations ────────────────────────────────────────── */}
      <Reveal className="section border-t border-[#d0dff8] bg-white">
        <div className="container-page">
          <div className="text-center">
            <p className="eyebrow">Across Scotland</p>
            <h2 className="mt-3 text-3xl font-semibold text-brand-950 sm:text-4xl">
              Find dentists near you
            </h2>
            <p className="mt-2 text-slate-600">
              Compare verified dental practices in towns and cities across
              Scotland.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/search?postcode=${encodeURIComponent(city)}`}
                className="rounded-xl border border-[#d0dff8] px-5 py-4 text-center text-sm font-medium text-brand-950 transition hover:border-brand-500 hover:bg-brand-50"
              >
                {city}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/search" className="btn-primary">
              Search all practices
            </Link>
            <Link href="/emergency" className="btn-secondary">
              Emergency dentistry
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <Reveal className="section bg-brand-50">
        <div className="container-page">
          <div className="text-center">
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold text-brand-950 sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-10">
            <FaqAccordion items={FAQS} />
          </div>
        </div>
      </Reveal>

      {/* ── Patients / practices CTA ─────────────────────────── */}
      <Reveal className="section bg-white">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[#d0dff8] bg-gradient-to-br from-brand-50 to-slate-50 shadow-card">
            <div className="p-7 sm:p-9">
              <p className="eyebrow">For patients</p>
              <h2 className="mt-3 text-2xl font-semibold text-brand-950 sm:text-3xl">
                Take control of your dental care
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Search by postcode or town, filter by treatment and NHS status,
                and send a simple enquiry. You stay in control of your details —
                and it&apos;s free.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-primary">
                  Create a patient account
                </Link>
                <Link href="/search" className="btn-secondary">
                  Browse practices
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#d0dff8] bg-white shadow-card">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <Image
                src="/images/for-practices.jpg"
                alt="Dental team at a modern Scottish practice"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-7 sm:p-9">
              <p className="eyebrow">For practices</p>
              <h2 className="mt-3 text-2xl font-semibold text-brand-950 sm:text-3xl">
                Join the marketplace
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Publish verified prices and services, and manage enquiries from
                a single dashboard. Listings go live only after verification and
                approval.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/for-practices" className="btn-primary">
                  Learn more
                </Link>
                <Link href="/signup" className="btn-secondary">
                  Sign up your practice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
