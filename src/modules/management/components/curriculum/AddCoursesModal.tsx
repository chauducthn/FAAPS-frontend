// Check-box picker that attaches several courses to one semester of a curriculum.
import { useEffect, useState } from 'react';
import { BookPlus, Loader2, Lock, Search, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Modal } from '../../../../shared/components/ui/Modal';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { CourseSummary } from '../../../academic/types/course';
import { AddCoursesTable } from './AddCoursesTable';

interface Props {
  open: boolean;
  defaultSemester: number;
  placedCourses: Map<string, number>;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (body: { courseIds: string[]; semesterNumber: number }) => Promise<unknown>;
}

const PAGE_SIZE = 8;

export default function AddCoursesModal({ open, defaultSemester, placedCourses, isSubmitting, onClose, onSubmit }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Map<string, CourseSummary>>(new Map());
  const debounced = useDebounce(search, 250);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setPage(0);
    setSelected(new Map());
  }, [open, defaultSemester]);

  const { data, isFetching } = useCoursesQuery({
    search: debounced || undefined,
    status: 'ACTIVE',
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

  const submit = async () => {
    if (selected.size === 0) return;
    try {
      await onSubmit({ courseIds: [...selected.keys()], semesterNumber: defaultSemester });
      onClose();
    } catch {
      return;
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
        </div>

        <AddCoursesTable
          items={items}
          isFetching={isFetching}
          placedCourses={placedCourses}
          selected={selected}
          allOnPageSelected={allOnPageSelected}
          selectableCount={selectable.length}
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={data?.totalItems ?? 0}
          onToggle={toggle}
          onToggleAll={toggleAll}
          onPageChange={setPage}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-700" data-testid="pick-summary">
          <span className={cn('rounded-lg px-2.5 py-1 tabular-nums', selected.size > 0 ? 'bg-[#F26F21] text-white' : 'bg-gray-200 text-gray-500')}>
            {selected.size}
          </span>
          course{selected.size === 1 ? '' : 's'} · {totalCredits} credits → Sem {defaultSemester}
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
