// src/components/admin/curriculum/CurriculumFormModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import {
  createCurriculumSchema,
  type CreateCurriculumFormValues,
} from '../../../validations/curriculum.schema';
import type { CurriculumSummary } from '../../../types/curriculum';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: CurriculumSummary | null;
  isLoading?: boolean;
  // BE dropdowns the form depends on
  majors: { id: string; code: string; name: string }[];
  semesters: { id: string; code: string; name: string }[];
  onClose: () => void;
  onSubmit: (values: CreateCurriculumFormValues) => void;
}

export default function CurriculumFormModal({
  open,
  mode,
  initial,
  isLoading,
  majors,
  semesters,
  onClose,
  onSubmit,
}: Props) {
  const isCreate = mode === 'create';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCurriculumFormValues>({
    resolver: zodResolver(createCurriculumSchema),
    defaultValues: initial
      ? {
          majorId: initial.majorId,
          version: initial.version,
          name: initial.name,
          effectiveFromSemesterId: initial.effectiveFromSemesterId,
          effectiveToSemesterId: initial.effectiveToSemesterId ?? undefined,
          description: '',
          isCurrent: initial.isCurrent,
        }
      : {
          majorId: '',
          version: '',
          name: '',
          effectiveFromSemesterId: '',
          description: '',
        },
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        majorId: initial.majorId,
        version: initial.version,
        name: initial.name,
        effectiveFromSemesterId: initial.effectiveFromSemesterId,
        effectiveToSemesterId: initial.effectiveToSemesterId ?? undefined,
        description: '',
        isCurrent: initial.isCurrent,
      });
    } else {
      reset({
        majorId: '',
        version: '',
        name: '',
        effectiveFromSemesterId: '',
        description: '',
      });
    }
  }, [open, initial, reset]);

  return (
    <Modal open={open} onClose={onClose} title={isCreate ? 'Create Curriculum' : 'Edit Curriculum'}>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-gray-700">
          <BookOpen className="size-4 text-[#F26F21]" />
          <span className="font-bold uppercase">Curriculum Information</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Major" required error={errors.majorId?.message}>
            <select
              {...register('majorId')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            >
              <option value="">Select major...</option>
              {majors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Version" required error={errors.version?.message}>
            <input
              {...register('version')}
              placeholder="K18, K19..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
        </div>

        <Field label="Name" required error={errors.name?.message}>
          <input
            {...register('name')}
            placeholder="Software Engineering Curriculum 2024"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Effective From" required error={errors.effectiveFromSemesterId?.message}>
            <select
              {...register('effectiveFromSemesterId')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            >
              <option value="">Select semester...</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Effective To (optional)" error={errors.effectiveToSemesterId?.message}>
            <select
              {...register('effectiveToSemesterId')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            >
              <option value="">No end date</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            rows={3}
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <input type="checkbox" {...register('isCurrent')} />
          Mark as current version
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
            {isLoading ? 'Saving...' : isCreate ? 'Create Curriculum' : 'Save Changes'}
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