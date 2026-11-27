// DataTable columns, detail adapter, and skeleton for StudentCourses.

import { Eye } from '@phosphor-icons/react';
import { WorkloadBadge } from '../../../academic/components/WorkloadBadge';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import type {
  Course as StudentCourse,
  CourseDetail as StudentCourseDetail,
} from '../../../academic/services/studentAcademicService';
import type { CourseDetail as AdminCourseDetail } from '../../../academic/types/course';

export function adaptStudentCourseDetail(data: StudentCourseDetail | undefined): AdminCourseDetail | null {
  if (!data) return null;
  const { course, prerequisites } = data;
  return {
    id: course.id,
    code: course.code,
    name: course.name,
    credits: course.credits,
    categoryId: course.category,
    categoryCode: course.category,
    categoryName: course.category,
    specialization: null,
    status: 'ACTIVE',
    prerequisiteCount: prerequisites.length,
    usedInCurriculumCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: course.description,
    objectives: course.objectives,
    learningOutcomes: course.learningOutcomes,
    materialLink: course.materialLink ?? null,
    knowledgeBlock: course.knowledgeBlock ?? null,
    gradingStructure: course.gradingStructure ?? null,
    workload: course.workload ?? null,
    relations: prerequisites.map((p) => ({
      relationId: p.id,
      kind: p.type === 'REPLACEMENT' ? 'REPLACEMENT' : 'PREREQUISITE',
      groupNo: p.groupNo,
      otherCourseId: p.courseCode,
      otherCourseCode: p.courseCode,
      otherCourseName: p.courseName,
      minimumScore: p.minimumScore,
    })),
    referencedBy: [],
  };
}

export function buildStudentCourseColumns(
  onSelect: (courseId: string) => void,
): DataTableColumnDef<StudentCourse>[] {
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
      enableSorting: false,
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onSelect(row.original.id)}
          title={`View detail of ${row.original.code}`}
          className="block max-w-[320px] truncate text-left font-semibold text-gray-900 transition-colors hover:text-[#C2410C] hover:underline"
        >
          {row.original.name}
        </button>
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
      accessorKey: 'category',
      header: 'Category',
      enableSorting: false,
      cell: ({ row }) => (
        <span
          title={row.original.category}
          className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-inset ring-slate-200"
        >
          {row.original.category || '—'}
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
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSelect(row.original.id)}
            aria-label={`View detail of ${row.original.code}`}
            title={`View detail of ${row.original.code}`}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-orange-50 hover:text-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
          >
            <Eye className="size-4" />
          </button>
        </div>
      ),
    },
  ];
}

export function StudentCoursesSkeleton() {
  return (
    <div className="p-4" aria-label="Loading courses">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-9 flex-1 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-9 w-40 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-4 py-3.5 last:border-0">
            <div className="h-6 w-20 animate-pulse rounded-lg bg-orange-100/70" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="hidden h-4 w-24 animate-pulse rounded bg-gray-100 sm:block" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-gray-400">Loading courses…</p>
    </div>
  );
}
