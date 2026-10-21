import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/signin-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="bg-[#f0f5ff]/60">
      <div className="container-page flex justify-center py-16">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600">
            Access your practice or patient dashboard.
          </p>
          <div className="mt-6">
            <Suspense>
              <SignInForm />
            </Suspense>
          </div>
          <p className="mt-6 text-sm text-slate-600">
            No account?{" "}
            <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
