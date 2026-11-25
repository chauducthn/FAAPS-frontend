// Course detail modal for AdvisorAcademicLookup.

import { Modal } from '../../../../shared/components/ui/Modal';
import type { LookupCourse } from '../../types/academic-lookup';

const formatCredits = (n: number) => `${n} cr`;

export function CourseLookupModal({
  course,
  onClose,
  onOpenCourse,
}: {
  course: LookupCourse | null;
  onClose: () => void;
  onOpenCourse: (code: string) => void;
}) {
  if (!course) return null;

  return (
    <Modal open={!!course} onClose={onClose} title={`Course ${course.code}`} className="max-w-2xl">
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 pb-5 pt-6 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-white/15" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 right-24 size-32 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white px-3 text-sm font-extrabold text-[#c2410c] shadow">
              {course.code}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white">
                {course.category} · {formatCredits(course.credits)}
              </p>
              <h2 className="mt-0.5 truncate text-xl font-extrabold">{course.name}</h2>
              <p className="mt-0.5 text-sm font-medium text-white/95">{course.code}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-900">
              {formatCredits(course.credits)}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#fafbfd] p-5">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">Description</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{course.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-900">Objectives</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{course.objectives}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-900">Learning outcomes</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{course.learningOutcomes}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">
                Prerequisites{' '}
                {course.prerequisites.length > 0 && (
                  <span className="ml-1 text-xs font-bold text-slate-600">({course.prerequisites.length})</span>
                )}
              </h3>
              {course.prerequisites.length === 0 ? (
                <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600">
                  No prerequisites — sinh viên có thể đăng ký trực tiếp.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {course.prerequisites.map((p) => (
                    <li
                      key={`${p.courseCode}-${p.groupNo}`}
                      className="flex flex-wrap items-center gap-2 rounded-xl bg-[#f7f8fa] px-3 py-2.5 text-sm"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenCourse(p.courseCode)}
                        className="font-bold text-[#F26F21] hover:underline"
                      >
                        {p.courseCode}
                      </button>
                      <span className="font-medium text-slate-700">{p.courseName}</span>
                      <span className="ml-auto inline-flex items-center gap-1.5">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-900">
                          Group {p.groupNo}
                        </span>
                        {p.minimumScore !== null && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                            ≥ {p.minimumScore.toFixed(1)}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-sm italic text-slate-600">
                Các môn cùng group là lựa chọn thay thế (chỉ cần 1); khác group phải hoàn thành tất cả.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">Syllabus</h3>
              {course.syllabus.length === 0 ? (
                <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600">
                  Chưa có dữ liệu tuần học cho môn này.
                </p>
              ) : (
                <ol className="mt-3 space-y-3">
                  {course.syllabus.map((w) => (
                    <li key={w.week} className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fff3ea] text-xs font-bold text-[#F26F21]">
                        {w.week}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{w.topic}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{w.content}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
