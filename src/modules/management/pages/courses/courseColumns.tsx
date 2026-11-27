import { toast } from 'sonner';
import { StatusBadge } from '../../components/StatusBadge';
import { RowActionMenu } from '../../components/RowActionMenu';
import { WorkloadBadge } from '../../../academic/components/WorkloadBadge';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import type { CourseSummary } from '../../../academic/types/course';

export function createCourseColumns(handlers: {
  onView: (id: string) => void;
  onEdit: (course: CourseSummary) => void;
  onDelete: (course: CourseSummary) => void;
}): DataTableColumnDef<CourseSummary>[] {
  return [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-semibold text-ink-primary">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Course Name',
      cell: ({ row }) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => handlers.onView(row.original.id)}
            title={`View detail of ${row.original.code}`}
            className="block max-w-[280px] truncate text-left font-semibold text-ink-primary transition-colors hover:text-brand-ink hover:underline"
          >
            {row.original.name}
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'credits',
      header: 'Credits',
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-semibold tabular-nums text-brand-ink">
          {row.original.credits}
        </span>
      ),
    },
    {
      accessorKey: 'categoryCode',
      header: 'Category Code',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-ink-secondary">
          {row.original.categoryCode || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'categoryName',
      header: 'Category Name',
      cell: ({ row }) => (
        <span
          className="block max-w-[180px] truncate text-[13px] text-ink-muted"
          title={row.original.categoryName}
        >
          {row.original.categoryName || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'prerequisiteCount',
      header: 'Prereq',
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="text-[13px] font-semibold tabular-nums text-ink-secondary">
          {row.original.prerequisiteCount}
        </span>
      ),
    },
    {
      id: 'workload',
      header: 'Workload',
      enableSorting: false,
      cell: ({ row }) => <WorkloadBadge workload={row.original.workload} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex justify-end">
            <RowActionMenu
              label={`Actions for ${course.code}`}
              actions={[
                { label: 'View detail', onSelect: () => handlers.onView(course.id) },
                { label: 'Edit course', onSelect: () => handlers.onEdit(course) },
                {
                  label: 'Delete course',
                  danger: true,
                  onSelect: () => {
                    if (course.usedInCurriculumCount > 0) {
                      toast.error(
                        `${course.code} is used in ${course.usedInCurriculumCount} curriculum${
                          course.usedInCurriculumCount === 1 ? '' : 's'
                        }. Remove it from them first.`,
                      );
                      return;
                    }
                    handlers.onDelete(course);
                  },
                },
              ]}
            />
          </div>
        );
      },
    },
  ];
}
