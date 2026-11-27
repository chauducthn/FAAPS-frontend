import { CaretRight as ChevronRight, WarningCircle as CircleAlert } from '@phosphor-icons/react';

export function CurriculumBreadcrumb({
  label,
  onBack,
}: {
  label: string;
  onBack: () => void;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-[11px] font-semibold text-ink-subtle">
        <li>
          <button
            type="button"
            onClick={onBack}
            className="rounded transition-colors hover:text-brand-ink"
          >
            Curriculum List
          </button>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="size-3 text-ink-subtle" />
        </li>
        <li className="font-bold text-ink-primary" aria-current="page">
          {label}
        </li>
      </ol>
    </nav>
  );
}

export function CurriculumErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink-primary">Could not load this curriculum</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          The link may be invalid or the record was deleted. Go back to the list and pick another curriculum.
        </p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg bg-ink-primary px-4 py-2 text-xs font-bold text-surface-page transition-colors hover:bg-ink-secondary"
      >
        Back to curriculum list
      </button>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="w-full space-y-5" aria-label="Loading curriculum">
      <div className="h-4 w-48 animate-pulse rounded bg-line" />
      <div className="rounded-lg border border-line/80 bg-white p-5">
        <div className="flex items-start gap-3.5">
          <div className="size-12 animate-pulse rounded-lg bg-brand-soft-strong" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-line" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-line-soft" />
          </div>
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-[280px] shrink-0 space-y-2.5 rounded-lg border border-line/80 bg-white p-3">
            <div className="h-8 animate-pulse rounded-lg bg-brand-soft" style={{ animationDelay: `${i * 70}ms` }} />
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="h-20 animate-pulse rounded-lg bg-line-soft"
                style={{ animationDelay: `${(i * 3 + j) * 60}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] font-medium text-ink-subtle">Loading roadmap…</p>
    </div>
  );
}
