// src/components/admin/curriculum/SemesterPlanner.tsx
// Reads CurriculumDetail (semesters + courses) and lets Admin add/edit/remove rows
// within a curriculum. The accordion pattern keeps semester_number groups readable.

import { useState } from 'react';
import { ChevronDown, Plus, Trash2, Edit3 } from 'lucide-react';
import type { CurriculumCourseItem, CurriculumSemester } from '../../../types/curriculum';

interface Props {
  semesters: CurriculumSemester[];
  readonly?: boolean;
  onAddCourse?: (semesterNumber: number) => void;
  onEditCourse?: (course: CurriculumCourseItem, semesterNumber: number) => void;
  onRemoveCourse?: (course: CurriculumCourseItem, semesterNumber: number) => void;
}

export default function SemesterPlanner({
  semesters,
  readonly,
  onAddCourse,
  onEditCourse,
  onRemoveCourse,
}: Props) {
  const [open, setOpen] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(semesters.map((s) => [s.semesterNumber, true])),
  );
  const showActions = !readonly && (onEditCourse || onRemoveCourse);

  return (
    <div className="space-y-3">
      {semesters.length === 0 && (
        <p className="text-xs text-gray-500 italic">
          No courses are currently assigned to this curriculum.
        </p>
      )}
      {semesters.map((s) => (
        <div key={s.semesterNumber} className="border border-gray-200 rounded-xl bg-white shadow-2xs">
          <button
            onClick={() => setOpen((p) => ({ ...p, [s.semesterNumber]: !p[s.semesterNumber] }))}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/60"
          >
            <div className="flex items-center gap-3">
              <ChevronDown
                className={`size-4 text-gray-400 transition-transform ${
                  open[s.semesterNumber] ? '' : '-rotate-90'
                }`}
              />
              <span className="text-sm font-bold text-gray-900">
                Semester {s.semesterNumber}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-500">
                {s.courses.length} courses · {s.totalCredits} credits
              </span>
            </div>
            {!readonly && onAddCourse && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddCourse(s.semesterNumber);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#F26F21] hover:bg-orange-50 rounded-md"
              >
                <Plus className="size-3.5" />
                Add Course
              </button>
            )}
          </button>
          {open[s.semesterNumber] && (
            <div className="border-t border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                    <th className="p-3">Code</th>
                    <th className="p-3">Name</th>
                    <th className="p-3 text-center">Credits</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Group</th>
                    {showActions && <th className="p-3 w-20 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {s.courses.length === 0 && (
                    <tr>
                      <td colSpan={showActions ? 7 : 6} className="p-4 text-center text-gray-400">
                        No courses in this semester yet.
                      </td>
                    </tr>
                  )}
                  {s.courses.map((c) => (
                    <tr key={c.curriculumCourseId} className="hover:bg-gray-50/60">
                      <td className="p-3 font-bold text-gray-900">{c.courseCode}</td>
                      <td className="p-3">{c.courseName}</td>
                      <td className="p-3 text-center">{c.credits}</td>
                      <td className="p-3 text-gray-600">{c.categoryCode}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.isMandatory
                              ? 'bg-emerald-100/70 text-emerald-700'
                              : 'bg-amber-100/80 text-amber-700'
                          }`}
                        >
                          {c.isMandatory ? 'Mandatory' : 'Elective'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{c.groupName ?? '—'}</td>
                      {showActions && (
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            {onEditCourse && (
                              <button
                                onClick={() => onEditCourse(c, s.semesterNumber)}
                                className="p-1 text-gray-500 hover:text-gray-900"
                                title="Edit"
                              >
                                <Edit3 className="size-3.5" />
                              </button>
                            )}
                            {onRemoveCourse && (
                              <button
                                onClick={() => onRemoveCourse(c, s.semesterNumber)}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Remove"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
