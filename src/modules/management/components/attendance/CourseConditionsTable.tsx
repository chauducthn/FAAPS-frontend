import { cn } from '@/shared/lib/utils';
import { maxAbsentSessions, type AttendanceRule } from '../../types/attendance';

export interface CourseAttendanceRow {
  id: string;
  code: string;
  name: string;
  rule: AttendanceRule;
  custom: boolean;
}

interface Props {
  rows: CourseAttendanceRow[];
  loading: boolean;
  isError: boolean;
  customOnly: boolean;
  isRemoving: boolean;
  onRetry: () => void;
  onEdit: (row: CourseAttendanceRow) => void;
  onReset: (row: CourseAttendanceRow) => void;
}

export function CourseConditionsTable({
  rows,
  loading,
  isError,
  customOnly,
  isRemoving,
  onRetry,
  onEdit,
  onReset,
}: Props) {
  return (
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
          {!loading && isError && !customOnly && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-red-600">
                Could not load the courses.{' '}
                <button type="button" onClick={onRetry} className="font-semibold hover:underline">
                  Retry
                </button>
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && !(isError && !customOnly) && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#555f6f]">
                {customOnly ? 'No course has its own condition yet.' : 'No courses match your search.'}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((r) => (
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
                      onClick={() => onEdit(r)}
                      aria-label={`Edit ${r.code}`}
                      className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    {r.custom && (
                      <button
                        type="button"
                        onClick={() => onReset(r)}
                        disabled={isRemoving}
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
  );
}
