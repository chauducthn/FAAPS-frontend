// Create / edit / view form for Academic Rules.
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck } from 'lucide-react';
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
    <Modal open={open} onClose={onClose} title={title} className="max-w-2xl">
      <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-col">
        <RuleFormHeader title={title} isCreate={isCreate} readOnly={readOnly} initial={initial} onClose={onClose} />
        <div className="space-y-5 overflow-y-auto px-6 py-6 text-[13px]">
          <RuleIdentitySection activeReadOnly={activeReadOnly} isView={isView} disabled={disabled} register={register} errors={errors} />
          <RuleFormSection title="Condition" hint="Answer the questions — the rule builds itself. No code needed.">
            <RuleConditionFields policyType={policyType as AcademicRuleType} cond={cond} set={set} errors={condErrors} readOnly={disabled} />
            <div className="flex items-start gap-2.5 rounded-xl bg-orange-50 px-4 py-3 ring-1 ring-orange-100">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#9A3412]" aria-hidden />
              <p className="text-xs leading-relaxed text-[#7C2D12]">
                <span className="font-bold">In plain words: </span>{summary}
              </p>
            </div>
          </RuleFormSection>
          <RuleRestrictionSection restr={restr} disabled={disabled} errors={condErrors} setR={setR} />
          <RuleEnforcementSection isCreate={isCreate} initial={initial} priority={priority} approvalRequired={approvalRequired} disabled={disabled} register={register} setValue={setValue} errors={errors} />
        </div>
        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={!canSubmit}
              title={hasCondError ? 'Answer every required question above to continue' : undefined}
              className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#F37021] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#D9601A] disabled:cursor-not-allowed disabled:opacity-60"
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
