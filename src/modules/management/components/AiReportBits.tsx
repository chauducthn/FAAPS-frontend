import { cn } from '@/shared/lib/utils';
import type { AiReportStatus } from '../types/admin';

const STYLES: Record<AiReportStatus, string> = {
  PENDING: 'bg-red-50 text-red-700 [--dot:var(--color-red-500)]',
  RESOLVED: 'bg-emerald-50 text-emerald-700 [--dot:var(--color-emerald-500)]',
  DISMISSED: 'bg-line-soft text-ink-muted [--dot:var(--ink-subtle)]',
};

export function ReportStatusBadge({ status }: { status: AiReportStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-4',
        STYLES[status],
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[var(--dot)]" aria-hidden />
      <span className="inline-block lowercase first-letter:uppercase">{status}</span>
    </span>
  );
}

export const shortReportId = (id: string) => id.slice(0, 8).toUpperCase();

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
