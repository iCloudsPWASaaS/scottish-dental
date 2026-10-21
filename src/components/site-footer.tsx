"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const APP_PREFIXES = ["/dashboard", "/admin", "/patient", "/onboarding"];

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Discover",
      links: [
        { label: "Find a Dentist", href: "/search" },
        { label: "Treatments", href: "/treatments" },
        { label: "Emergency Dentistry", href: "/emergency" },
        { label: "Patient Portal", href: "/patient" },
        { label: "Help", href: "/help" },
      ],
    },
    {
      heading: "Popular Locations",
      links: [
        { label: "Dentists in Glasgow", href: "/search?postcode=Glasgow" },
        { label: "Dentists in Edinburgh", href: "/search?postcode=Edinburgh" },
        { label: "Dentists in Aberdeen", href: "/search?postcode=Aberdeen" },
        { label: "Dentists in Dundee", href: "/search?postcode=Dundee" },
        { label: "Dentists in Stirling", href: "/search?postcode=Stirling" },
        { label: "All locations", href: "/search" },
      ],
    },
    {
      heading: "For Practices",
      links: [
        { label: "Join the marketplace", href: "/for-practices" },
        { label: "Practice sign up", href: "/signup" },
        { label: "Practice dashboard", href: "/dashboard/clinic" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "Help", href: "/help" },
        { label: "Privacy notice", href: "/privacy" },
        { label: "Terms of use", href: "/terms" },
      ],
    },
  ];

const REGIONS = [
  "Glasgow",
  "Edinburgh",
  "Aberdeen",
  "Dundee",
  "Stirling",
  "Inverness",
  "Paisley",
  "Ayr",
  "Perth",
];

export function SiteFooter() {
  const pathname = usePathname();
  if (APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <footer className="bg-brand-950 text-white">
      <div className="container-page pt-12 pb-8">
        <div className="mb-10 border-b border-gray-800 pb-8">
          <h3 className="font-display text-xl font-medium text-white">
            Simple way to find your dental care with confidence
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 text-sm font-medium text-gray-300">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-800 pt-8">
          <h4 className="mb-4 text-sm font-medium text-gray-300">
            Browse dentists across Scotland
          </h4>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {REGIONS.map((region) => (
              <Link
                key={region}
                href={`/search?postcode=${encodeURIComponent(region)}`}
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                {region}
              </Link>
            ))}
            <Link
              href="/search"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              All locations →
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container-page flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Scottish Dental Marketplace. All
              rights reserved.
            </p>
            <p className="text-xs text-gray-600">
              All practice information is verified and dated. Enquiries are
              requests, not confirmed bookings.
            </p>
          </div>
          <Link
            href="/help"
            className="text-xs text-gray-600 transition-colors hover:text-gray-400"
          >
            Help
          </Link>
        </div>
      </div>
    </footer>
  );
}
