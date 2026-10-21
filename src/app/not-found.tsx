import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-600">
        The page you are looking for does not exist or is no longer available.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">Back to home</Link>
        <Link href="/search" className="btn-secondary">Search practices</Link>
      </div>
    </div>
  );
}
