import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { CreateAcademicRuleFormValues } from '../../../academic/validations/academic-rule.schema';
import type { AcademicRule } from '../../../academic/types/academic-rule';
import { RuleStatusBadge } from './RuleTable';
import {
  RULE_FIELD_CLASS,
  RULE_LABEL_CLASS,
  RULE_NUM_CLASS,
  RuleFormField,
  RuleFormSection,
} from './RuleFormPrimitives';

interface Props {
  isCreate: boolean;
  initial?: AcademicRule | null;
  priority: number | undefined;
  approvalRequired: boolean | undefined;
  disabled: boolean;
  register: UseFormRegister<CreateAcademicRuleFormValues>;
  setValue: UseFormSetValue<CreateAcademicRuleFormValues>;
  errors: FieldErrors<CreateAcademicRuleFormValues>;
}

export function RuleEnforcementSection({
  isCreate,
  initial,
  priority,
  approvalRequired,
  disabled,
  register,
  setValue,
  errors,
}: Props) {
  return (
    <RuleFormSection title="Enforcement" hint="How this rule competes and who must sign off.">
      <div className="grid items-start gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
        <RuleFormField
          label="Priority"
          error={errors.priority?.message}
          hint={errors.priority?.message ? undefined : 'Higher wins when rules overlap.'}
        >
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Decrease priority"
              disabled={disabled}
              onClick={() => setValue('priority', Math.max(0, Number(priority ?? 0) - 1))}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#F37021] hover:text-[#F37021] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Minus className="size-3.5" />
            </button>
            <input
              type="number"
              min={0}
              max={1000}
              {...register('priority', { valueAsNumber: true })}
              disabled={disabled}
              aria-label="Priority"
              className={cn(
                RULE_NUM_CLASS,
                'bg-white text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
              )}
            />
            <button
              type="button"
              aria-label="Increase priority"
              disabled={disabled}
              onClick={() => setValue('priority', Math.min(1000, Number(priority ?? 0) + 1))}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#F37021] hover:text-[#F37021] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </RuleFormField>

        <div>
          <p className={RULE_LABEL_CLASS}>Approval</p>
          <button
            type="button"
            role="switch"
            aria-checked={!!approvalRequired}
            aria-label="Approval required"
            disabled={disabled}
            onClick={() => setValue('approvalRequired', !approvalRequired)}
            className="flex items-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', approvalRequired ? 'bg-[#F37021]' : 'bg-gray-300')}>
              <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', approvalRequired ? 'left-[22px]' : 'left-0.5')} />
            </span>
            <span className="text-xs font-bold text-gray-700">{approvalRequired ? 'Required' : 'Automatic'}</span>
          </button>
          <p className="mt-1 text-[11px] text-gray-400">
            {approvalRequired ? 'A person must sign off first.' : 'Applies on its own.'}
          </p>
        </div>

        <div>
          <p className={RULE_LABEL_CLASS}>Status</p>
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

      <RuleFormField label="Description" error={errors.description?.message} hint="Internal note for admins and advisors.">
        <textarea
          rows={2}
          {...register('description')}
          disabled={disabled}
          placeholder="When does this rule trigger…"
          aria-label="Description"
          className={cn(RULE_FIELD_CLASS, 'resize-none leading-relaxed')}
        />
      </RuleFormField>
    </RuleFormSection>
  );
}
