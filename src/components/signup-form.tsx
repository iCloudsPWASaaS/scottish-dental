"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Building2, Mail, User, ArrowLeft } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { passwordError } from "@/lib/password";
import { toast } from "sonner";

type RoleChoice = "patient" | "practice_owner";
type View = "choose" | "email";

const ROLE_COPY: Record<RoleChoice, { icon: typeof User; label: string; sub: string }> = {
  patient: { icon: User, label: "Patient", sub: "Looking for a dentist" },
  practice_owner: { icon: Building2, label: "Clinic", sub: "Managing a practice" },
};

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  const [view, setView] = useState<View>("choose");
  const [role, setRole] = useState<RoleChoice>("patient");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState<"google" | "email" | null>(null);

  async function onGoogle() {
    setEmailLoading("google");
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${
          role === "patient" ? "/patient" : "/dashboard/clinic"
        }`,
      },
    });
    if (oauthError) {
      toast.error("Google sign-up is not available yet. Please use email.");
      setEmailLoading(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = new FormData(e.currentTarget);

    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm_password") ?? "");
    const pwError = passwordError(password);
    if (pwError) {
      setError(pwError);
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password,
          confirm_password: confirm,
          full_name: data.get("full_name"),
          role,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const fieldErrors = json?.details?.fieldErrors;
        if (fieldErrors?.password?.[0]) {
          setError(fieldErrors.password[0]);
        } else if (fieldErrors?.confirm_password?.[0]) {
          setError(fieldErrors.confirm_password[0]);
        } else {
          setError(json.error ?? "Sign up failed");
        }
        return;
      }

      if (json.session) {
        toast.success("Welcome! Your account is ready.");
        router.push(role === "patient" ? "/patient" : "/dashboard/clinic");
        router.refresh();
        return;
      }

      toast.success("Almost there — check your inbox to confirm your email.");
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      {invite && (
        <p className="rounded-ow-md bg-ow-bg-tint p-3 text-sm text-ow-ink">
          You are using an invitation link. Your account will be linked to the
          invited practice.
        </p>
      )}

      {view === "choose" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(ROLE_COPY) as RoleChoice[]).map((key) => {
              const { icon: Icon, label, sub } = ROLE_COPY[key];
              const selected = role === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  aria-pressed={selected}
                  className={`flex flex-col items-start gap-2 rounded-ow-md border p-4 text-left transition ${
                    selected
                      ? "border-ow-brand bg-ow-bg-tint"
                      : "border-ow-line bg-white hover:border-ow-line-strong"
                  }`}
                >
                  <Icon size={20} className={selected ? "text-ow-brand" : "text-ow-text-muted"} />
                  <span className="text-sm font-semibold text-ow-ink">{label}</span>
                  <span className="text-xs text-ow-text-muted">{sub}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onGoogle}
              disabled={emailLoading === "google"}
              className="flex w-full items-center justify-center gap-2 rounded-ow-md border border-ow-line-strong bg-white px-4 py-2.5 text-sm font-semibold text-ow-ink transition hover:bg-ow-bg-soft disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative py-1 text-center">
              <span className="relative z-10 bg-white px-3 text-xs font-medium uppercase tracking-wide text-ow-text-muted">
                Or
              </span>
              <span className="absolute inset-x-0 top-1/2 h-px bg-ow-line" aria-hidden />
            </div>

            <button
              type="button"
              onClick={() => setView("email")}
              className="flex w-full items-center justify-center gap-2 rounded-ow-md bg-ow-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ow-brand-hover"
            >
              <Mail size={16} aria-hidden />
              Continue with Email
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <button
            type="button"
            onClick={() => setView("choose")}
            className="inline-flex items-center gap-1 text-sm font-medium text-ow-text-secondary hover:text-ow-ink"
          >
            <ArrowLeft size={14} aria-hidden />
            Back to options
          </button>

          <div>
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-ow-ink">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              minLength={2}
              autoComplete="name"
              className="block w-full rounded-ow-md border border-ow-line-strong bg-white px-3 py-2 text-sm text-ow-ink placeholder-ow-text-muted focus:border-ow-brand focus:outline-none focus:ring-1 focus:ring-ow-brand"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ow-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="block w-full rounded-ow-md border border-ow-line-strong bg-white px-3 py-2 text-sm text-ow-ink placeholder-ow-text-muted focus:border-ow-brand focus:outline-none focus:ring-1 focus:ring-ow-brand"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ow-ink">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              className="block w-full rounded-ow-md border border-ow-line-strong bg-white px-3 py-2 text-sm text-ow-ink placeholder-ow-text-muted focus:border-ow-brand focus:outline-none focus:ring-1 focus:ring-ow-brand"
            />
            <p className="mt-1 text-xs text-ow-text-muted">
              Must be at least 12 characters and not a common password.
            </p>
          </div>

          <div>
            <label htmlFor="confirm_password" className="mb-1 block text-sm font-medium text-ow-ink">
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              className="block w-full rounded-ow-md border border-ow-line-strong bg-white px-3 py-2 text-sm text-ow-ink placeholder-ow-text-muted focus:border-ow-brand focus:outline-none focus:ring-1 focus:ring-ow-brand"
            />
          </div>

          {error && (
            <p
              className="rounded-ow-md bg-ow-danger-bg p-3 text-sm text-ow-danger-text"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-ow-md bg-ow-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ow-brand-hover disabled:opacity-60"
          >
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-ow-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ow-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
