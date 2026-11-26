import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ChevronDown, Lock, ShieldCheck, X } from 'lucide-react';
import {
  POLICY_TYPES,
  type CreateAcademicRuleFormValues,
} from '../../../academic/validations/academic-rule.schema';
import type { AcademicRule } from '../../../academic/types/academic-rule';
import { RuleStatusBadge } from './RuleTable';
import {
  RULE_FIELD_CLASS,
  RULE_SELECT_CLASS,
  RuleFormField,
  RuleFormSection,
} from './RuleFormPrimitives';

const POLICY_LABELS: Record<string, string> = {
  GPA_WARNING: 'GPA Warning',
  ACADEMIC_PROBATION: 'Academic Probation',
  MAX_CREDITS_PER_SEMESTER: 'Max Credits / Semester',
  MIN_CREDITS_PER_SEMESTER: 'Min Credits / Semester',
  COURSE_REPEAT_LIMIT: 'Course Repeat Limit',
  RETAKE: 'Course Retake',
  ADVANCED_STUDY: 'Advanced Study / Fast-Track',
  OTHER: 'Attendance / Milestone (Other)',
};

export function RuleFormHeader({
  title,
  isCreate,
  readOnly,
  initial,
  onClose,
}: {
  title: string;
  isCreate: boolean;
  readOnly: boolean;
  initial?: AcademicRule | null;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70">
          <ShieldCheck className="size-4.5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
            {initial ? <RuleStatusBadge status={initial.status} /> : isCreate ? <RuleStatusBadge status="DRAFT" /> : null}
          </div>
          <p className="text-xs text-gray-500">
            {isCreate
              ? 'New rules start as DRAFT — publish from the rules table to enforce.'
              : readOnly
                ? 'ACTIVE rules are read-only. Archive the rule before editing.'
                : 'Update rule settings and thresholds.'}
          </p>
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
        <X className="size-4" />
      </button>
    </div>
  );
}

export function RuleIdentitySection({
  activeReadOnly,
  isView,
  disabled,
  register,
  errors,
}: {
  activeReadOnly: boolean;
  isView: boolean;
  disabled: boolean;
  register: UseFormRegister<CreateAcademicRuleFormValues>;
  errors: FieldErrors<CreateAcademicRuleFormValues>;
}) {
  return (
    <>
      {activeReadOnly && !isView && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-800">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-semibold">This rule is ACTIVE and read-only.</span> Archive it before editing, or inspect its configuration below.
          </p>
        </div>
      )}
      <RuleFormSection step={1} title="Rule identity" hint="Name and category of the academic policy (applies system-wide).">
        <div className="grid gap-4 sm:grid-cols-2">
          <RuleFormField label="Rule name" required error={errors.ruleName?.message}>
            <input
              {...register('ruleName')}
              disabled={disabled}
              placeholder="e.g. FPTU Semester GPA Warning"
              aria-label="Rule name"
              className={RULE_FIELD_CLASS}
            />
          </RuleFormField>
          <RuleFormField label="Policy type" required error={errors.policyType?.message}>
            <div className="relative">
              <select {...register('policyType')} disabled={disabled} aria-label="Policy type" className={RULE_SELECT_CLASS}>
                {POLICY_TYPES.map((p) => (
                  <option key={p} value={p}>{POLICY_LABELS[p] ?? p}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
          </RuleFormField>
        </div>
      </RuleFormSection>
    </>
  );
}
