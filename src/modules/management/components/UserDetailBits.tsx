import { X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export const formatUserDate = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    : '—';

export function UserDetailSection({
  title,
  bordered = false,
  children,
}: {
  title: string;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={bordered ? 'border-t border-gray-100 pt-5' : ''}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      {children}
    </section>
  );
}

export function UserDetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  const empty = value === null || value === undefined || value === '';

  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {empty ? (
        <p className="mt-1 text-sm text-gray-400">—</p>
      ) : (
        <p
          title={String(value)}
          className={cn('mt-1 truncate text-sm font-medium text-gray-900', mono && 'font-mono text-[13px]')}
        >
          {value}
        </p>
      )}
    </div>
  );
}

export function UserDetailSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div aria-label="Loading user detail" className="flex h-[520px] max-h-[85vh] flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
        <div className="flex items-start gap-3.5">
          <div className="size-11 animate-pulse rounded-xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-52 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
