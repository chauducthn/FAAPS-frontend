import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';
import { useAttendanceConfigMutations, useAttendanceDefaultRule, useAttendanceOverrides } from '../../hooks/queries/useAttendance';
import { validateRule } from '../../services/attendance.service';
import { maxAbsentSessions, type AttendanceRule } from '../../types/attendance';
import { Pagination } from '../Pagination';
import { AttendanceRuleFields, fromDraft, toDraft, type RuleDraft } from './AttendanceRuleFields';
import { CourseRuleModal } from './CourseRuleModal';

const PAGE_SIZE = 10;

interface Row {
  id: string;
  code: string;
  name: string;
  rule: AttendanceRule;
  custom: boolean;
}

function DefaultRuleCard({ rule }: { rule: AttendanceRule | undefined }) {
  const { saveDefault } = useAttendanceConfigMutations();
  const [draft, setDraft] = useState<RuleDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rule) setDraft(toDraft(rule));
  }, [rule]);

  const dirty = !!rule && !!draft && JSON.stringify(toDraft(rule)) !== JSON.stringify(draft);

  const save = async () => {
    if (!draft) return;
    const value = fromDraft(draft);
    const invalid = validateRule(value);
    if (invalid) return setError(invalid);
    setError(null);
    try {
      await saveDefault.mutateAsync(value);
      toast.success('Default attendance condition saved.');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <section aria-labelledby="default-rule" className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 id="default-rule" className="text-base font-semibold text-[#151c27]">
          Default condition
        </h2>
        <p className="mt-0.5 text-sm text-[#555f6f]">Used by every course that has no condition of its own.</p>
      </div>
      {draft ? (
        <AttendanceRuleFields draft={draft} onChange={setDraft} idPrefix="default-rule" disabled={saveDefault.isPending} />
      ) : (
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {dirty && (
          <button type="button" onClick={() => rule && setDraft(toDraft(rule))} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200">
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saveDefault.isPending}
          className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
        >
          {saveDefault.isPending ? 'Saving...' : 'Save default'}
        </button>
      </div>
    </section>
  );
}

/** Default attendance condition plus the courses that override it. */
export function AttendanceConfigTab() {
  const defaultRule = useAttendanceDefaultRule();
  const overrides = useAttendanceOverrides();
  const { saveOverride, removeOverride } = useAttendanceConfigMutations();
  const [search, setSearch] = useState('');
  const [customOnly, setCustomOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);

  const courses = useCoursesQuery({ search: search || undefined, page, size: PAGE_SIZE, sort: 'code,asc' });
  const byCourse = useMemo(() => new Map((overrides.data ?? []).map((o) => [o.courseId, o])), [overrides.data]);

  const rows: Row[] = useMemo(() => {
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

  const reset = async (row: Row) => {
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

        <div className="overflow-x-auto rounded-lg border border-[#e7eefe]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[rgba(240,243,255,0.7)] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Sessions</th>
                <th className="px-4 py-3">Min attendance</th>
                <th className="px-4 py-3">Max absent</th>
                <th className="px-4 py-3">Warn at</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#e7eefe]">
                    <td colSpan={7} className="px-4 py-5">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))}
              {!loading && courses.isError && !customOnly && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-red-600">
                    Could not load the courses.{' '}
                    <button type="button" onClick={() => courses.refetch()} className="font-semibold hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              )}
              {!loading && visible.length === 0 && !(courses.isError && !customOnly) && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#555f6f]">
                    {customOnly ? 'No course has its own condition yet.' : 'No courses match your search.'}
                  </td>
                </tr>
              )}
              {!loading &&
                visible.map((r) => (
                  <tr key={r.id} className="border-t border-[#e7eefe]">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#151c27]">{r.code}</span>
                      {r.name && <span className="block max-w-[260px] truncate text-xs text-[#555f6f]">{r.name}</span>}
                    </td>
                    <td className="px-4 py-3 text-[#151c27]">{r.rule.totalSessions}</td>
                    <td className="px-4 py-3 text-[#151c27]">{r.rule.minAttendancePercent}%</td>
                    <td className="px-4 py-3 font-semibold text-[#151c27]">{maxAbsentSessions(r.rule)}</td>
                    <td className="px-4 py-3 text-[#b45309]">{r.rule.warnAbsentSessions}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          r.custom ? 'bg-[#fff7ed] text-[#c2410c]' : 'bg-gray-100 text-[#555f6f]',
                        )}
                      >
                        {r.custom ? 'Custom' : 'Default'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(r)}
                          aria-label={`Edit ${r.code}`}
                          className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        {r.custom && (
                          <button
                            type="button"
                            onClick={() => reset(r)}
                            disabled={removeOverride.isPending}
                            aria-label={`Use default for ${r.code}`}
                            className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50 disabled:opacity-50"
                          >
                            Use default
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
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
            await saveOverride.mutateAsync({ courseId: editing.id, courseCode: editing.code, courseName: editing.name, rule });
            toast.success(`Attendance condition saved for ${editing.code}.`);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
