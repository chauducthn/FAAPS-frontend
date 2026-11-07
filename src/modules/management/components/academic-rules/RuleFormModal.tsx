// Create / edit / view form for Academic Rules.
// Operate-mode, synced with CourseFormModal: gradient header, sectioned layout.
// No raw JSON anywhere: the condition is built from a visual sentence-builder
// per policy type, the restriction from toggle chips. ACTIVE rules stay read-only.
import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Braces, Loader2, Lock, Minus, Plus, ShieldCheck, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import {
  POLICY_TYPES,
  createAcademicRuleSchema,
  type CreateAcademicRuleFormValues,
} from '../../../academic/validations/academic-rule.schema';
import type { AcademicRule, AcademicRuleType } from '../../../academic/types/academic-rule';
import { RuleStatusBadge } from './RuleTable';

interface Props {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  initial?: AcademicRule | null;
  curriculums: { id: string; name: string }[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAcademicRuleFormValues) => void;
}

const field =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:opacity-60';
const labelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';
const selectClass = cn(field, 'appearance-none pr-9');
const numClass = cn(field, 'font-mono font-bold tabular-nums');

/* ------------------------------------------------------------------ */
/* Visual condition draft (never raw JSON)                             */
/* ------------------------------------------------------------------ */

type Num = number | '';

interface CondDraft {
  scope: string;
  operator: string;
  minGpa: Num;
  maxCredits: Num;
  minCredits: Num;
  minAttendance: Num;
  consecutiveSemesters: Num;
  maxAttempts: Num;
  maxScoreForRetake: Num;
  maxRepeats: Num;
  minCreditsEarned: Num;
  courseCode: string;
  fullTimeOnly: boolean;
  otherKind: 'attendance' | 'milestone';
}

const BLANK_COND: CondDraft = {
  scope: 'semester_gpa',
  operator: '<',
  minGpa: '',
  maxCredits: '',
  minCredits: '',
  minAttendance: '',
  consecutiveSemesters: '',
  maxAttempts: '',
  maxScoreForRetake: '',
  maxRepeats: '',
  minCreditsEarned: '',
  courseCode: '',
  fullTimeOnly: false,
  otherKind: 'attendance',
};

function templateFor(policy: string): CondDraft {
  switch (policy) {
    case 'GPA_WARNING':
      return { ...BLANK_COND, scope: 'semester_gpa', operator: '<', minGpa: 5.0 };
    case 'ACADEMIC_PROBATION':
      return { ...BLANK_COND, operator: '<', minGpa: 4.5, consecutiveSemesters: 2 };
    case 'MAX_CREDITS_PER_SEMESTER':
      return { ...BLANK_COND, scope: 'semester_registration', maxCredits: 24 };
    case 'MIN_CREDITS_PER_SEMESTER':
      return { ...BLANK_COND, scope: 'semester_registration', minCredits: 12, fullTimeOnly: true };
    case 'COURSE_REPEAT_LIMIT':
      return { ...BLANK_COND, scope: 'single_course', maxRepeats: 2 };
    case 'RETAKE':
      return { ...BLANK_COND, operator: '<=', maxScoreForRetake: 5.0, maxAttempts: 3 };
    case 'ADVANCED_STUDY':
      return { ...BLANK_COND, scope: 'fast_track', minGpa: 8.0, minCreditsEarned: 60 };
    default:
      return { ...BLANK_COND, scope: 'course_attendance', operator: '<', minAttendance: 80, otherKind: 'attendance' };
  }
}

function num(value: unknown): Num {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return '';
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function draftFromCondition(policy: string, cond: Record<string, unknown>): CondDraft {
  const base = templateFor(policy);
  const d: CondDraft = {
    ...base,
    scope: str(cond.scope) || base.scope,
    operator: str(cond.operator) || base.operator,
    minGpa: cond.min_gpa !== undefined ? num(cond.min_gpa) : base.minGpa,
    maxCredits: cond.max_credits !== undefined ? num(cond.max_credits) : base.maxCredits,
    minCredits: cond.min_credits !== undefined ? num(cond.min_credits) : base.minCredits,
    minAttendance: cond.min_attendance_percent !== undefined ? num(cond.min_attendance_percent) : base.minAttendance,
    consecutiveSemesters:
      cond.consecutive_semesters !== undefined ? num(cond.consecutive_semesters) : base.consecutiveSemesters,
    maxAttempts: cond.max_attempts !== undefined ? num(cond.max_attempts) : base.maxAttempts,
    maxScoreForRetake:
      cond.max_score_for_retake !== undefined ? num(cond.max_score_for_retake) : base.maxScoreForRetake,
    maxRepeats: cond.max_repeats !== undefined ? num(cond.max_repeats) : base.maxRepeats,
    minCreditsEarned:
      cond.min_credits_earned !== undefined ? num(cond.min_credits_earned) : base.minCreditsEarned,
    courseCode: str(cond.course_code) || base.courseCode,
    fullTimeOnly: cond.full_time_only === true,
    otherKind: cond.min_attendance_percent !== undefined ? 'attendance' : 'milestone',
  };
  return d;
}

function buildCondition(policy: string, d: CondDraft): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const set = (key: string, v: Num | string) => {
    if (v !== '' && v !== undefined) out[key] = v;
  };
  switch (policy) {
    case 'GPA_WARNING':
      set('min_gpa', d.minGpa);
      out.operator = d.operator;
      out.scope = d.scope;
      break;
    case 'ACADEMIC_PROBATION':
      set('min_gpa', d.minGpa);
      set('consecutive_semesters', d.consecutiveSemesters);
      out.operator = d.operator;
      break;
    case 'MAX_CREDITS_PER_SEMESTER':
      set('max_credits', d.maxCredits);
      out.scope = 'semester_registration';
      break;
    case 'MIN_CREDITS_PER_SEMESTER':
      set('min_credits', d.minCredits);
      out.scope = 'semester_registration';
      if (d.fullTimeOnly) out.full_time_only = true;
      break;
    case 'COURSE_REPEAT_LIMIT':
      set('max_repeats', d.maxRepeats);
      out.scope = 'single_course';
      break;
    case 'RETAKE':
      set('max_score_for_retake', d.maxScoreForRetake);
      set('max_attempts', d.maxAttempts);
      out.operator = d.operator;
      break;
    case 'ADVANCED_STUDY':
      set('min_gpa', d.minGpa);
      set('min_credits_earned', d.minCreditsEarned);
      out.scope = 'fast_track';
      break;
    default:
      if (d.otherKind === 'attendance') {
        set('min_attendance_percent', d.minAttendance);
        out.operator = d.operator;
        out.scope = 'course_attendance';
      } else {
        set('min_credits', d.minCredits);
        if (d.minGpa !== '') out.min_gpa = d.minGpa;
        if (d.courseCode.trim() !== '') out.course_code = d.courseCode.trim().toUpperCase();
        out.scope = 'milestone';
      }
      break;
  }
  return out;
}

/** Human sentence shown in the preview box — no code knowledge needed. */
function describeCondition(policy: string, d: CondDraft): string {
  const gpa = (v: Num) => (v === '' ? '…' : String(v));
  switch (policy) {
    case 'GPA_WARNING':
      return `Warn when ${d.scope === 'cumulative_gpa' ? 'cumulative GPA' : 'semester GPA'} is ${d.operator === '<=' ? 'at or below' : 'below'} ${gpa(d.minGpa)}`;
    case 'ACADEMIC_PROBATION':
      return `Probation when GPA is below ${gpa(d.minGpa)} for ${d.consecutiveSemesters === '' ? '…' : d.consecutiveSemesters} consecutive semester(s)`;
    case 'MAX_CREDITS_PER_SEMESTER':
      return `Students may register up to ${d.maxCredits === '' ? '…' : d.maxCredits} credits per semester`;
    case 'MIN_CREDITS_PER_SEMESTER':
      return `Warn when registering below ${d.minCredits === '' ? '…' : d.minCredits} credits${d.fullTimeOnly ? ' (full-time students)' : ''}`;
    case 'COURSE_REPEAT_LIMIT':
      return `Each course may be repeated at most ${d.maxRepeats === '' ? '…' : d.maxRepeats} time(s)`;
    case 'RETAKE':
      return `Allow retake up to ${d.maxAttempts === '' ? '…' : d.maxAttempts} time(s) when the score is ${d.operator === '<=' ? 'at or below' : 'below'} ${gpa(d.maxScoreForRetake)}`;
    case 'ADVANCED_STUDY':
      return `Fast-track when GPA ≥ ${gpa(d.minGpa)} with ${d.minCreditsEarned === '' ? '…' : d.minCreditsEarned} credits earned`;
    default:
      if (d.otherKind === 'attendance') {
        return `Block when attendance is below ${d.minAttendance === '' ? '…' : `${d.minAttendance}%`} of sessions`;
      }
      return `Require ${d.minCredits === '' ? '…' : d.minCredits} credits${d.minGpa !== '' ? ` and GPA ≥ ${d.minGpa}` : ''}${d.courseCode.trim() !== '' ? ` before ${d.courseCode.trim().toUpperCase()}` : ''}`;
  }
}

/* ------------------------------------------------------------------ */
/* Visual restriction draft                                            */
/* ------------------------------------------------------------------ */

interface RestrDraft {
  blockRegistration: boolean;
  blockFinalExam: boolean;
  notifyAdvisor: boolean;
  requireMeeting: boolean;
  requireDeanApproval: boolean;
  keepHighestScore: boolean;
  allowExtraCredits: boolean;
  warnOnly: boolean;
  maxCreditsNextSemester: Num;
  maxExtraCredits: Num;
}

const BLANK_RESTR: RestrDraft = {
  blockRegistration: false,
  blockFinalExam: false,
  notifyAdvisor: false,
  requireMeeting: false,
  requireDeanApproval: false,
  keepHighestScore: false,
  allowExtraCredits: false,
  warnOnly: false,
  maxCreditsNextSemester: '',
  maxExtraCredits: '',
};

function restrFromObject(r: Record<string, unknown>): RestrDraft {
  return {
    blockRegistration: r.block_registration === true,
    blockFinalExam: r.block_final_exam === true,
    notifyAdvisor: r.notify_advisor === true,
    requireMeeting: r.require_meeting === true,
    requireDeanApproval: r.require_dean_approval === true,
    keepHighestScore: r.keep_highest_score === true,
    allowExtraCredits: r.allow_extra_credits === true,
    warnOnly: r.warn_only === true,
    maxCreditsNextSemester: r.max_credits_next_semester !== undefined ? num(r.max_credits_next_semester) : '',
    maxExtraCredits: r.max_extra_credits !== undefined ? num(r.max_extra_credits) : '',
  };
}

function buildRestriction(d: RestrDraft): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (d.blockRegistration) out.block_registration = true;
  if (d.blockFinalExam) out.block_final_exam = true;
  if (d.notifyAdvisor) out.notify_advisor = true;
  if (d.requireMeeting) out.require_meeting = true;
  if (d.requireDeanApproval) out.require_dean_approval = true;
  if (d.keepHighestScore) out.keep_highest_score = true;
  if (d.allowExtraCredits) out.allow_extra_credits = true;
  if (d.warnOnly) out.warn_only = true;
  if (d.maxCreditsNextSemester !== '') out.max_credits_next_semester = d.maxCreditsNextSemester;
  if (d.maxExtraCredits !== '') out.max_extra_credits = d.maxExtraCredits;
  return out;
}

/* ------------------------------------------------------------------ */
/* Validation helpers                                                  */
/* ------------------------------------------------------------------ */

function rangeError(v: Num, min: number, max: number, label: string, required = true): string | null {
  if (v === '') return required ? `${label} is required` : null;
  if (!Number.isFinite(v)) return `${label} must be a number`;
  if (v < min || v > max) return `${label} must be between ${min} and ${max}`;
  return null;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function RuleFormModal({ open, mode, initial, curriculums, isLoading, onClose, onSubmit }: Props) {
  const isCreate = mode === 'create';
  const isView = mode === 'view';
  const activeReadOnly = initial?.status === 'ACTIVE';
  const readOnly = isView || activeReadOnly;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAcademicRuleFormValues>({
    resolver: zodResolver(createAcademicRuleSchema),
    defaultValues: { policyType: 'GPA_WARNING', priority: 0, isActive: true },
    mode: 'onChange',
  });

  const policyType = watch('policyType');
  const approvalRequired = watch('approvalRequired');
  const priority = watch('priority');

  const [cond, setCond] = useState<CondDraft>(() => templateFor('GPA_WARNING'));
  const [restr, setRestr] = useState<RestrDraft>(BLANK_RESTR);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        curriculumVersionId: initial.curriculumVersionId,
        policyType: initial.policyType,
        condition: initial.condition,
        restriction: initial.restriction,
        approvalRequired: initial.approvalRequired,
        priority: initial.priority,
        description: initial.description ?? '',
        displayMessage: initial.displayMessage ?? '',
        status: initial.status,
        isActive: initial.isActive,
      });
      setCond(draftFromCondition(initial.policyType, initial.condition));
      setRestr(restrFromObject(initial.restriction));
    } else {
      reset({
        curriculumVersionId: '',
        policyType: 'GPA_WARNING',
        condition: {},
        restriction: {},
        approvalRequired: false,
        priority: 0,
        description: '',
        displayMessage: '',
        status: 'DRAFT',
        isActive: false,
      });
      setCond(templateFor('GPA_WARNING'));
      setRestr(BLANK_RESTR);
    }
  }, [open, initial, reset]);

  // Switching policy type loads its sentence template (create, or edit after divergence).
  useEffect(() => {
    if (!open) return;
    if (!initial || policyType !== initial.policyType) {
      setCond(templateFor(policyType));
    }
  }, [open, policyType, initial]);

  const builtCondition = useMemo(() => buildCondition(policyType, cond), [policyType, cond]);
  const builtRestriction = useMemo(() => buildRestriction(restr), [restr]);

  // Keep RHF in sync so the zod schema (condition non-empty) stays satisfied.
  useEffect(() => {
    setValue('condition', builtCondition, { shouldValidate: true });
  }, [builtCondition, setValue]);
  useEffect(() => {
    setValue('restriction', builtRestriction);
  }, [builtRestriction, setValue]);

  /** Per-field inline errors for the visual builder. */
  const condErrors = useMemo(() => {
    const e: Partial<Record<string, string>> = {};
    const put = (k: string, err: string | null) => {
      if (err) e[k] = err;
    };
    switch (policyType) {
      case 'GPA_WARNING':
        put('minGpa', rangeError(cond.minGpa, 0, 10, 'GPA threshold'));
        break;
      case 'ACADEMIC_PROBATION':
        put('minGpa', rangeError(cond.minGpa, 0, 10, 'GPA threshold'));
        put('consecutiveSemesters', rangeError(cond.consecutiveSemesters, 1, 10, 'Consecutive semesters'));
        break;
      case 'MAX_CREDITS_PER_SEMESTER':
        put('maxCredits', rangeError(cond.maxCredits, 1, 60, 'Max credits'));
        break;
      case 'MIN_CREDITS_PER_SEMESTER':
        put('minCredits', rangeError(cond.minCredits, 1, 60, 'Min credits'));
        break;
      case 'COURSE_REPEAT_LIMIT':
        put('maxRepeats', rangeError(cond.maxRepeats, 1, 10, 'Max repeats'));
        break;
      case 'RETAKE':
        put('maxScoreForRetake', rangeError(cond.maxScoreForRetake, 0, 10, 'Score limit'));
        put('maxAttempts', rangeError(cond.maxAttempts, 1, 10, 'Max attempts'));
        break;
      case 'ADVANCED_STUDY':
        put('minGpa', rangeError(cond.minGpa, 0, 10, 'GPA threshold'));
        put('minCreditsEarned', rangeError(cond.minCreditsEarned, 1, 500, 'Credits earned'));
        break;
      default:
        if (cond.otherKind === 'attendance') {
          put('minAttendance', rangeError(cond.minAttendance, 1, 100, 'Attendance %'));
        } else {
          put('minCredits', rangeError(cond.minCredits, 1, 500, 'Required credits'));
          put('minGpaOpt', rangeError(cond.minGpa, 0, 10, 'GPA threshold', false));
        }
        break;
    }
    if (restr.maxCreditsNextSemester !== '') {
      const err = rangeError(restr.maxCreditsNextSemester, 1, 60, 'Credits next semester', false);
      if (err) e.maxCreditsNextSemester = err;
    }
    if (restr.maxExtraCredits !== '') {
      const err = rangeError(restr.maxExtraCredits, 1, 30, 'Extra credits', false);
      if (err) e.maxExtraCredits = err;
    }
    return e;
  }, [policyType, cond, restr]);

  const hasCondError = Object.keys(condErrors).length > 0;
  const canSubmit = !isLoading && !readOnly && !hasCondError && Object.keys(builtCondition).length > 0;
  const summary = describeCondition(policyType, cond);

  const submit = (values: CreateAcademicRuleFormValues) => {
    if (hasCondError) return;
    onSubmit({
      ...values,
      condition: builtCondition,
      restriction: builtRestriction,
      status: isCreate ? 'DRAFT' : values.status,
    });
  };

  const set = <K extends keyof CondDraft>(key: K, value: CondDraft[K]) =>
    setCond((c) => ({ ...c, [key]: value }));
  const setR = <K extends keyof RestrDraft>(key: K, value: RestrDraft[K]) =>
    setRestr((r) => ({ ...r, [key]: value }));

  const title = isCreate ? 'Create rule' : isView ? `Rule ${initial?.policyType ?? ''}` : `Edit ${initial?.policyType ?? 'rule'}`;

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-2xl">
      <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] to-white px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
              <Braces className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-gray-900">{title}</h2>
                {initial && <RuleStatusBadge status={initial.status} />}
                {isCreate && <RuleStatusBadge status="DRAFT" />}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                {isCreate
                  ? 'New rules start as DRAFT — publish them to enforce for students.'
                  : readOnly
                    ? 'ACTIVE rules are read-only. Archive the rule before editing.'
                    : 'Update the DRAFT rule — answer the questions below, no code needed.'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-6 text-[13px]">
          {activeReadOnly && !isView && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs leading-relaxed text-emerald-800">
              <Lock className="mt-0.5 size-4 shrink-0" />
              <p>
                <span className="font-bold">This rule is ACTIVE and read-only.</span> Archive it
                (ACTIVE → INACTIVE) before editing, or view the detail below.
              </p>
            </div>
          )}

          <Section title="Identity" hint="Which curriculum this policy belongs to and what kind of check it is.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Curriculum" required error={errors.curriculumVersionId?.message}>
                <select {...register('curriculumVersionId')} disabled={readOnly || isLoading} aria-label="Curriculum" className={selectClass}>
                  <option value="">Select a curriculum…</option>
                  {curriculums.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Policy type" required error={errors.policyType?.message}>
                <select {...register('policyType')} disabled={readOnly || isLoading} aria-label="Policy type" className={selectClass}>
                  {POLICY_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Condition" hint="Answer the questions — the rule builds itself. No code needed.">
            <ConditionFields
              policyType={policyType as AcademicRuleType}
              cond={cond}
              set={set}
              errors={condErrors}
              readOnly={readOnly || !!isLoading}
            />
            <div className="flex items-start gap-2.5 rounded-xl bg-orange-50/70 px-4 py-3 ring-1 ring-orange-100">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#9a3412]" aria-hidden />
              <p className="text-xs leading-relaxed text-[#7c2d12]">
                <span className="font-bold">In plain words: </span>
                {summary}
              </p>
            </div>
          </Section>

          <Section title="When triggered" hint="What the system does when a student hits this rule.">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <ToggleChip
                checked={restr.blockRegistration}
                onChange={(v) => setR('blockRegistration', v)}
                disabled={readOnly || !!isLoading}
                label="Block registration"
                hint="Stop the action"
              />
              <ToggleChip
                checked={restr.blockFinalExam}
                onChange={(v) => setR('blockFinalExam', v)}
                disabled={readOnly || !!isLoading}
                label="Block final exam"
                hint="Attendance gate"
              />
              <ToggleChip
                checked={restr.notifyAdvisor}
                onChange={(v) => setR('notifyAdvisor', v)}
                disabled={readOnly || !!isLoading}
                label="Notify advisor"
                hint="Email the advisor"
              />
              <ToggleChip
                checked={restr.requireMeeting}
                onChange={(v) => setR('requireMeeting', v)}
                disabled={readOnly || !!isLoading}
                label="Require meeting"
                hint="Student meets advisor"
              />
              <ToggleChip
                checked={restr.requireDeanApproval}
                onChange={(v) => setR('requireDeanApproval', v)}
                disabled={readOnly || !!isLoading}
                label="Require dean approval"
                hint="Manual sign-off"
              />
              <ToggleChip
                checked={restr.keepHighestScore}
                onChange={(v) => setR('keepHighestScore', v)}
                disabled={readOnly || !!isLoading}
                label="Keep highest score"
                hint="For retakes"
              />
              <ToggleChip
                checked={restr.allowExtraCredits}
                onChange={(v) => setR('allowExtraCredits', v)}
                disabled={readOnly || !!isLoading}
                label="Allow extra credits"
                hint="Fast-track perk"
              />
              <ToggleChip
                checked={restr.warnOnly}
                onChange={(v) => setR('warnOnly', v)}
                disabled={readOnly || !!isLoading}
                label="Warn only"
                hint="No hard block"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cap credits next semester" error={condErrors.maxCreditsNextSemester} hint="Leave empty for no cap.">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={restr.maxCreditsNextSemester}
                  disabled={readOnly || !!isLoading}
                  onChange={(e) => setR('maxCreditsNextSemester', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 12"
                  aria-label="Cap credits next semester"
                  className={numClass}
                />
              </Field>
              <Field label="Extra credits granted" error={condErrors.maxExtraCredits} hint="Leave empty for none.">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={restr.maxExtraCredits}
                  disabled={readOnly || !!isLoading}
                  onChange={(e) => setR('maxExtraCredits', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 6"
                  aria-label="Extra credits granted"
                  className={numClass}
                />
              </Field>
            </div>
          </Section>

          <Section title="Enforcement" hint="How this rule competes and who must sign off.">
            <div className="grid items-start gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
              <Field
                label="Priority"
                error={errors.priority?.message}
                hint={errors.priority?.message ? undefined : 'Higher wins when rules overlap.'}
              >
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Decrease priority"
                    disabled={readOnly || !!isLoading}
                    onClick={() => setValue('priority', Math.max(0, Number(priority ?? 0) - 1))}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    {...register('priority', { valueAsNumber: true })}
                    disabled={readOnly || !!isLoading}
                    aria-label="Priority"
                    className={cn(
                      numClass,
                      'bg-white text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
                    )}
                  />
                  <button
                    type="button"
                    aria-label="Increase priority"
                    disabled={readOnly || !!isLoading}
                    onClick={() => setValue('priority', Math.min(1000, Number(priority ?? 0) + 1))}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </Field>

              <div>
                <p className={labelClass}>Approval</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!approvalRequired}
                  aria-label="Approval required"
                  disabled={readOnly || !!isLoading}
                  onClick={() => setValue('approvalRequired', !approvalRequired)}
                  className="flex items-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                      approvalRequired ? 'bg-[#F26F21]' : 'bg-gray-300',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all',
                        approvalRequired ? 'left-[22px]' : 'left-0.5',
                      )}
                    />
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {approvalRequired ? 'Required' : 'Automatic'}
                  </span>
                </button>
                <p className="mt-1 text-[11px] text-gray-400">
                  {approvalRequired ? 'A person must sign off first.' : 'Applies on its own.'}
                </p>
              </div>

              <div>
                <p className={labelClass}>Status</p>
                <div className="flex h-8 items-center">
                  {initial ? <RuleStatusBadge status={initial.status} /> : <RuleStatusBadge status="DRAFT" />}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                  {isCreate
                    ? 'Starts as DRAFT. Publish from the list.'
                    : initial?.status === 'DRAFT'
                      ? 'DRAFT → Publish when ready.'
                      : initial?.status === 'ACTIVE'
                        ? 'ACTIVE is live & locked.'
                        : 'INACTIVE. Reopen or delete.'}
                </p>
              </div>
            </div>
            <Field label="Description" error={errors.description?.message} hint="Internal note for admins and advisors.">
              <textarea rows={2} {...register('description')} disabled={readOnly || isLoading} placeholder="When does this rule trigger…" aria-label="Description" className={cn(field, 'resize-none leading-relaxed')} />
            </Field>
            <Field label="Display message" error={errors.displayMessage?.message} hint="Shown to the student when the rule blocks them.">
              <input {...register('displayMessage')} disabled={readOnly || isLoading} placeholder="You cannot register for more than 24 credits." aria-label="Display message" className={field} />
            </Field>
          </Section>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={!canSubmit}
              title={hasCondError ? 'Answer every required question above to continue' : undefined}
              className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#F26F21] px-5 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              {isLoading ? 'Saving…' : isCreate ? 'Create rule' : 'Save changes'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Condition question-sets per policy type                             */
/* ------------------------------------------------------------------ */

function ConditionFields({
  policyType,
  cond,
  set,
  errors,
  readOnly,
}: {
  policyType: AcademicRuleType;
  cond: CondDraft;
  set: <K extends keyof CondDraft>(key: K, value: CondDraft[K]) => void;
  errors: Partial<Record<string, string>>;
  readOnly: boolean;
}) {
  const numProps = (key: 'minGpa' | 'maxCredits' | 'minCredits' | 'minAttendance' | 'consecutiveSemesters' | 'maxAttempts' | 'maxScoreForRetake' | 'maxRepeats' | 'minCreditsEarned') => ({
    type: 'number' as const,
    value: cond[key],
    disabled: readOnly,
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      set(key, e.target.value === '' ? '' : Number(e.target.value)),
    className: numClass,
  });

  switch (policyType) {
    case 'GPA_WARNING':
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Applies to" required>
            <select value={cond.scope} disabled={readOnly} onChange={(e) => set('scope', e.target.value)} aria-label="GPA scope" className={selectClass}>
              <option value="semester_gpa">Semester GPA</option>
              <option value="cumulative_gpa">Cumulative GPA</option>
            </select>
          </Field>
          <Field label="Warn when GPA is" required>
            <select value={cond.operator} disabled={readOnly} onChange={(e) => set('operator', e.target.value)} aria-label="GPA comparison" className={selectClass}>
              <option value="<">Below ( &lt; )</option>
              <option value="<=">At or below ( ≤ )</option>
            </select>
          </Field>
          <Field label="Threshold" required error={errors.minGpa} hint="e.g. 5.0">
            <input {...numProps('minGpa')} min={0} max={10} step="0.1" placeholder="5.0" aria-label="GPA threshold" />
          </Field>
        </div>
      );
    case 'ACADEMIC_PROBATION':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="GPA below" required error={errors.minGpa} hint="e.g. 4.5">
            <input {...numProps('minGpa')} min={0} max={10} step="0.1" placeholder="4.5" aria-label="Probation GPA threshold" />
          </Field>
          <Field label="Consecutive semesters" required error={errors.consecutiveSemesters} hint="How many terms in a row.">
            <input {...numProps('consecutiveSemesters')} min={1} max={10} placeholder="2" aria-label="Consecutive semesters" />
          </Field>
        </div>
      );
    case 'MAX_CREDITS_PER_SEMESTER':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Max credits per semester" required error={errors.maxCredits} hint="e.g. 24">
            <input {...numProps('maxCredits')} min={1} max={60} placeholder="24" aria-label="Max credits per semester" />
          </Field>
          <div className="rounded-xl bg-orange-50/70 px-4 py-3 text-[11px] leading-relaxed text-[#7c2d12] ring-1 ring-orange-100 sm:mt-[26px] sm:self-start">
            Registrations above this number are blocked automatically.
          </div>
        </div>
      );
    case 'MIN_CREDITS_PER_SEMESTER':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Min credits per semester" required error={errors.minCredits} hint="e.g. 12">
              <input {...numProps('minCredits')} min={1} max={60} placeholder="12" aria-label="Min credits per semester" />
            </Field>
            <ToggleChip
              checked={cond.fullTimeOnly}
              onChange={(v) => set('fullTimeOnly', v)}
              disabled={readOnly}
              label="Full-time students only"
              hint="Skip part-time / exchange"
            />
          </div>
        </div>
      );
    case 'COURSE_REPEAT_LIMIT':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Max repeats per course" required error={errors.maxRepeats} hint="e.g. 2">
            <input {...numProps('maxRepeats')} min={1} max={10} placeholder="2" aria-label="Max repeats per course" />
          </Field>
          <div className="rounded-xl bg-orange-50/70 px-4 py-3 text-[11px] leading-relaxed text-[#7c2d12] ring-1 ring-orange-100 sm:mt-[26px] sm:self-start">
            Further attempts need dean approval (toggle below).
          </div>
        </div>
      );
    case 'RETAKE':
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Score at or below" required error={errors.maxScoreForRetake} hint="e.g. 5.0">
            <input {...numProps('maxScoreForRetake')} min={0} max={10} step="0.1" placeholder="5.0" aria-label="Retake score limit" />
          </Field>
          <Field label="Comparison" required>
            <select value={cond.operator} disabled={readOnly} onChange={(e) => set('operator', e.target.value)} aria-label="Retake comparison" className={selectClass}>
              <option value="<=">At or below ( ≤ )</option>
              <option value="<">Below ( &lt; )</option>
            </select>
          </Field>
          <Field label="Max attempts" required error={errors.maxAttempts} hint="e.g. 3">
            <input {...numProps('maxAttempts')} min={1} max={10} placeholder="3" aria-label="Max retake attempts" />
          </Field>
        </div>
      );
    case 'ADVANCED_STUDY':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="GPA at least" required error={errors.minGpa} hint="e.g. 8.0">
            <input {...numProps('minGpa')} min={0} max={10} step="0.1" placeholder="8.0" aria-label="Fast-track GPA" />
          </Field>
          <Field label="Credits earned" required error={errors.minCreditsEarned} hint="e.g. 60">
            <input {...numProps('minCreditsEarned')} min={1} max={500} placeholder="60" aria-label="Credits earned" />
          </Field>
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1" role="radiogroup" aria-label="Rule kind">
            {(
              [
                { v: 'attendance', label: 'Attendance gate' },
                { v: 'milestone', label: 'Credit milestone' },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                role="radio"
                aria-checked={cond.otherKind === o.v}
                disabled={readOnly}
                onClick={() => set('otherKind', o.v)}
                className={cn(
                  'rounded-lg px-3 py-2 text-center text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60',
                  cond.otherKind === o.v
                    ? 'bg-white text-[#9a3412] shadow-xs ring-1 ring-orange-200'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          {cond.otherKind === 'attendance' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Warn when attendance below" required error={errors.minAttendance} hint="% of sessions, e.g. 80">
                <input {...numProps('minAttendance')} min={1} max={100} placeholder="80" aria-label="Attendance percent" />
              </Field>
              <Field label="Comparison" required>
                <select value={cond.operator} disabled={readOnly} onChange={(e) => set('operator', e.target.value)} aria-label="Attendance comparison" className={selectClass}>
                  <option value="<">Below ( &lt; )</option>
                  <option value="<=">At or below ( ≤ )</option>
                </select>
              </Field>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Required credits" required error={errors.minCredits} hint="e.g. 100">
                <input {...numProps('minCredits')} min={1} max={500} placeholder="100" aria-label="Required credits" />
              </Field>
              <Field label="Min GPA (optional)" error={errors.minGpaOpt} hint="Leave empty for none.">
                <input {...numProps('minGpa')} min={0} max={10} step="0.1" placeholder="5.0" aria-label="Milestone min GPA" />
              </Field>
              <Field label="Course code (optional)" hint="e.g. OJT401">
                <input
                  value={cond.courseCode}
                  disabled={readOnly}
                  onChange={(e) => set('courseCode', e.target.value.toUpperCase())}
                  placeholder="OJT401"
                  aria-label="Milestone course code"
                  className={cn(field, 'font-mono font-bold uppercase')}
                />
              </Field>
            </div>
          )}
        </div>
      );
  }
}

function ToggleChip({
  checked,
  onChange,
  disabled,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
  hint: string;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/50 p-3 transition-all has-checked:border-orange-300 has-checked:bg-orange-50/50',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 accent-[#F26F21]"
      />
      <span>
        <span className="block text-xs font-bold text-gray-700">{label}</span>
        <span className="block text-[11px] font-medium text-gray-400">{hint}</span>
      </span>
    </label>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">{title}</h3>
      <p className="mb-3.5 mt-0.5 text-[11px] text-gray-400">{hint}</p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-[#F26F21]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
