import type { CourseDetail } from '../../../academic/types/course';

interface Props {
  prereqs: NonNullable<CourseDetail['relations']>;
  replacements: NonNullable<CourseDetail['relations']>;
  referencedBy: NonNullable<CourseDetail['referencedBy']>;
  onNavigate: (code: string) => void;
}

export function CourseRelationsContent({ prereqs, replacements, referencedBy, onNavigate }: Props) {
  return (
    <div className="space-y-3">
      {prereqs.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Prerequisites ({prereqs.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {prereqs.map((r, idx) => (
              <button
                key={`${r.otherCourseCode}-${idx}`}
                type="button"
                onClick={() => onNavigate(r.otherCourseCode)}
                title={r.otherCourseName}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono font-semibold text-gray-800 hover:border-orange-300 hover:bg-orange-50 hover:text-[#C2410C]"
              >
                {r.otherCourseCode}
              </button>
            ))}
          </div>
        </div>
      )}
      {replacements.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Equivalent / Replacement
          </p>
          <div className="flex flex-wrap gap-1.5">
            {replacements.map((r, idx) => (
              <button
                key={`${r.otherCourseCode}-${idx}`}
                type="button"
                onClick={() => onNavigate(r.otherCourseCode)}
                className="rounded-lg border border-indigo-200 bg-indigo-50/60 px-2.5 py-1 font-mono font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                {r.otherCourseCode}
              </button>
            ))}
          </div>
        </div>
      )}
      {referencedBy.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Unlocks ({referencedBy.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {referencedBy.map((r) => (
              <button
                key={r.courseId}
                type="button"
                onClick={() => onNavigate(r.courseCode)}
                title={r.courseName}
                className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-1 font-mono font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                {r.courseCode}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
