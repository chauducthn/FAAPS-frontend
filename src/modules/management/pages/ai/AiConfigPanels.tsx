import { WarningCircle as CircleAlert, Plus, ArrowCounterClockwise as RotateCcw, MagnifyingGlassMinus as SearchX } from '@phosphor-icons/react';
import type { AiPreset } from '../../../ai/types/ai-config';

export function AiConfigErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">Could not load configurations</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
          The list failed to load. Check your connection or mock flag, then try again — your filters are kept.
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

export function AiConfigEmptyState({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
        <SearchX className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">
          {hasFilters ? 'No configurations match your filters' : 'No configurations yet'}
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500">
          {hasFilters
            ? 'Try a different keyword, or clear the provider / purpose filters.'
            : 'Create the first configuration — or start from a preset below.'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
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
          <Plus className="size-3.5" /> New configuration
        </button>
      </div>
    </div>
  );
}

export function PresetsPanel({
  presets,
  isLoading,
  onSelect,
}: {
  presets: AiPreset[];
  isLoading: boolean;
  onSelect: (preset: AiPreset) => void;
}) {
  if (!isLoading && presets.length === 0) return null;
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-extrabold tracking-tight text-gray-900">AI presets</h2>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Ready-made templates — pick one to prefill the creation form.
          </p>
        </div>
        <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-bold uppercase text-[#9a3412] ring-1 ring-orange-200">
          {isLoading ? '…' : `${presets.length} presets`}
        </span>
      </div>
      {isLoading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" style={{ animationDelay: `${i * 70}ms` }} />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="flex flex-col gap-2 rounded-2xl border border-gray-200/80 bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-px hover:border-orange-300 hover:shadow-[0_4px_14px_rgba(242,111,33,0.15)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-extrabold text-gray-900">{p.label}</span>
                <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                  {p.purpose}
                </span>
              </div>
              <p className="text-[12px] leading-5 text-gray-500">{p.description}</p>
              <p className="mt-auto truncate pt-1 font-mono text-[11px] font-medium text-gray-400">{p.modelName}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
