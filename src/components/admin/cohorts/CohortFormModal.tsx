// src/components/admin/cohorts/CohortFormModal.tsx
// Create/Edit cohort using react-hook-form + Zod resolver.
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import {
  createCohortSchema,
  type CreateCohortFormValues,
  type UpdateCohortFormValues,
} from '../../../validations/cohort.schema';
import type { Cohort, UpdateCohortDto } from '../../../types/cohort';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Cohort | null;
  isLoading?: boolean;
  onClose: () => void;
  onCreate: (values: CreateCohortFormValues) => void;
  onUpdate: (values: UpdateCohortFormValues) => void;
}

export default function CohortFormModal({
  open,
  mode,
  initial,
  isLoading,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const isCreate = mode === 'create';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCohortFormValues>({
    // Both modes share the same input shape; BE handles optional fields on update.
    resolver: zodResolver(createCohortSchema),
    defaultValues: initial
      ? {
          code: initial.code,
          name: initial.name,
          startDate: initial.startDate,
          endDate: initial.endDate,
          majorIds: [],
          isCurrent: initial.isCurrent,
        }
      : {
          code: '',
          name: '',
          startDate: '',
          endDate: '',
          majorIds: [],
        },
  });

  useEffect(() => {
    if (open && initial) reset({ ...initial, majorIds: [] });
    if (open && !initial) reset({ code: '', name: '', startDate: '', endDate: '', majorIds: [] });
  }, [open, initial, reset]);

  const startDate = watch('startDate');

  const submit = (values: CreateCohortFormValues) => {
    if (isCreate) {
      onCreate(values);
    } else {
      // For update, only forward fields that the user actually set.
      const dto: UpdateCohortDto = {
        code: values.code,
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        ...(values.isCurrent !== undefined ? { isCurrent: values.isCurrent } : {}),
      };
      onUpdate(dto);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isCreate ? 'Create Cohort' : 'Edit Cohort'}>
      <form onSubmit={handleSubmit(submit)} className="p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="size-4 text-[#F26F21]" />
          <span className="font-bold uppercase">Cohort Information</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cohort Code" required error={errors.code?.message}>
            <input
              {...register('code')}
              placeholder="K18, K19..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <Field label="Name" required error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="K18 - Fall 2023"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date" required error={errors.startDate?.message}>
            <input
              type="date"
              {...register('startDate')}
              onChange={(e) => setValue('startDate', e.target.value, { shouldValidate: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <Field label="End Date" required error={errors.endDate?.message}>
            <input
              type="date"
              min={startDate || undefined}
              {...register('endDate')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <input type="checkbox" {...register('isCurrent')} />
          Mark as current cohort
        </label>

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
            {isLoading ? 'Saving...' : isCreate ? 'Create Cohort' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
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
