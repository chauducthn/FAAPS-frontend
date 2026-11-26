// Loading / empty / error state rows for the advising request list.

import { Tray as Inbox, MagnifyingGlassMinus as SearchX } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export function RequestTableState({
  cols,
  loading,
  error,
  empty,
  searching,
  onRetry,
}: {
  cols: number;
  loading: boolean;
  error: boolean;
  empty: string | null;
  searching: boolean;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="border-b border-[var(--line-soft)] last:border-b-0">
            <td colSpan={cols} className="px-4 py-6">
              <div
                className="h-4 animate-pulse rounded-lg bg-[var(--line-soft)]"
                style={{ width: `${55 + (i % 3) * 15}%` }}
              />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <tr>
      <td colSpan={cols}>
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--line-soft)] text-[var(--ink-subtle)]">
            {error || !searching ? (
              <Inbox className="size-5" aria-hidden />
            ) : (
              <SearchX className="size-5" aria-hidden />
            )}
          </span>
          {error ? (
            <>
              <p className="text-base font-bold text-[var(--ink-primary)]">Unable to load requests.</p>
              <button
                type="button"
                onClick={onRetry}
                className={cn(
                  'inline-flex h-11 items-center px-4 text-sm font-bold',
                  'text-[var(--brand-ink)] hover:underline',
                )}
              >
                Try again
              </button>
            </>
          ) : (
            <>
              <p className="text-base font-bold text-[var(--ink-primary)]">
                {empty ?? 'No requests found.'}
              </p>
              <p className="text-sm font-medium text-[var(--ink-muted)]">
                {searching
                  ? 'Try a different keyword or switch tabs.'
                  : 'There is no data to display yet.'}
              </p>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
