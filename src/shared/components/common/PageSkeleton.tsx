/**
 * Skeleton placeholder dùng làm Suspense fallback khi route lazy-load.
 * Giữ layout giống trang advisor (hero + KPI + section) để không bị "giật" khi chunk về.
 */
export function PageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-200 via-orange-100 to-orange-50 px-6 py-7 sm:px-8 sm:py-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="h-7 w-56 animate-pulse rounded-lg bg-white/60" />
            <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-white/50" />
          </div>
          <div className="h-11 w-40 shrink-0 animate-pulse rounded-xl bg-white/70" />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
            <div className="mt-2.5 h-3 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
