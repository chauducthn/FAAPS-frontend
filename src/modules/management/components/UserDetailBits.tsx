import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { ModalHeader } from '../../../shared/components/ui/ModalParts';

export const formatUserDate = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    : '—';

/** A titled group of label / value rows. */
export function UserDetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">{title}</h3>
      <dl className="divide-y divide-line-soft">{children}</dl>
    </section>
  );
}

/** One row: muted label on the left, value on the right; an em dash when the value is missing. */
export function UserDetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  const empty = value === null || value === undefined || value === '';

  return (
    <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] items-baseline gap-4 py-2 text-[13px]">
      <dt className="text-ink-muted">{label}</dt>
      <dd
        title={typeof value === 'string' ? value : undefined}
        className={cn('min-w-0 truncate', empty ? 'text-ink-subtle' : 'text-ink-primary', mono && !empty && 'font-mono text-[12.5px]')}
      >
        {empty ? '—' : value}
      </dd>
    </div>
  );
}

export function UserDetailSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div aria-label="Loading user detail" className="flex flex-col">
      <ModalHeader
        title={<span className="mt-1 block h-4 w-40 animate-pulse rounded-sm bg-line" />}
        description={<span className="mt-2 block h-3 w-52 animate-pulse rounded-sm bg-line-soft" />}
        media={<span className="size-11 shrink-0 animate-pulse rounded-full bg-line-soft" />}
        onClose={onClose}
      />
      <div className="space-y-3 px-6 py-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="grid grid-cols-[9.5rem_1fr] gap-4">
            <div className="h-3.5 w-20 animate-pulse rounded-sm bg-line-soft" />
            <div className="h-3.5 w-44 animate-pulse rounded-sm bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
