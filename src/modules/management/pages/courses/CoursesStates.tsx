import { WarningCircle as CircleAlert, ArrowCounterClockwise as RotateCcw, MagnifyingGlassMinus as SearchX } from '@phosphor-icons/react';

export function CoursesListSkeleton() {
  return (
    <div className="p-4" aria-label="Loading courses">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-9 flex-1 animate-pulse rounded-lg bg-line-soft" />
        <div className="h-9 w-40 animate-pulse rounded-lg bg-line-soft" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-line-soft" />
      </div>
      <div className="overflow-hidden rounded-lg border border-line-soft">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line-soft px-4 py-3.5 last:border-0">
            <div className="h-6 w-20 animate-pulse rounded-lg bg-brand-soft-strong/70" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-4 flex-1 animate-pulse rounded bg-line-soft" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="hidden h-4 w-32 animate-pulse rounded bg-line-soft sm:block" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-6 w-16 animate-pulse rounded-full bg-emerald-100/70" style={{ animationDelay: `${i * 60}ms` }} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-ink-subtle">Loading courses… (mock delay 500ms)</p>
    </div>
  );
}

export function CoursesErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink-primary">Could not load courses</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          The catalogue failed to load. Check your connection or mock flag, then try again — your filters are kept.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg bg-ink-primary px-4 py-2 text-xs font-bold text-surface-page transition-colors hover:bg-ink-secondary"
      >
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}

export function CoursesEmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <SearchX className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink-primary">
          {hasFilters ? 'No courses match your filters' : 'No courses yet'}
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-ink-muted">
          {hasFilters
            ? 'Try a different keyword, or clear the category / status filters to see the full catalogue.'
            : 'Use Create course or Import Excel above to start building the catalogue.'}
        </p>
      </div>
      {hasFilters && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink-muted transition-colors hover:bg-surface-hover"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
