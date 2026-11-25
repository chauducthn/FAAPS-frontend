import { Loader2, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const formatUserDate = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    : '—';

export function UserDetailPanel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100">
      <header className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
        <span className="text-[#F26F21]">{icon}</span>
        <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">{title}</h3>
      </header>
      <div className="bg-white p-4">{children}</div>
    </section>
  );
}

export function UserDetailField({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-2.5">
      <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
        <span className="text-gray-400">{icon}</span>
        {label}
      </p>
      {value === null || value === undefined || value === '' ? (
        <p className="mt-1 text-[13px] font-semibold italic text-gray-500">Not recorded</p>
      ) : (
        <p className={cn('mt-1 truncate text-[13px] font-bold text-gray-900', mono && 'font-mono')}>{value}</p>
      )}
    </div>
  );
}

export function UserDetailSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div aria-label="Loading user detail">
      <div className="h-1.5 animate-pulse bg-orange-100" />
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
        <div className="flex items-start gap-3.5">
          <div className="size-12 animate-pulse rounded-2xl bg-orange-100" />
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-48 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-3 bg-[#fafbfd] p-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
        <p className="flex items-center justify-center gap-2 text-center text-[11px] font-medium text-gray-400">
          <Loader2 className="size-3.5 animate-spin" /> Loading account…
        </p>
      </div>
    </div>
  );
}
