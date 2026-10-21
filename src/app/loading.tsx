export default function Loading() {
  return (
    <div className="container-page flex min-h-[40vh] items-center justify-center py-20">
      <div className="flex items-center gap-3 text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
        Loading…
      </div>
    </div>
  );
}
