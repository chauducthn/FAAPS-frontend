// src/components/admin/academic-rules/RuleFormModal.tsx
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../ui/Modal';
import {
  createAcademicRuleSchema,
  POLICY_TYPES,
  type CreateAcademicRuleFormValues,
} from '../../../validations/academic-rule.schema';
import type { AcademicRule } from '../../../types/academic-rule';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: AcademicRule | null;
  curriculums: { id: string; name: string }[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAcademicRuleFormValues) => void;
}

export default function RuleFormModal({
  open,
  mode,
  initial,
  curriculums,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const isCreate = mode === 'create';

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAcademicRuleFormValues>({
    resolver: zodResolver(createAcademicRuleSchema),
    defaultValues: initial
      ? {
          curriculumVersionId: initial.curriculumVersionId,
          policyType: initial.policyType,
          condition: initial.condition,
          restriction: initial.restriction,
          approvalRequired: initial.approvalRequired,
          priority: initial.priority,
          description: initial.description ?? '',
          displayMessage: initial.displayMessage ?? '',
          isActive: initial.isActive,
        }
      : {
          curriculumVersionId: '',
          policyType: 'GPA_WARNING',
          condition: {},
          priority: 0,
          isActive: true,
        },
  });

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
        isActive: initial.isActive,
      });
    } else {
      reset({
        curriculumVersionId: '',
        policyType: 'GPA_WARNING',
        condition: {},
        priority: 0,
        isActive: true,
      });
    }
  }, [open, initial, reset]);

  return (
    <Modal open={open} onClose={onClose} title={isCreate ? 'Create Rule' : 'Edit Rule'}>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Curriculum" required error={errors.curriculumVersionId?.message}>
            <select
              {...register('curriculumVersionId')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            >
              <option value="">Select curriculum...</option>
              {curriculums.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Policy Type" required error={errors.policyType?.message}>
            <select
              {...register('policyType')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            >
              {POLICY_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Condition (JSON)"
          required
          error={errors.condition?.message as string | undefined}
        >
          <Controller name="condition" control={control} render={({ field }) => (
            <textarea rows={4} placeholder='{"min_gpa": 5.0, "min_credits": 30}'
              value={jsonText(field.value)} onBlur={field.onBlur}
              onChange={(event) => field.onChange(parseJson(event.target.value, false))}
              className="w-full px-3 py-2 font-mono border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]" />
          )} />
        </Field>

        <Field label="Restriction (JSON, optional)">
          <Controller name="restriction" control={control} render={({ field }) => (
            <textarea rows={3} placeholder='{"block_registration": true}'
              value={jsonText(field.value)} onBlur={field.onBlur}
              onChange={(event) => field.onChange(parseJson(event.target.value, true))}
              className="w-full px-3 py-2 font-mono border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]" />
          )} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Priority" error={errors.priority?.message}>
            <input
              type="number"
              min={0}
              {...register('priority', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <label className="flex items-center gap-2 font-semibold text-gray-700 mt-6">
            <input type="checkbox" {...register('approvalRequired')} />
            Approval required
          </label>
          <label className="flex items-center gap-2 font-semibold text-gray-700 mt-6">
            <input type="checkbox" {...register('isActive')} />
            Active
          </label>
        </div>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            rows={2}
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <Field label="Display message (shown to student)" error={errors.displayMessage?.message}>
          <input
            {...register('displayMessage')}
            placeholder="You cannot register for more than 24 credits."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-lg disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : isCreate ? 'Create Rule' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function jsonText(value: unknown): string {
  return value == null ? '' : typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

function parseJson(value: string, optional: boolean): unknown {
  if (!value.trim()) return optional ? undefined : {};
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-bold text-gray-700 uppercase mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
