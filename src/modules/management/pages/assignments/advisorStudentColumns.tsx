// Column definitions for the students an advisor currently supervises.

import { Link } from 'react-router';
import { backState } from '../../../../shared/lib/backLink';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import { cn } from '@/shared/lib/utils';
import type { AdvisorStudentRow } from './AdvisorStudentsSection';

export const advisorStudentBtn =
  'rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50';

export function buildAdvisorStudentColumns(actions: {
  advisorId?: string;
  advisorName: string;
  onReassignOne: (student: { id: string; name: string }) => void;
  onUnassignOne: (student: { id: string; name: string }) => void;
}): StaticColumn<AdvisorStudentRow>[] {
  const { advisorId, advisorName, onReassignOne, onUnassignOne } = actions;
  return [

    {
      key: 'studentCode',
      header: 'Student ID',
      render: (row) => <span className="text-[13px] font-semibold">{row.studentCode}</span>,
    },
    {
      key: 'fullName',
      header: 'Name',
      render: (row) => <span className="text-sm font-semibold">{row.fullName}</span>,
    },
    {
      key: 'majorCode',
      header: 'Major',
      render: (row) => <span className="text-sm">{row.majorCode}</span>,
    },
    {
      key: 'cohort',
      header: 'Cohort',
      render: (row) => <span className="text-sm">{row.cohort}</span>,
    },
    {
      key: 'assignedDate',
      header: 'Assigned',
      render: (row) => (
        <span className="text-[13px]">
          {row.assignedDate
            ? new Date(`${row.assignedDate}T00:00:00`).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              })
            : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onReassignOne({ id: row.id, name: row.fullName })} className={advisorStudentBtn}>
            Reassign
          </button>
          <button type="button" onClick={() => onUnassignOne({ id: row.id, name: row.fullName })} className={cn(
              'rounded-lg border border-red-300 px-3 py-1.5',
              'text-[13px] font-semibold text-red-700',
              'hover:bg-red-50'
            )}>
            Unassign
          </button>
          <Link
            to={`/admin/assignments/students/${row.id}/history`}
            state={backState(`/admin/assignments/advisors/${advisorId}`, `Advisor ${advisorName}`)}
            className={advisorStudentBtn}
          >
            History
          </Link>
        </div>
      ),
    },
  ];
}
