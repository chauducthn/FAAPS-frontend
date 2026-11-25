import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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

      <section aria-labelledby="course-rules" className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="course-rules" className="text-base font-semibold text-[#151c27]">
              Course conditions
            </h2>
            <p className="mt-0.5 text-sm text-[#555f6f]">
              {byCourse.size === 1 ? '1 course has its own condition.' : `${byCourse.size} courses have their own condition.`} Edit a course to change it.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3">
            <Search className="size-4 text-[#98a2b3]" aria-hidden />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by course code or name..."
              aria-label="Search courses"
              className="flex-1 bg-transparent text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3]"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-[#151c27]">
            <input
              type="checkbox"
              checked={customOnly}
              onChange={(e) => {
                setCustomOnly(e.target.checked);
                setPage(0);
              }}
              className="size-4 accent-[#f37021]"
            />
            Custom only
          </label>
        </div>

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
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="courses" onChange={setPage} />
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
