import { toast } from 'sonner';
import { StatusBadge } from '../../components/StatusBadge';
import { RowActionMenu } from '../../components/RowActionMenu';
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
        <span className="inline-flex items-center rounded-lg bg-gray-900 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Course Name',
      // The backend whitelist has no `name` sort, so the column is not sortable.
      enableSorting: false,
      cell: ({ row }) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => handlers.onView(row.original.id)}
            title={`View detail of ${row.original.code}`}
            className="block max-w-[280px] truncate text-left font-semibold text-gray-900 transition-colors hover:text-[#C2410C] hover:underline"
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
        <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-orange-50 px-2 py-0.5 font-mono text-[12px] font-bold tabular-nums text-[#9a3412] ring-1 ring-orange-200">
          {row.original.credits}
        </span>
      ),
    },
    {
      accessorKey: 'categoryCode',
      header: 'Category',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="min-w-0" title={row.original.categoryName}>
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-bold text-gray-700">
            {row.original.categoryCode}
          </span>
          <p className="mt-0.5 max-w-[180px] truncate text-[11px] font-medium text-gray-400">
            {row.original.categoryName}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'prerequisiteCount',
      header: 'Prereq',
      enableSorting: false,
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-bold tabular-nums text-gray-800">
          {row.original.prerequisiteCount}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
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
