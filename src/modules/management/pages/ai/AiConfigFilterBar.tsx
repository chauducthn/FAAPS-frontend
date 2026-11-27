import {
  ArrowCounterClockwise as RotateCcw,
  CaretDown as ChevronDown,
  MagnifyingGlass as Search,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

const SELECT_CLASS = cn(
  'h-9 w-full appearance-none truncate rounded-md border border-line bg-white pl-3 pr-8',
  'text-[13px] font-medium text-ink-secondary transition-colors',
  'hover:border-ink-subtle/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
);

export function AiConfigFilterBar({
  search,
  provider,
  purpose,
  status,
  hasFilters,
  onSearchChange,
  onProviderChange,
  onPurposeChange,
  onStatusChange,
  onClear,
}: {
  search: string;
  provider: string;
  purpose: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  hasFilters: boolean;
  onSearchChange: (val: string) => void;
  onProviderChange: (val: string) => void;
  onPurposeChange: (val: string) => void;
  onStatusChange: (val: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-surface-page/60 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or model..."
          aria-label="Search AI configurations"
          role="searchbox"
          className={cn(
            'h-9 w-full rounded-md border border-line bg-white pl-9 pr-7 text-[13px]',
            'text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-ink-subtle hover:text-ink-primary"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[144px]">
        <select value={provider} onChange={(e) => onProviderChange(e.target.value)} aria-label="Filter by provider" className={SELECT_CLASS}>
          <option value="ALL">All providers</option>
          <option value="GEMINI">Google AI Studio</option>
          <option value="OPENROUTER">OpenRouter</option>
          <option value="OTHER">Other</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[138px]">
        <select value={purpose} onChange={(e) => onPurposeChange(e.target.value)} aria-label="Filter by purpose" className={SELECT_CLASS}>
          <option value="ALL">All purposes</option>
          <option value="CHAT">Chat</option>
          <option value="EMBEDDING">Embedding</option>
          <option value="OCR">OCR</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[132px]">
        <select value={status} onChange={(e) => onStatusChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')} aria-label="Filter by status" className={SELECT_CLASS}>
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
        aria-label="Clear filters"
        className={cn(
          'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3',
          'text-[13px] font-medium text-ink-secondary transition-colors',
          'hover:border-brand hover:text-brand-ink disabled:cursor-default disabled:opacity-40',
          'disabled:hover:border-line disabled:hover:text-ink-secondary',
        )}
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}
