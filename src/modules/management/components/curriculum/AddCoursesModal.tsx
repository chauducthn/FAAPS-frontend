// src/components/management/curriculum/AddCoursesModal.tsx
// Check-box picker that attaches several courses to one semester of a curriculum.
// FPT logic: the semester is LOCKED (read-only) — the admin opened the picker from one
// semester column, so courses can only go there. No Mandatory/Elective concept;
// from semester 5 the catalogue is grouped by narrow specialization (Chuyên ngành hẹp),
// deep-dived in semesters 7-9 (Node.js, .NET, Game Development, ...).
import { useEffect, useMemo, useState } from 'react';
import { BookPlus, Check, Loader2, Lock, Search, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Modal } from '../../../../shared/components/ui/Modal';
import { Pagination } from '../Pagination';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { MOCK_SPECIALIZATIONS } from '../../mocks/curriculumSupportMockData';
import type { CourseSummary } from '../../../academic/types/course';

interface Props {
  open: boolean;
  /** Semester column the picker was opened from — courses can ONLY go here. */
  defaultSemester: number;
  /** course id -> semester it is already placed in */
  placedCourses: Map<string, number>;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (body: { courseIds: string[]; semesterNumber: number }) => Promise<unknown>;
}

const PAGE_SIZE = 8;

export default function AddCoursesModal({ open, defaultSemester, placedCourses, isSubmitting, onClose, onSubmit }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [specialization, setSpecialization] = useState<string>('ALL');
  const [selected, setSelected] = useState<Map<string, CourseSummary>>(new Map());
  const debounced = useDebounce(search, 250);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setPage(0);
    setSpecialization('ALL');
    setSelected(new Map());
  }, [open, defaultSemester]);

  const { data, isFetching } = useCoursesQuery({
    search: debounced || undefined,
    status: 'ACTIVE',
    specialization: specialization === 'ALL' ? undefined : specialization,
    page,
    size: PAGE_SIZE,
  });
  const items = data?.items ?? [];

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
  const specializationHint = useMemo(() => {
    if (defaultSemester >= 7) return 'Semester 7–9 focuses on narrow specializations — filter to pick the right track.';
    if (defaultSemester >= 5) return 'From semester 5 students orient toward a narrow specialization.';
    return null;
  }, [defaultSemester]);

  const submit = async () => {
    if (selected.size === 0) return;
    try {
      await onSubmit({ courseIds: [...selected.keys()], semesterNumber: defaultSemester });
      onClose();
    } catch {
      // The error is shown by the mutation / global handler; keep the selection.
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add courses to curriculum" className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] to-white px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
            <BookPlus className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-gray-900">Add courses to semester {defaultSemester}</h2>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <Lock className="size-3 text-gray-400" /> Locked to semester {defaultSemester} — tick courses from the catalogue.
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto px-6 py-5">
        <div className="grid items-end gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-[120px_1fr_1fr]">
          <div>
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">Semester</label>
            <div
              aria-label="Semester number (locked)"
              title={`Courses will be added to semester ${defaultSemester}`}
              className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2.5 font-mono text-sm font-extrabold tabular-nums text-[#9a3412]"
            >
              <Lock className="size-3.5" /> Sem {defaultSemester}
            </div>
          </div>
          <div className="relative">
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">Catalogue</label>
            <Search className="absolute bottom-3 left-3.5 size-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search courses by code or name…"
              aria-label="Search courses"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3.5 text-[13px] focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
              Specialization <span className="font-medium normal-case tracking-normal text-gray-400">(Chuyên ngành hẹp)</span>
            </label>
            <select
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by specialization"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
            >
              <option value="ALL">All tracks</option>
              {MOCK_SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {specializationHint && (
          <p className="rounded-xl bg-violet-50 px-3.5 py-2 text-[12px] font-medium leading-relaxed text-violet-800 ring-1 ring-violet-200">
            {specializationHint}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
                <th className="w-11 p-3 text-center">
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} disabled={selectable.length === 0} aria-label="Select all on this page" className="size-4 accent-[#F26F21]" />
                </th>
                <th className="p-3">Course</th>
                <th className="p-3">Specialization</th>
                <th className="p-3 text-center">Credits</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isFetching && items.length === 0 && (
                <>
                  {[0, 1, 2].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-3 py-2">
                        <div className="h-10 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
                      </td>
                    </tr>
                  ))}
                </>
              )}
              {!isFetching && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <p className="text-sm font-bold text-gray-900">No matching course</p>
                    <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">Try another keyword or specialization, or add the course in the catalogue first.</p>
                  </td>
                </tr>
              )}
              {items.map((course) => {
                const placed = placedCourses.get(course.id);
                const checked = selected.has(course.id);
                const locked = placed !== undefined;
                return (
                  <tr
                    key={course.id}
                    data-testid="pick-row"
                    onClick={() => !locked && toggle(course)}
                    className={cn(
                      'cursor-pointer transition-colors',
                      locked ? 'cursor-not-allowed bg-gray-50/70' : checked ? 'bg-orange-50/60 hover:bg-orange-50' : 'hover:bg-gray-50/70',
                    )}
                  >
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <span className={cn(
                        'mx-auto flex size-5 items-center justify-center rounded-md border-2 transition-all',
                        checked ? 'border-[#F26F21] bg-[#F26F21] text-white' : 'border-gray-300 bg-white text-transparent',
                        locked && 'border-gray-200 bg-gray-100',
                      )}>
                        <Check className="size-3.5" strokeWidth={3.5} />
                        <input type="checkbox" checked={checked} disabled={locked} onChange={() => toggle(course)} aria-label={`Select ${course.code}`} className="sr-only" />
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={cn('rounded-md px-1.5 py-0.5 font-mono text-[12px] font-bold', locked ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-white')}>
                        {course.code}
                      </span>
                      <span className={cn('ml-2 font-semibold', locked ? 'text-gray-400' : 'text-gray-900')}>{course.name}</span>
                    </td>
                    <td className="p-3">
                      {course.specialization ? (
                        <span className={cn('inline-block rounded-full px-2.5 py-1 text-[11px] font-bold', locked ? 'bg-gray-100 text-gray-400' : 'bg-violet-100 text-violet-800')}>
                          {course.specialization}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-400">Foundation</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={cn('font-mono font-bold tabular-nums', locked ? 'text-gray-300' : 'text-gray-900')}>{course.credits} cr</span>
                    </td>
                    <td className="p-3 text-right">
                      {locked ? (
                        <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-400">Sem {placed}</span>
                      ) : checked ? (
                        <span className="inline-block rounded-full bg-[#F26F21] px-2.5 py-1 text-[11px] font-bold text-white">Selected</span>
                      ) : (
                        <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={data?.totalItems ?? 0} noun="courses" onChange={setPage} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-700" data-testid="pick-summary">
          <span className={cn('rounded-lg px-2.5 py-1 tabular-nums', selected.size > 0 ? 'bg-[#F26F21] text-white' : 'bg-gray-200 text-gray-500')}>
            {selected.size}
          </span>
          course{selected.size === 1 ? '' : 's'} · {totalCredits} credits → Sem {defaultSemester}
          {specialization !== 'ALL' && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] text-violet-800">{specialization}</span>}
        </span>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            disabled={selected.size === 0 || isSubmitting}
            onClick={submit}
            className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-[#F26F21] px-5 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
            {isSubmitting ? 'Adding…' : `Add ${selected.size > 0 ? selected.size : ''} to Sem ${defaultSemester}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
