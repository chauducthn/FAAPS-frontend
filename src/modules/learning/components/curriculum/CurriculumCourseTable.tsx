import { CaretRight, CheckCircle, Clock, WarningCircle } from '@phosphor-icons/react';
import type { CurriculumCourse, TranscriptRow } from '../../../academic/services/studentAcademicService';
import { classifyStatus } from './curriculumCourseHelpers';

function StatusBadge({ row }: { row?: TranscriptRow }) {
  const kind = classifyStatus(row);
  const score = row?.finalScore != null ? ` · ${row.finalScore.toFixed(1)}` : '';
  if (kind === 'PASSED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle className="size-3.5" weight="fill" />
        Passed{score}
      </span>
    );
  }
  if (kind === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        <Clock className="size-3.5" weight="fill" />
        Studying
      </span>
    );
  }
  if (kind === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
        <WarningCircle className="size-3.5" weight="fill" />
        Failed{score}
      </span>
    );
  }
  return <span className="text-xs text-gray-400">Not taken</span>;
}

interface CurriculumCourseTableProps {
  courses: CurriculumCourse[];
  transcriptByCode: Map<string, TranscriptRow>;
  showSemester: boolean;
  onSelect: (course: CurriculumCourse) => void;
}

export function CurriculumCourseTable({
  courses,
  transcriptByCode,
  showSemester,
  onSelect,
}: CurriculumCourseTableProps) {
  if (courses.length === 0) {
    return <div className="py-10 text-center text-sm text-gray-500">No courses found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {showSemester && <th className="w-16 py-2.5 pl-5 pr-3">Sem</th>}
            <th className={`w-28 py-2.5 ${showSemester ? 'px-3' : 'pl-5 pr-3'}`}>Code</th>
            <th className="px-3 py-2.5">Course Name</th>
            <th className="w-20 px-3 py-2.5 text-center">Credits</th>
            <th className="hidden w-44 px-3 py-2.5 sm:table-cell">Type / Group</th>
            <th className="w-36 px-3 py-2.5">Status</th>
            <th className="w-10 py-2.5 pr-5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-[13px]">
          {courses.map((course) => {
            const row = transcriptByCode.get(course.code.trim().toUpperCase());
            return (
              <tr
                key={`${course.semesterNumber}-${course.code}-${course.courseId}`}
                onClick={() => onSelect(course)}
                className="group cursor-pointer transition-colors hover:bg-orange-50/40"
              >
                {showSemester && (
                  <td className="py-3.5 pl-5 pr-3 font-mono text-xs font-semibold text-gray-500">
                    Sem {course.semesterNumber}
                  </td>
                )}
                <td className={`py-3.5 ${showSemester ? 'px-3' : 'pl-5 pr-3'}`}>
                  <span className="font-mono text-xs font-bold text-gray-900 group-hover:text-[#C2410C]">
                    {course.code}
                  </span>
                </td>
                <td className="px-3 py-3.5 font-medium text-gray-800">{course.name}</td>
                <td className="px-3 py-3.5 text-center font-mono text-xs font-semibold text-gray-700">
                  {course.credits}
                </td>
                <td className="hidden px-3 py-3.5 sm:table-cell">
                  {course.groupName ? (
                    <span className="inline-flex max-w-[165px] truncate rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                      {course.groupName}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {course.mandatory ? 'Mandatory' : 'Elective'}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3.5">
                  <StatusBadge row={row} />
                </td>
                <td className="py-3.5 pr-5 text-right">
                  <CaretRight className="ml-auto size-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#F26F21]" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
