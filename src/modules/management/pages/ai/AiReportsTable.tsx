// The AI report list table. Kept in its own file so the shared report bits
// (filter bar, status cards) and the table can evolve independently.

import { Link } from 'react-router';
import { ReportStatusBadge, formatDateTime, shortReportId } from '../../components/AiReportBits';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import { REASON_LABEL } from './reportConstants';
import type { AiReportStatus } from '../../types/admin';

export interface AiReportListItem {
  id: string;
  studentCode?: string | null;
  studentName: string;
  reason: string;
  flaggedCount: number;
  createdAt: string;
  status: AiReportStatus;
}

export interface AiReportListItemProps {
  items: AiReportListItem[];
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  debouncedSearch: string;
  onRetry: () => void;
}

export function AiReportsTable({
  items,
  isLoading,
  isError,
  hasData,
  debouncedSearch,
  onRetry,
}: AiReportListItemProps) {
  const columns: StaticColumn<AiReportListItem>[] = [
    {
      key: 'reportId',
      header: 'Report ID',
      render: (item) => (
        <span className="text-[13px] font-semibold" title={item.id}>
          {shortReportId(item.id)}
        </span>
      ),
    },
    {
      key: 'studentCode',
      header: 'Student ID (MSSV)',
      render: (item) => <span className="text-[13px] font-semibold">{item.studentCode ?? '—'}</span>,
    },
    {
      key: 'studentName',
      header: 'Student name',
      render: (item) => <span className="text-sm font-semibold">{item.studentName}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item) => (
        <span className="block max-w-[240px] text-[13px]">
          <span className="line-clamp-2">{REASON_LABEL[item.reason] ?? item.reason}</span>
        </span>
      ),
    },
    {
      key: 'flaggedCount',
      header: 'Flagged',
      align: 'right',
      render: (item) => <span className="text-[13px] font-medium">{item.flaggedCount}</span>,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item) => (
        <span className="whitespace-nowrap text-[13px] font-medium">
          {formatDateTime(item.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <ReportStatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <Link
          to={`/admin/ai-reports/${item.id}`}
          className="rounded-lg border border-line px-3 py-1.5 text-[13px] font-semibold text-ink-primary hover:bg-surface-page"
        >
          Report details
        </Link>
      ),
    },
  ];

  return (
    <StaticTable
      stickyHeader
      columns={columns}
      rows={items}
      rowKey={(item) => item.id}
      loading={isLoading}
      error={isError && !hasData ? 'Could not load reports.' : undefined}
      onRetry={onRetry}
      emptyTitle={
        debouncedSearch ? 'No reports match your search.' : 'No reports in this status.'
      }
      minWidth="900px"
    />
  );
}
