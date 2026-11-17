import { maxAbsentSessions, type AttendanceRule } from '../../types/attendance';

/** The editable form of a rule: inputs keep the raw text so the admin can clear a box while typing. */
export interface RuleDraft {
  totalSessions: string;
  minAttendancePercent: string;
  warnAbsentSessions: string;
}

export const toDraft = (rule: AttendanceRule): RuleDraft => ({
  totalSessions: String(rule.totalSessions),
  minAttendancePercent: String(rule.minAttendancePercent),
  warnAbsentSessions: String(rule.warnAbsentSessions),
});

export const fromDraft = (d: RuleDraft): AttendanceRule => ({
  totalSessions: Number(d.totalSessions),
  minAttendancePercent: Number(d.minAttendancePercent),
  warnAbsentSessions: Number(d.warnAbsentSessions),
});

const inputClass =
  'h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-50';

interface Props {
  draft: RuleDraft;
  onChange: (draft: RuleDraft) => void;
  disabled?: boolean;
  idPrefix: string;
}

/** Total sessions, minimum attendance and warning point, plus the number of absences these allow. */
export function AttendanceRuleFields({ draft, onChange, disabled, idPrefix }: Props) {
  const rule = fromDraft(draft);
  const complete = draft.totalSessions !== '' && draft.minAttendancePercent !== '' && rule.totalSessions > 0 && rule.minAttendancePercent > 0;
  const maxAbsent = complete ? maxAbsentSessions(rule) : null;

  const field = (key: keyof RuleDraft, label: string, hint: string, props: { min: number; max?: number; step?: number }) => (
    <div>
      <label htmlFor={`${idPrefix}-${key}`} className="mb-1 block text-xs font-semibold text-[#151c27]">
        {label}
      </label>
      <input
        id={`${idPrefix}-${key}`}
        type="number"
        inputMode="numeric"
        value={draft[key]}
        disabled={disabled}
        onChange={(e) => onChange({ ...draft, [key]: e.target.value })}
        className={inputClass}
        {...props}
      />
      <p className="mt-1 text-[11px] text-[#555f6f]">{hint}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {field('totalSessions', 'Total sessions', 'Sessions in the course', { min: 1, max: 200 })}
        {field('minAttendancePercent', 'Minimum attendance (%)', 'e.g. 80', { min: 1, max: 100 })}
        {field('warnAbsentSessions', 'Warn at (absences)', 'Warn the student from this many absences', { min: 1 })}
      </div>
      <p className="rounded-lg bg-[#f7f8fa] px-3 py-2 text-[13px] text-[#555f6f]">
        {maxAbsent === null ? (
          'Fill in the sessions and the minimum attendance to see how many absences are allowed.'
        ) : (
          <>
            A student may miss up to <strong className="text-[#151c27]">{maxAbsent}</strong> session{maxAbsent === 1 ? '' : 's'}. Missing more fails the
            attendance condition.
          </>
        )}
      </p>
    </div>
  );
}
