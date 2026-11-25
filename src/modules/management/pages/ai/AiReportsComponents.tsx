import { Link } from 'react-router';
import { AlertTriangle, Search } from 'lucide-react';
import { ReportStatusBadge, formatDateTime, shortReportId } from '../../components/AiReportBits';
import type { AiReportStatus } from '../../types/admin';
import { cn } from '@/shared/lib/utils';
import { REASON_LABEL, REPORT_TABS, REPORT_TH_CLASS } from './reportConstants';

export interface AiReportListItem {
  id: string;
  studentCode?: string | null;
  studentName: string;
  reason: string;
  flaggedCount: number;
  createdAt: string;
  status: AiReportStatus;
}

export function StatusCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value?: number;
  icon: typeof AlertTriangle;
  tone: 'red' | 'green' | 'gray';
  hint: string;
}) {
  const tones = {
    red: 'bg-[#fef2f2] text-[#b91c1c]',
    green: 'bg-[#ecfdf5] text-[#047857]',
    gray: 'bg-[#f1f5f9] text-[#555f6f]',
  };
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
      <span className={cn('flex size-10 items-center justify-center rounded-full', tones[tone])}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-[13px] font-medium text-[#555f6f]">{label}</p>
        <p className="text-2xl font-bold leading-8 text-[#151c27]">
          {value === undefined ? '—' : value.toLocaleString('en-US')}
        </p>
        <p className="text-[11px] text-[#98a2b3]">{hint}</p>
      </div>
    </div>
  );
}

export function AiReportsFilterBar({
  search,
  status,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onClear,
}: {
  search: string;
  status: AiReportStatus | '';
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AiReportStatus | '') => void;
  onClear: () => void;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:p-5">
      <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
        <Search className="size-4 text-[#98a2b3]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Report ID, Student ID (MSSV), or Student Name"
          aria-label="Search reports"
          className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
        />
      </label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#555f6f]">Status:</span>
        <div role="tablist" aria-label="Report status" className="flex rounded-lg bg-[#f7f8fa] p-0.5">
          {REPORT_TABS.map((t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={status === t.value}
              onClick={() => onStatusChange(t.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                status === t.value ? 'bg-[#f37021] text-white' : 'text-[#555f6f] hover:text-[#151c27]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        disabled={!hasFilters}
        onClick={onClear}
        className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
      >
        Clear filters
      </button>
    </section>
  );
}

export function AiReportsTable({
  items,
  isLoading,
  isError,
  hasData,
  debouncedSearch,
  onRetry,
}: {
  items: AiReportListItem[];
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  debouncedSearch: string;
  onRetry: () => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead className="bg-[rgba(240,243,255,0.7)]">
          <tr>
            <th className={REPORT_TH_CLASS}>Report ID</th>
            <th className={REPORT_TH_CLASS}>Student ID (MSSV)</th>
            <th className={REPORT_TH_CLASS}>Student name</th>
            <th className={REPORT_TH_CLASS}>Reason</th>
            <th className={`${REPORT_TH_CLASS} text-right`}>Flagged</th>
            <th className={REPORT_TH_CLASS}>Date</th>
            <th className={REPORT_TH_CLASS}>Status</th>
            <th className={`${REPORT_TH_CLASS} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-[#e7eefe]">
                <td colSpan={8} className="px-4 py-5">
                  <div className="h-4 animate-pulse rounded bg-gray-100" />
                </td>
              </tr>
            ))
          ) : isError && !hasData ? (
            <tr className="border-t border-[#e7eefe]">
              <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                Could not load reports.{' '}
                <button type="button" onClick={onRetry} className="font-semibold text-orange-600 hover:underline">
                  Retry
                </button>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr className="border-t border-[#e7eefe]">
              <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                {debouncedSearch ? 'No reports match your search.' : 'No reports in this status.'}
              </td>
            </tr>
          ) : (
            items.map((r) => (
              <tr key={r.id} className="border-t border-[#e7eefe] hover:bg-[#f7f8fa]">
                <td className="px-3 py-4 text-[13px] font-semibold text-[#151c27]" title={r.id}>
                  {shortReportId(r.id)}
                </td>
                <td className="px-3 py-4 text-[13px] font-semibold text-[#151c27]">{r.studentCode ?? '—'}</td>
                <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">{r.studentName}</td>
                <td className="max-w-[240px] px-3 py-4 text-[13px] text-[#555f6f]">
                  <p className="line-clamp-2">{REASON_LABEL[r.reason] ?? r.reason}</p>
                </td>
                <td className="px-3 py-4 text-right text-[13px] font-medium text-[#555f6f]">{r.flaggedCount}</td>
                <td className="whitespace-nowrap px-3 py-4 text-[13px] font-medium text-[#555f6f]">
                  {formatDateTime(r.createdAt)}
                </td>
                <td className="px-3 py-4">
                  <ReportStatusBadge status={r.status} />
                </td>
                <td className="px-3 py-4 text-right">
                  <Link
                    to={`/admin/ai-reports/${r.id}`}
                    className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-[#f7f8fa]"
                  >
                    Report details
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
