import { CircleAlert, Plus, RotateCcw, SearchX } from 'lucide-react';

export function CurriculumListSkeleton() {
  return (
    <div className="p-4" aria-label="Loading">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-9 flex-1 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-9 w-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-9 w-32 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-4 py-3.5 last:border-0">
            <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="hidden h-4 w-32 animate-pulse rounded bg-gray-100 sm:block" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-6 w-16 animate-pulse rounded-full bg-orange-100/70" style={{ animationDelay: `${i * 60}ms` }} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-gray-400">Loading curriculums…</p>
    </div>
  );
}

export function CurriculumListError({ plural, onRetry }: { plural: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">Could not load {plural}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
          The list failed to load. Check your connection, then try again — your filters are kept.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
      >
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}

export function CurriculumListEmpty({
  plural,
  noun,
  createLabel,
  hasFilters,
  onClearFilters,
  onCreate,
}: {
  plural: string;
  noun: string;
  createLabel: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
        <SearchX className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">
          {hasFilters ? `No ${plural} match your filters` : `No ${plural} yet`}
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500">
          {hasFilters
            ? 'Try a different keyword, or clear the major / status filters to see the full list.'
            : `Create the first ${noun.toLowerCase()} to start building the academic roadmap — it takes less than a minute.`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Clear filters
          </button>
        )}
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e05f14]"
        >
          <Plus className="size-3.5" strokeWidth={2.5} /> {createLabel}
        </button>
      </div>
    </div>
  );
}
