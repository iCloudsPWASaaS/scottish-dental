import Link from "next/link";
import { Suspense } from "react";
import { Stethoscope } from "lucide-react";
import { SignUpForm } from "@/components/signup-form";

export const metadata = { title: "Create Account" };

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-ow-bg-soft py-12 font-ow">
      <div className="mx-auto w-full max-w-md px-4">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-ow-md bg-ow-brand text-white">
            <Stethoscope size={20} aria-hidden />
          </span>
          <span className="text-lg font-bold text-ow-ink">Scottish Dental</span>
        </Link>

        <div className="rounded-ow-xl border border-ow-line bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-center text-2xl font-bold text-ow-ink">Create Account</h1>
          <p className="mt-1 text-center text-sm text-ow-text-muted">
            Join Scottish Dental today
          </p>
          <div className="mt-6">
            <Suspense>
              <SignUpForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
