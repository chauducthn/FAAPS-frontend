import { cn } from '@/lib/utils';
import type { AiReportStatus } from '../../types/admin';

const STYLES: Record<AiReportStatus, string> = {
  PENDING: 'bg-[#fef2f2] text-[#b91c1c]',
  RESOLVED: 'bg-[#ecfdf5] text-[#047857]',
  DISMISSED: 'bg-gray-100 text-[#555f6f]',
};

export function ReportStatusBadge({ status }: { status: AiReportStatus }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em]', STYLES[status])}>
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
