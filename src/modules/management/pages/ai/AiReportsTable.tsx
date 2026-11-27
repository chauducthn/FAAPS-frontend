// The AI report list table.
import { Link } from 'react-router';
import { Flag, MagnifyingGlassMinus } from '@phosphor-icons/react';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import { ReportStatusBadge, formatDateTime, shortReportId } from '../../components/AiReportBits';
import type { AiReportStatus } from '../../types/admin';
import { REASON_LABEL } from './reportConstants';

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
        <span className="font-mono text-[13px] font-semibold text-ink-primary" title={item.id}>
          {shortReportId(item.id)}
        </span>
      ),
    },
    {
      key: 'studentCode',
      header: 'Student ID',
      render: (item) => (
        <span className="font-mono text-[13px] font-medium text-ink-secondary">
          {item.studentCode ?? '—'}
        </span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student name',
      render: (item) => <span className="text-[13px] font-semibold text-ink-primary">{item.studentName}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item) => (
        <span className="block max-w-[240px] text-[13px] text-ink-secondary">
          <span className="line-clamp-2">{REASON_LABEL[item.reason] ?? item.reason}</span>
        </span>
      ),
    },
    {
      key: 'flaggedCount',
      header: 'Flagged',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-[13px] font-semibold tabular-nums text-ink-primary">
          {item.flaggedCount}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item) => (
        <span className="whitespace-nowrap text-[13px] tabular-nums text-ink-muted">
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
          className="inline-flex h-8 items-center whitespace-nowrap rounded-md border border-line bg-white px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:border-brand/40 hover:bg-surface-hover hover:text-ink-primary"
        >
          Report details
        </Link>
      ),
    },
  ];

  if (!isLoading && !(isError && !hasData) && items.length === 0) {
    return (
      <EmptyState
        className="h-full justify-center"
        icon={debouncedSearch ? <MagnifyingGlassMinus aria-hidden /> : <Flag aria-hidden />}
        title={debouncedSearch ? 'No reports match your search' : 'No reported responses yet'}
        description={
          debouncedSearch
            ? 'Try a different keyword or clear the active filters.'
            : 'Flagged AI conversations will appear here when students submit reports.'
        }
      />
    );
  }

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
      className="min-h-0 flex-1 overflow-y-auto"
    />
  );
}
