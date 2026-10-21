"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/types";

interface SessionState {
  email: string | null;
  role: Role | null;
}

const NAV = [
  { href: "/", label: "Find a Dentist" },
  { href: "/treatments", label: "Treatments" },
  { href: "/emergency", label: "Emergency Dentistry" },
  { href: "/for-practices", label: "For Practices" },
  { href: "/help", label: "Help" },
];

const APP_PREFIXES = ["/dashboard", "/admin", "/patient", "/onboarding"];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionState>({
    email: null,
    role: null,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setSession({
        email: user?.email ?? null,
        role: (user?.user_metadata?.role as Role) ?? null,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      const user = sess?.user;
      setSession({
        email: user?.email ?? null,
        role: (user?.user_metadata?.role as Role) ?? null,
      });
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSession({ email: null, role: null });
    router.push("/");
    router.refresh();
  }

  const dashboardHref =
    session.role === "admin" || session.role === "super_admin"
      ? "/admin"
      : session.role === "business_development"
        ? "/admin/prospects"
        : session.role === "patient"
          ? "/patient"
          : "/dashboard/clinic";

  if (APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d0dff8] bg-[#f0f5ff]">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-display text-sm font-bold text-white shadow-pill transition hover:bg-brand-700"
          >
            SD
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-bold tracking-tight text-brand-950">
              Scottish Dental
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Marketplace
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition hover:bg-white/70 ${
                pathname === item.href
                  ? "text-brand-700"
                  : "text-slate-500 hover:text-brand-950"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session.email ? (
            <>
              <Link href={dashboardHref} className="btn-primary">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="btn-secondary"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-500 transition hover:text-brand-950"
              >
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary">
                For Practices
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-brand-950 transition hover:bg-white/70 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-[#d0dff8] bg-white md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-950"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[#d0dff8] pt-3">
              {session.email ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="btn-primary"
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="btn-secondary">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="btn-primary"
                  >
                    For Practices
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
