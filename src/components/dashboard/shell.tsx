"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  CalendarCheck,
  ChevronDown,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Stethoscope,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useAuth, useLocations } from "@/components/dashboard/providers";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Setup",
    items: [
      { href: "/dashboard/clinic", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/clinic/listing", label: "My Practice", icon: Stethoscope },
      { href: "/dashboard/clinic/treatments", label: "Services", icon: BookOpen },
      { href: "/dashboard/clinic/availability", label: "Online Booking", icon: CalendarCheck },
      { href: "/dashboard/clinic/team", label: "Team", icon: Users },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/dashboard/clinic/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/dashboard/clinic/requests", label: "Requests", icon: Inbox },
      { href: "/dashboard/clinic/enquiries", label: "Enquiries", icon: Inbox },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/dashboard/clinic/performance", label: "Performance", icon: TrendingUp },
      { href: "/dashboard/clinic/statement", label: "Statement", icon: Receipt },
    ],
  },
  {
    title: "Account",
    items: [{ href: "/dashboard/clinic/settings", label: "Settings", icon: Settings }],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard/clinic") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ClinicSelector() {
  const { locations, selectedId, setSelectedId, loading } = useLocations();
  if (loading) return null;
  if (locations.length === 0) return null;

  if (locations.length === 1) {
    return (
      <span className="hidden max-w-[180px] truncate text-sm font-medium text-ow-ink sm:inline">
        {locations[0].name}
      </span>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedId ?? ""}
        onChange={(e) => setSelectedId(e.target.value || null)}
        aria-label="Select practice"
        className="appearance-none rounded-ow-md border border-ow-line-strong bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-ow-ink focus:border-ow-brand focus:outline-none"
      >
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ow-text-muted"
        aria-hidden
      />
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="mb-5">
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-ow-text-muted">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-ow-md px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-ow-bg-tint text-ow-brand"
                        : "text-ow-text-secondary hover:bg-ow-bg-soft hover:text-ow-ink"
                    }`}
                  >
                    <item.icon size={16} aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const firstName = profile?.full_name?.split(" ")[0] ?? profile?.email ?? "";

  return (
    <div className="min-h-screen bg-ow-bg-soft font-ow">
      <header className="sticky top-0 z-40 border-b border-ow-line bg-white">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-ow-md p-2 text-ow-text-secondary hover:bg-ow-bg-soft lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
            >
              {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/dashboard/clinic" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-ow-md bg-ow-brand text-white">
                <Stethoscope size={16} aria-hidden />
              </span>
              <span className="text-sm font-bold text-ow-ink">Scottish Dental</span>
            </Link>
            <ClinicSelector />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[160px] truncate text-sm text-ow-text-secondary sm:inline">
              {firstName}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-ow-md border border-ow-line-strong px-3 py-1.5 text-sm font-medium text-ow-text-secondary transition hover:bg-ow-bg-soft"
            >
              <LogOut size={14} aria-hidden />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <nav
          aria-label="Dashboard"
          className="flex gap-1 overflow-x-auto border-t border-ow-line px-2 py-1.5 lg:hidden"
        >
          {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-ow-sm px-3 py-1.5 text-sm font-medium ${
                  active ? "bg-ow-bg-tint text-ow-brand" : "text-ow-text-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ow-ink/30"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-ow-ink">Menu</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="rounded-ow-md p-2 text-ow-text-secondary hover:bg-ow-bg-soft"
              >
                <X size={18} />
              </button>
            </div>
            <nav aria-label="Mobile navigation">
              <NavLinks onNavigate={() => setDrawerOpen(false)} />
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-ow-line bg-white p-4 lg:block">
          <nav aria-label="Sidebar">
            <NavLinks />
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
