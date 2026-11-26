// Create / edit / view multi-step wizard form for Academic Rules.
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from '@phosphor-icons/react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { createAcademicRuleSchema, type CreateAcademicRuleFormValues } from '../../../academic/validations/academic-rule.schema';
import type { AcademicRule, AcademicRuleType } from '../../../academic/types/academic-rule';
import {
  buildCondition, describeCondition, draftFromCondition, gradeFromCondition, templateFor, type CondDraft,
} from './ruleConditionDraft';
import {
  BLANK_RESTR, buildRestriction, restrFromObject, validateRuleDraft, type RestrDraft,
} from './ruleRestrictionDraft';
import { RuleFormSection } from './RuleFormPrimitives';
import { RuleConditionFields } from './RuleConditionFields';
import { RuleRestrictionSection } from './RuleRestrictionSection';
import { RuleEnforcementSection } from './RuleEnforcementSection';
import { RuleFormHeader, RuleIdentitySection } from './RuleIdentitySection';
import { RULE_FORM_STEPS, RuleFormFooter, RuleFormStepNav } from './RuleFormChrome';

interface Props {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  initial?: AcademicRule | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAcademicRuleFormValues) => void;
}

const RESTRICTION_ERROR_KEYS = new Set(['maxCreditsNextSemester', 'maxExtraCredits']);

export default function RuleFormModal({ open, mode, initial, isLoading, onClose, onSubmit }: Props) {
  const isCreate = mode === 'create';
  const isView = mode === 'view';
  const activeReadOnly = initial?.status === 'ACTIVE';
  const readOnly = isView || activeReadOnly;
  const disabled = readOnly || !!isLoading;

  const [step, setStep] = useState<number>(1);
  const { register, handleSubmit, reset, watch, setValue, trigger, formState: { errors } } =
    useForm<CreateAcademicRuleFormValues>({
      resolver: zodResolver(createAcademicRuleSchema),
      defaultValues: { ruleName: '', policyType: 'GPA_WARNING', priority: 0, isActive: true },
      mode: 'onChange',
    });

  const ruleName = watch('ruleName');
  const policyType = watch('policyType');
  const approvalRequired = watch('approvalRequired');
  const priority = watch('priority');
  const [cond, setCond] = useState<CondDraft>(() => templateFor('GPA_WARNING'));
  const [restr, setRestr] = useState<RestrDraft>(BLANK_RESTR);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    if (initial) {
      reset({
        ruleName: initial.ruleName, policyType: initial.policyType, condition: initial.condition,
        restriction: initial.restriction, approvalRequired: initial.approvalRequired, priority: initial.priority,
        description: initial.description ?? '', grade: initial.grade, status: initial.status, isActive: initial.isActive,
      });
      setCond(draftFromCondition(initial.policyType, initial.condition));
      setRestr(restrFromObject(initial.restriction));
    } else {
      reset({
        ruleName: '', policyType: 'GPA_WARNING', condition: {}, restriction: {},
        approvalRequired: false, priority: 0, description: '', grade: null, status: 'DRAFT', isActive: false,
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

  useEffect(() => { setValue('condition', builtCondition, { shouldValidate: true }); }, [builtCondition, setValue]);
  useEffect(() => { setValue('restriction', builtRestriction); }, [builtRestriction, setValue]);
  useEffect(() => { setValue('grade', builtGrade); }, [builtGrade, setValue]);

  const condErrors = useMemo(() => validateRuleDraft(policyType, cond, restr), [policyType, cond, restr]);
  const hasStep2Error = Object.keys(condErrors).some((k) => !RESTRICTION_ERROR_KEYS.has(k)) || Object.keys(builtCondition).length === 0;
  const hasStep3Error = Object.keys(condErrors).some((k) => RESTRICTION_ERROR_KEYS.has(k));
  const hasCondError = Object.keys(condErrors).length > 0;
  const step1Valid = (ruleName ?? '').trim().length > 0 && !errors.ruleName;
  const canSubmit = !isLoading && !readOnly && !hasCondError && Object.keys(builtCondition).length > 0;
  const summary = describeCondition(policyType, cond);

  const canAdvanceFrom = (current: number) => {
    if (readOnly) return true;
    if (current === 1) return step1Valid;
    if (current === 2) return !hasStep2Error;
    if (current === 3) return !hasStep3Error;
    return true;
  };

  const handleNext = async () => {
    if (step === 1 && !readOnly && !(await trigger(['ruleName', 'policyType']))) return;
    if (!canAdvanceFrom(step)) return;
    setStep((s) => Math.min(RULE_FORM_STEPS.length, s + 1));
  };

  const handleJumpStep = async (target: number) => {
    if (target === step) return;
    if (target < step || !isCreate || readOnly) return setStep(target);
    for (let s = step; s < target; s += 1) {
      if (s === 1 && !(await trigger(['ruleName', 'policyType']))) return;
      if (!canAdvanceFrom(s)) return;
    }
    setStep(target);
  };

  const submit = (values: CreateAcademicRuleFormValues) => {
    if (step < RULE_FORM_STEPS.length) return void handleNext();
    if (hasCondError) return;
    onSubmit({
      ...values, ruleName: values.ruleName.trim(), condition: builtCondition,
      restriction: builtRestriction, grade: builtGrade, status: isCreate ? 'DRAFT' : values.status,
    });
  };

  const set = <K extends keyof CondDraft>(key: K, value: CondDraft[K]) => setCond((c) => ({ ...c, [key]: value }));
  const setR = <K extends keyof RestrDraft>(key: K, value: RestrDraft[K]) => setRestr((r) => ({ ...r, [key]: value }));
  const title = isCreate ? 'Create rule' : isView ? `Rule ${initial?.ruleName ?? ''}` : `Edit ${initial?.ruleName ?? 'rule'}`;

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-2xl">
      <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-col">
        <RuleFormHeader title={title} isCreate={isCreate} readOnly={readOnly} initial={initial} onClose={onClose} />
        <RuleFormStepNav step={step} onJumpStep={(target) => void handleJumpStep(target)} />

        <div className="min-h-[280px] max-h-[60vh] overflow-y-auto bg-gray-50/40 px-6 py-5 text-[13px]">
          {step === 1 && (
            <RuleIdentitySection activeReadOnly={activeReadOnly} isView={isView} disabled={disabled} register={register} errors={errors} />
          )}
          {step === 2 && (
            <RuleFormSection step={2} title="Trigger condition" hint="Configure thresholds — the rule expression builds automatically.">
              <RuleConditionFields policyType={policyType as AcademicRuleType} cond={cond} set={set} errors={condErrors} readOnly={disabled} />
              <div className="flex items-start gap-2.5 rounded-lg border border-orange-200/80 bg-orange-50/60 px-3.5 py-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#C2410C]" aria-hidden />
                <p className="text-xs leading-relaxed text-[#7C2D12]">
                  <span className="font-semibold">Rule summary: </span>{summary}
                </p>
              </div>
            </RuleFormSection>
          )}
          {step === 3 && <RuleRestrictionSection restr={restr} disabled={disabled} errors={condErrors} setR={setR} />}
          {step === 4 && (
            <RuleEnforcementSection isCreate={isCreate} initial={initial} priority={priority} approvalRequired={approvalRequired} disabled={disabled} register={register} setValue={setValue} errors={errors} />
          )}
        </div>

        <RuleFormFooter
          step={step} isCreate={isCreate} readOnly={readOnly} isLoading={isLoading}
          canAdvance={canAdvanceFrom(step)} canSubmit={canSubmit} hasCondError={hasCondError}
          onBack={() => setStep((s) => Math.max(1, s - 1))} onClose={onClose} onNext={() => void handleNext()}
        />
      </form>
    </Modal>
  );
}
