import { cn } from '@/shared/lib/utils';
import type { AiReportStatus } from '../types/admin';

const STYLES: Record<AiReportStatus, string> = {
  PENDING: 'text-red-600',
  RESOLVED: 'text-emerald-700',
  DISMISSED: 'text-gray-500',
};

export function ReportStatusBadge({ status }: { status: AiReportStatus }) {
  return (
    <span className={cn('text-xs font-semibold uppercase tracking-[0.02em]', STYLES[status])}>
      {status}
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
