import type { ChangeEvent } from 'react';
import { cn } from '@/shared/lib/utils';
import type { AcademicRuleType } from '../../../academic/types/academic-rule';
import type { CondDraft } from './ruleConditionDraft';
import {
  RULE_FIELD_CLASS,
  RULE_NUM_CLASS,
  RULE_SELECT_CLASS,
  RuleFormField,
  RuleToggleChip,
} from './RuleFormPrimitives';

type NumericKey =
  | 'minGpa'
  | 'maxCredits'
  | 'minCredits'
  | 'minAttendance'
  | 'consecutiveSemesters'
  | 'maxAttempts'
  | 'maxScoreForRetake'
  | 'maxRepeats'
  | 'minCreditsEarned';

interface Props {
  policyType: AcademicRuleType;
  cond: CondDraft;
  set: <K extends keyof CondDraft>(key: K, value: CondDraft[K]) => void;
  errors: Partial<Record<string, string>>;
  readOnly: boolean;
}

export function RuleConditionFields({ policyType, cond, set, errors, readOnly }: Props) {
  const numProps = (key: NumericKey) => ({
    type: 'number' as const,
    value: cond[key],
    disabled: readOnly,
    onChange: (e: ChangeEvent<HTMLInputElement>) => set(key, e.target.value === '' ? '' : Number(e.target.value)),
    className: RULE_NUM_CLASS,
  });

  switch (policyType) {
    case 'GPA_WARNING':
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <RuleFormField label="Applies to" required>
            <select value={cond.scope} disabled={readOnly} onChange={(e) => set('scope', e.target.value)} aria-label="GPA scope" className={RULE_SELECT_CLASS}>
              <option value="semester_gpa">Semester GPA</option>
              <option value="cumulative_gpa">Cumulative GPA</option>
            </select>
          </RuleFormField>
          <RuleFormField label="Warn when GPA is" required>
            <select value={cond.operator} disabled={readOnly} onChange={(e) => set('operator', e.target.value)} aria-label="GPA comparison" className={RULE_SELECT_CLASS}>
              <option value="<">Below ( &lt; )</option>
              <option value="<=">At or below ( ≤ )</option>
            </select>
          </RuleFormField>
          <RuleFormField label="Grade" required error={errors.minGpa} hint="e.g. 5.0">
            <input {...numProps('minGpa')} min={0} max={10} step="0.1" placeholder="5.0" aria-label="Grade" />
          </RuleFormField>
        </div>
      );
    case 'ACADEMIC_PROBATION':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <RuleFormField label="Grade" required error={errors.minGpa} hint="e.g. 4.5">
            <input {...numProps('minGpa')} min={0} max={10} step="0.1" placeholder="4.5" aria-label="Grade" />
          </RuleFormField>
          <RuleFormField label="Consecutive semesters" required error={errors.consecutiveSemesters} hint="How many terms in a row.">
            <input {...numProps('consecutiveSemesters')} min={1} max={10} placeholder="2" aria-label="Consecutive semesters" />
          </RuleFormField>
        </div>
      );
    case 'MAX_CREDITS_PER_SEMESTER':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <RuleFormField label="Grade" required error={errors.maxCredits} hint="e.g. 24">
            <input {...numProps('maxCredits')} min={1} max={60} placeholder="24" aria-label="Grade" />
          </RuleFormField>
          <div className="rounded-xl bg-orange-50 px-4 py-3 text-[11px] leading-relaxed text-[#7C2D12] ring-1 ring-orange-100 sm:mt-[26px] sm:self-start">
            Registrations above this number are blocked automatically.
          </div>
        </div>
      );
    case 'MIN_CREDITS_PER_SEMESTER':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <RuleFormField label="Grade" required error={errors.minCredits} hint="e.g. 12">
            <input {...numProps('minCredits')} min={1} max={60} placeholder="12" aria-label="Grade" />
          </RuleFormField>
          <RuleToggleChip checked={cond.fullTimeOnly} onChange={(v) => set('fullTimeOnly', v)} disabled={readOnly} label="Full-time students only" hint="Skip part-time / exchange" />
        </div>
      );
    case 'COURSE_REPEAT_LIMIT':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <RuleFormField label="Grade" required error={errors.maxRepeats} hint="e.g. 2">
            <input {...numProps('maxRepeats')} min={1} max={10} placeholder="2" aria-label="Grade" />
          </RuleFormField>
          <div className="rounded-xl bg-orange-50 px-4 py-3 text-[11px] leading-relaxed text-[#7C2D12] ring-1 ring-orange-100 sm:mt-[26px] sm:self-start">
            Further attempts need dean approval (toggle below).
          </div>
        </div>
      );
    case 'RETAKE':
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <RuleFormField label="Grade" required error={errors.maxScoreForRetake} hint="e.g. 5.0">
            <input {...numProps('maxScoreForRetake')} min={0} max={10} step="0.1" placeholder="5.0" aria-label="Grade" />
          </RuleFormField>
          <RuleFormField label="Comparison" required>
            <select value={cond.operator} disabled={readOnly} onChange={(e) => set('operator', e.target.value)} aria-label="Retake comparison" className={RULE_SELECT_CLASS}>
              <option value="<=">At or below ( ≤ )</option>
              <option value="<">Below ( &lt; )</option>
            </select>
          </RuleFormField>
          <RuleFormField label="Max attempts" required error={errors.maxAttempts} hint="e.g. 3">
            <input {...numProps('maxAttempts')} min={1} max={10} placeholder="3" aria-label="Max attempts" />
          </RuleFormField>
        </div>
      );
    case 'ADVANCED_STUDY':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <RuleFormField label="Grade" required error={errors.minGpa} hint="e.g. 8.0">
            <input {...numProps('minGpa')} min={0} max={10} step="0.1" placeholder="8.0" aria-label="Grade" />
          </RuleFormField>
          <RuleFormField label="Credits earned" required error={errors.minCreditsEarned} hint="e.g. 60">
            <input {...numProps('minCreditsEarned')} min={1} max={500} placeholder="60" aria-label="Credits earned" />
          </RuleFormField>
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1" role="radiogroup" aria-label="Rule kind">
            {([{ v: 'attendance', label: 'Attendance gate' }, { v: 'milestone', label: 'Credit milestone' }] as const).map((o) => (
              <button
                key={o.v}
                type="button"
                role="radio"
                aria-checked={cond.otherKind === o.v}
                disabled={readOnly}
                onClick={() => set('otherKind', o.v)}
                className={cn(
                  'rounded-lg px-3 py-2 text-center text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60',
                  cond.otherKind === o.v ? 'bg-white text-[#9A3412] shadow-xs ring-1 ring-orange-200' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          {cond.otherKind === 'attendance' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <RuleFormField label="Grade" required error={errors.minAttendance} hint="% of sessions, e.g. 80">
                <input {...numProps('minAttendance')} min={1} max={100} placeholder="80" aria-label="Grade" />
              </RuleFormField>
              <RuleFormField label="Comparison" required>
                <select value={cond.operator} disabled={readOnly} onChange={(e) => set('operator', e.target.value)} aria-label="Attendance comparison" className={RULE_SELECT_CLASS}>
                  <option value="<">Below ( &lt; )</option>
                  <option value="<=">At or below ( ≤ )</option>
                </select>
              </RuleFormField>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <RuleFormField label="Grade" required error={errors.minCredits} hint="e.g. 100">
                <input {...numProps('minCredits')} min={1} max={500} placeholder="100" aria-label="Grade" />
              </RuleFormField>
              <RuleFormField label="Min GPA (optional)" error={errors.minGpaOpt} hint="Leave empty for none.">
                <input {...numProps('minGpa')} min={0} max={10} step="0.1" placeholder="5.0" aria-label="Milestone min GPA" />
              </RuleFormField>
              <RuleFormField label="Course code (optional)" hint="e.g. OJT401">
                <input value={cond.courseCode} disabled={readOnly} onChange={(e) => set('courseCode', e.target.value.toUpperCase())} placeholder="OJT401" aria-label="Milestone course code" className={cn(RULE_FIELD_CLASS, 'font-mono font-bold uppercase')} />
              </RuleFormField>
            </div>
          )}
        </div>
      );
  }
}
