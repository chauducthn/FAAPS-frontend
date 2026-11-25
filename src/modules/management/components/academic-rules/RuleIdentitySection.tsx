import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Braces, Lock, X } from 'lucide-react';
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
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-[#FFF7ED] px-6 py-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F37021] text-white">
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
            <span className="font-bold">This rule is ACTIVE and read-only.</span> Archive it (ACTIVE → INACTIVE) before editing, or view the detail below.
          </p>
        </div>
      )}
      <RuleFormSection title="Identity" hint="What the rule is called and what kind of check it is. Rules apply system-wide.">
        <div className="grid gap-4 sm:grid-cols-2">
          <RuleFormField label="Rule name" required error={errors.ruleName?.message}>
            <input {...register('ruleName')} disabled={disabled} placeholder="e.g. Semester GPA warning" aria-label="Rule name" className={RULE_FIELD_CLASS} />
          </RuleFormField>
          <RuleFormField label="Policy type" required error={errors.policyType?.message}>
            <select {...register('policyType')} disabled={disabled} aria-label="Policy type" className={RULE_SELECT_CLASS}>
              {POLICY_TYPES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </RuleFormField>
        </div>
      </RuleFormSection>
    </>
  );
}
