import {
  AppointmentAvatar,
  AppointmentStatusBadge,
  CalendarTile,
  formatSlotDay,
  formatSlotTimeRange,
} from '../../components/AppointmentBits';
import { KPI_METRICS } from '../../components/appointments/KpiCards';
import { ViewActionButton } from '../../components/appointments/ViewActionButton';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import type { Appointment, AppointmentSummary } from '../../types/admin';

export function createAppointmentColumns(
  onOpen: (id: string) => void,
): DataTableColumnDef<Appointment>[] {
  return [
    {
      accessorKey: 'studentName',
      header: 'Student',
      enableSorting: false,
      cell: ({ row }) => {
        // The backend may omit the student name — never call `.replace` on undefined.
        const studentName = row.original.studentName ?? 'Unknown';
        return (
          <div className="flex items-center gap-2.5">
            <AppointmentAvatar name={studentName} />
            <span className="truncate font-semibold text-[#151c27]">{studentName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'advisorName',
      header: 'Advisor',
      enableSorting: false,
      cell: ({ row }) => {
        // The backend may omit the advisor name — never call `.replace` on undefined.
        const advisorName = row.original.advisorName ?? 'Unknown';
        return (
          <div className="flex items-center gap-2.5">
            <AppointmentAvatar name={advisorName} kind="advisor" />
            <span className="truncate text-[#151c27]">{advisorName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Date & Time',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <CalendarTile />
          <div className="min-w-0">
            <p className="whitespace-nowrap text-[13px] font-semibold text-[#151c27]">
              {formatSlotDay(row.original.scheduledAt)}
            </p>
            <p className="whitespace-nowrap text-[12px] tabular-nums text-[#5b6577]">
              {formatSlotTimeRange(row.original)}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ViewActionButton
            label={row.original.studentName ?? 'Unknown'}
            onClick={() => onOpen(row.original.id)}
          />
        </div>
      ),
    },
  ];
}

export function buildAppointmentMetrics(summaryData?: AppointmentSummary) {
  return KPI_METRICS.map((metric) => {
    let raw: number | undefined;
    switch (metric.key) {
      case 'total':
        raw = summaryData?.total;
        break;
      case 'SCHEDULED':
        raw = summaryData?.scheduled;
        break;
      case 'COMPLETED':
        raw = summaryData?.completed;
        break;
      case 'CANCELLED':
        raw = summaryData?.cancelled;
        break;
      case 'NO_SHOW':
        raw = summaryData?.noShow;
        break;
    }

    return {
      ...metric,
      value: raw,
      delta: summaryData?.deltas?.[metric.key] ?? null,
    };
  });
}
