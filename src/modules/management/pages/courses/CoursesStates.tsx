import {
  BookOpen,
  ArrowCounterClockwise as RotateCcw,
  MagnifyingGlassMinus as SearchX,
  WarningCircle as CircleAlert,
} from '@phosphor-icons/react';
import { EmptyState } from '@/shared/components/common/EmptyState';

export function CoursesListSkeleton() {
  return (
    <div className="p-4" aria-label="Loading courses">
      <div className="overflow-hidden rounded-lg border border-line-soft">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line-soft px-4 py-3 last:border-0">
            <div className="h-5 w-20 animate-pulse rounded-sm bg-line-soft" />
            <div className="h-4 flex-1 animate-pulse rounded-sm bg-line-soft" />
            <div className="hidden h-4 w-32 animate-pulse rounded-sm bg-line-soft sm:block" />
            <div className="h-5 w-16 animate-pulse rounded-sm bg-line-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoursesErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-md bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/15">
        <CircleAlert className="size-5" weight="fill" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-primary">Could not load courses</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          The catalogue failed to load. Check your connection and try again — your filters are kept.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink-primary px-4 text-xs font-semibold text-surface-page transition-colors hover:bg-ink-secondary"
      >
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}

export function CoursesEmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      className="h-full justify-center"
      icon={hasFilters ? <SearchX aria-hidden /> : <BookOpen aria-hidden />}
      title={hasFilters ? 'No courses match your filters' : 'No courses yet'}
      description={
        hasFilters
          ? 'Try a different keyword, or clear the category / status filters to see the full catalogue.'
          : 'Use Create course or Import Excel above to start building the catalogue.'
      }
    />
  );
}
