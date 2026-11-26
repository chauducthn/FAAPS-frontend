import { useMemo, useState } from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';
import { useAttendanceConfigMutations, useAttendanceDefaultRule, useAttendanceOverrides } from '../../hooks/queries/useAttendance';
import { Pagination } from '../Pagination';
import { CourseRuleModal } from './CourseRuleModal';
import { CourseConditionsTable, type CourseAttendanceRow } from './CourseConditionsTable';
import { DefaultRuleCard } from './DefaultRuleCard';

const PAGE_SIZE = 10;

/** Default attendance condition plus the courses that override it. */
export function AttendanceConfigTab() {
  const defaultRule = useAttendanceDefaultRule();
  const overrides = useAttendanceOverrides();
  const { saveOverride, removeOverride } = useAttendanceConfigMutations();
  const [search, setSearch] = useState('');
  const [customOnly, setCustomOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<CourseAttendanceRow | null>(null);

  const courses = useCoursesQuery({ search: search || undefined, page, size: PAGE_SIZE, sort: 'code,asc' });
  const byCourse = useMemo(() => new Map((overrides.data ?? []).map((o) => [o.courseId, o])), [overrides.data]);

  const rows: CourseAttendanceRow[] = useMemo(() => {
    const base = defaultRule.data;
    if (!base) return [];
    if (customOnly) {
      const q = search.trim().toLowerCase();
      return (overrides.data ?? [])
        .filter((o) => !q || o.courseCode.toLowerCase().includes(q) || o.courseName.toLowerCase().includes(q))
        .sort((a, b) => a.courseCode.localeCompare(b.courseCode))
        .map((o) => ({ id: o.courseId, code: o.courseCode, name: o.courseName, rule: o, custom: true }));
    }
    return (courses.data?.items ?? []).map((c) => {
      const own = byCourse.get(c.id);
      return { id: c.id, code: c.code, name: c.name, rule: own ?? base, custom: !!own };
    });
  }, [customOnly, courses.data, overrides.data, byCourse, defaultRule.data, search]);

  const total = customOnly ? rows.length : (courses.data?.totalItems ?? 0);
  const visible = customOnly ? rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : rows;
  const loading = defaultRule.isLoading || overrides.isLoading || (!customOnly && courses.isLoading);

  const reset = async (row: CourseAttendanceRow) => {
    try {
      await removeOverride.mutateAsync(row.id);
      toast.success(`${row.code} now uses the default condition.`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <DefaultRuleCard rule={defaultRule.data} />

      <section aria-labelledby="course-rules" className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3.5">
          <div>
            <h2 id="course-rules" className="text-sm font-bold text-gray-900">
              Course conditions
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {byCourse.size === 1 ? '1 course has its own condition.' : `${byCourse.size} courses have their own condition.`} Edit a course to change it.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-3 lg:flex-nowrap">
          <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by course code or name..."
              aria-label="Search courses"
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-7 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(0);
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <label className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 hover:border-gray-300">
            <input
              type="checkbox"
              checked={customOnly}
              onChange={(e) => {
                setCustomOnly(e.target.checked);
                setPage(0);
              }}
              className="size-4 accent-[#F26F21]"
            />
            Custom only
          </label>
          <button
            type="button"
            disabled={!search && !customOnly}
            onClick={() => {
              setSearch('');
              setCustomOnly(false);
              setPage(0);
            }}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-default disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
          >
            <RotateCcw className="size-3.5" /> Reset
          </button>
        </div>

        <div className="min-h-[420px] p-4 sm:p-5">
          <CourseConditionsTable
            rows={visible}
            loading={loading}
            isError={courses.isError}
            customOnly={customOnly}
            isRemoving={removeOverride.isPending}
            onRetry={() => courses.refetch()}
            onEdit={setEditing}
            onReset={reset}
          />
          <div className="mt-4">
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="courses" onChange={setPage} />
          </div>
        </div>
      </section>

      {editing && (
        <CourseRuleModal
          key={editing.id}
          course={editing}
          rule={editing.rule}
          saving={saveOverride.isPending}
          onClose={() => setEditing(null)}
          onSave={async (rule) => {
            await saveOverride.mutateAsync({ courseId: editing.id, rule });
            toast.success(`Attendance condition saved for ${editing.code}.`);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
