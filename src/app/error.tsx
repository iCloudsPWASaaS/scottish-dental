"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-3 max-w-md text-slate-600">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
      {error.digest && (
        <p className="mt-4 text-xs text-slate-400">Reference: {error.digest}</p>
      )}
    </div>
  );
}
