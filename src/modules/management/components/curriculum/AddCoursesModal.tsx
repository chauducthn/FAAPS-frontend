// src/components/management/curriculum/AddCoursesModal.tsx
// Check-box picker that attaches several courses to one semester of a curriculum.
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { Pagination } from '../Pagination';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { CourseSummary } from '../../../academic/types/course';

interface Props {
  open: boolean;
  defaultSemester: number;
  /** course id -> semester it is already placed in */
  placedCourses: Map<string, number>;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (body: { courseIds: string[]; semesterNumber: number; isMandatory: boolean }) => Promise<unknown>;
}

const PAGE_SIZE = 8;

export default function AddCoursesModal({ open, defaultSemester, placedCourses, isSubmitting, onClose, onSubmit }: Props) {
  const [semester, setSemester] = useState(String(defaultSemester));
  const [mandatory, setMandatory] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Map<string, CourseSummary>>(new Map());
  const debounced = useDebounce(search, 250);

  useEffect(() => {
    if (!open) return;
    setSemester(String(defaultSemester));
    setMandatory(true);
    setSearch('');
    setPage(0);
    setSelected(new Map());
  }, [open, defaultSemester]);

  const { data, isFetching } = useCoursesQuery({ search: debounced || undefined, status: 'ACTIVE', page, size: PAGE_SIZE });
  const items = data?.items ?? [];
  const semesterNumber = Number(semester);
  const semesterInvalid = !Number.isInteger(semesterNumber) || semesterNumber < 1 || semesterNumber > 20;

  const toggle = (course: CourseSummary) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(course.id)) next.delete(course.id);
      else next.set(course.id, course);
      return next;
    });

  const selectable = items.filter((c) => !placedCourses.has(c.id));
  const allOnPageSelected = selectable.length > 0 && selectable.every((c) => selected.has(c.id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (allOnPageSelected) selectable.forEach((c) => next.delete(c.id));
      else selectable.forEach((c) => next.set(c.id, c));
      return next;
    });
  const totalCredits = [...selected.values()].reduce((sum, c) => sum + c.credits, 0);

  const submit = async () => {
    if (selected.size === 0 || semesterInvalid) return;
    try {
      await onSubmit({ courseIds: [...selected.keys()], semesterNumber, isMandatory: mandatory });
      onClose();
    } catch {
      // The error is shown by the mutation / global handler; keep the selection.
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add courses to curriculum" className="max-w-3xl">
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Add courses</h2>
          <p className="mt-0.5 text-xs text-gray-500">Tick the courses to place in one semester of this curriculum.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto px-6 py-5 text-xs">
        <div className="grid items-end gap-3 sm:grid-cols-[140px_1fr_auto]">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase text-gray-600">Semester</label>
            <input
              type="number"
              min={1}
              max={20}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              aria-label="Semester number"
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none ${semesterInvalid ? 'border-red-400' : 'border-gray-200 focus:border-[#F26F21]'}`}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search courses by code or name..."
              aria-label="Search courses"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 focus:border-[#F26F21] focus:outline-none"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 pb-2 text-gray-800">
            <input type="checkbox" checked={mandatory} onChange={(e) => setMandatory(e.target.checked)} className="size-4 accent-[#F26F21]" />
            Mandatory
          </label>
        </div>
        {semesterInvalid && <p className="text-[11px] text-red-600">Semester must be a whole number from 1 to 20.</p>}

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
                <th className="w-10 p-2.5 text-center">
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} disabled={selectable.length === 0} aria-label="Select all on this page" className="size-4 accent-[#F26F21]" />
                </th>
                <th className="p-2.5">Code</th>
                <th className="p-2.5">Name</th>
                <th className="p-2.5 text-center">Credits</th>
                <th className="p-2.5">In curriculum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    {isFetching ? 'Loading courses...' : 'No matching course.'}
                  </td>
                </tr>
              )}
              {items.map((course) => {
                const placed = placedCourses.get(course.id);
                const checked = selected.has(course.id);
                return (
                  <tr key={course.id} data-testid="pick-row" className={placed ? 'bg-gray-50/60 text-gray-400' : checked ? 'bg-orange-50/40' : ''}>
                    <td className="p-2.5 text-center">
                      <input type="checkbox" checked={checked} disabled={placed !== undefined} onChange={() => toggle(course)} aria-label={`Select ${course.code}`} className="size-4 accent-[#F26F21]" />
                    </td>
                    <td className="p-2.5 font-bold">{course.code}</td>
                    <td className="p-2.5">{course.name}</td>
                    <td className="p-2.5 text-center">{course.credits}</td>
                    <td className="p-2.5">{placed !== undefined ? `Semester ${placed}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={data?.totalItems ?? 0} noun="courses" onChange={setPage} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 text-xs">
        <span className="text-gray-600" data-testid="pick-summary">
          {selected.size} course{selected.size === 1 ? '' : 's'} selected · {totalCredits} credits
        </span>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            disabled={selected.size === 0 || semesterInvalid || isSubmitting}
            onClick={submit}
            className="rounded-lg bg-[#F26F21] px-4 py-2 font-bold text-white hover:bg-[#e05f14] disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : `Add to semester ${semesterInvalid ? '' : semesterNumber}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
