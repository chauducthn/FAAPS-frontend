// Create / edit / view form for Academic Rules.
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SpinnerGap as Loader2, ShieldCheck } from '@phosphor-icons/react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { createAcademicRuleSchema, type CreateAcademicRuleFormValues } from '../../../academic/validations/academic-rule.schema';
import type { AcademicRule, AcademicRuleType } from '../../../academic/types/academic-rule';
import {
  buildCondition,
  describeCondition,
  draftFromCondition,
  gradeFromCondition,
  templateFor,
  type CondDraft,
} from './ruleConditionDraft';
import {
  BLANK_RESTR,
  buildRestriction,
  restrFromObject,
  validateRuleDraft,
  type RestrDraft,
} from './ruleRestrictionDraft';
import { RuleFormSection } from './RuleFormPrimitives';
import { RuleConditionFields } from './RuleConditionFields';
import { RuleRestrictionSection } from './RuleRestrictionSection';
import { RuleEnforcementSection } from './RuleEnforcementSection';
import { RuleFormHeader, RuleIdentitySection } from './RuleIdentitySection';

interface Props {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  initial?: AcademicRule | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAcademicRuleFormValues) => void;
}

export default function RuleFormModal({ open, mode, initial, isLoading, onClose, onSubmit }: Props) {
  const isCreate = mode === 'create';
  const isView = mode === 'view';
  const activeReadOnly = initial?.status === 'ACTIVE';
  const readOnly = isView || activeReadOnly;
  const disabled = readOnly || !!isLoading;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAcademicRuleFormValues>({
    resolver: zodResolver(createAcademicRuleSchema),
    defaultValues: { ruleName: '', policyType: 'GPA_WARNING', priority: 0, isActive: true },
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
        ruleName: initial.ruleName,
        policyType: initial.policyType,
        condition: initial.condition,
        restriction: initial.restriction,
        approvalRequired: initial.approvalRequired,
        priority: initial.priority,
        description: initial.description ?? '',
        grade: initial.grade,
        status: initial.status,
        isActive: initial.isActive,
      });
      setCond(draftFromCondition(initial.policyType, initial.condition));
      setRestr(restrFromObject(initial.restriction));
    } else {
      reset({
        ruleName: '',
        policyType: 'GPA_WARNING',
        condition: {},
        restriction: {},
        approvalRequired: false,
        priority: 0,
        description: '',
        grade: null,
        status: 'DRAFT',
        isActive: false,
      });
      setCond(templateFor('GPA_WARNING'));
      setRestr(BLANK_RESTR);
    }
  }, [open, initial, reset]);

  useEffect(() => {
    if (!open) return;
    if (!initial || policyType !== initial.policyType) setCond(templateFor(policyType));
  }, [open, policyType, initial]);

  const builtCondition = useMemo(() => buildCondition(policyType, cond), [policyType, cond]);
  const builtRestriction = useMemo(() => buildRestriction(restr), [restr]);
  const builtGrade = useMemo(() => gradeFromCondition(policyType, cond), [policyType, cond]);

  useEffect(() => {
    setValue('condition', builtCondition, { shouldValidate: true });
  }, [builtCondition, setValue]);
  useEffect(() => {
    setValue('restriction', builtRestriction);
  }, [builtRestriction, setValue]);
  useEffect(() => {
    setValue('grade', builtGrade);
  }, [builtGrade, setValue]);

  const condErrors = useMemo(() => validateRuleDraft(policyType, cond, restr), [policyType, cond, restr]);
  const hasCondError = Object.keys(condErrors).length > 0;
  const canSubmit = !isLoading && !readOnly && !hasCondError && Object.keys(builtCondition).length > 0;
  const summary = describeCondition(policyType, cond);

  const submit = (values: CreateAcademicRuleFormValues) => {
    if (hasCondError) return;
    onSubmit({
      ...values,
      ruleName: values.ruleName.trim(),
      condition: builtCondition,
      restriction: builtRestriction,
      grade: builtGrade,
      status: isCreate ? 'DRAFT' : values.status,
    });
  };

  const set = <K extends keyof CondDraft>(key: K, value: CondDraft[K]) => setCond((c) => ({ ...c, [key]: value }));
  const setR = <K extends keyof RestrDraft>(key: K, value: RestrDraft[K]) => setRestr((r) => ({ ...r, [key]: value }));
  const title = isCreate ? 'Create rule' : isView ? `Rule ${initial?.ruleName ?? ''}` : `Edit ${initial?.ruleName ?? 'rule'}`;

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-3xl">
      <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-col">
        <RuleFormHeader title={title} isCreate={isCreate} readOnly={readOnly} initial={initial} onClose={onClose} />
        <div className="max-h-[68vh] space-y-4 overflow-y-auto bg-gray-50/40 px-6 py-5 text-[13px]">
          <RuleIdentitySection activeReadOnly={activeReadOnly} isView={isView} disabled={disabled} register={register} errors={errors} />
          <RuleFormSection step={2} title="Trigger condition" hint="Configure thresholds — the rule expression builds automatically.">
            <RuleConditionFields policyType={policyType as AcademicRuleType} cond={cond} set={set} errors={condErrors} readOnly={disabled} />
            <div className="flex items-start gap-2.5 rounded-lg border border-orange-200/80 bg-orange-50/60 px-3.5 py-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#C2410C]" aria-hidden />
              <p className="text-xs leading-relaxed text-[#7C2D12]">
                <span className="font-semibold">Rule summary: </span>{summary}
              </p>
            </div>
          </RuleFormSection>
          <RuleRestrictionSection restr={restr} disabled={disabled} errors={condErrors} setR={setR} />
          <RuleEnforcementSection isCreate={isCreate} initial={initial} priority={priority} approvalRequired={approvalRequired} disabled={disabled} register={register} setValue={setValue} errors={errors} />
        </div>
        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-white px-6 py-3.5">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50">
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={!canSubmit}
              title={hasCondError ? 'Answer every required question above to continue' : undefined}
              className="inline-flex h-9 min-w-32 items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? 'Saving…' : isCreate ? 'Create rule' : 'Save changes'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
