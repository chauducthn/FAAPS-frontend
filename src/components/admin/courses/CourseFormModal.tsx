// src/components/admin/courses/CourseFormModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookText } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import {
  createCourseSchema,
  type CreateCourseFormValues,
} from '../../../validations/course.schema';
import type { CourseCategory, CourseDetail } from '../../../types/course';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  /** Full course (the list rows do not carry description, objectives or outcomes). */
  initial?: CourseDetail | null;
  isLoadingInitial?: boolean;
  categories: CourseCategory[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCourseFormValues) => void;
}

export default function CourseFormModal({
  open,
  mode,
  initial,
  categories,
  isLoading,
  isLoadingInitial,
  onClose,
  onSubmit,
}: Props) {
  const isCreate = mode === 'create';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: initial
      ? {
          code: initial.code,
          name: initial.name,
          credits: initial.credits,
          categoryId: initial.categoryId,
          description: initial.description ?? '',
          objectives: initial.objectives ?? '',
          learningOutcomes: initial.learningOutcomes ?? '',
          status: initial.status,
        }
      : { code: '', name: '', credits: 3, categoryId: '' },
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        code: initial.code,
        name: initial.name,
        credits: initial.credits,
        categoryId: initial.categoryId,
        description: initial.description ?? '',
        objectives: initial.objectives ?? '',
        learningOutcomes: initial.learningOutcomes ?? '',
        status: initial.status,
      });
    } else {
      reset({ code: '', name: '', credits: 3, categoryId: '' });
    }
  }, [open, initial, reset]);

  return (
    <Modal open={open} onClose={onClose} title={isCreate ? 'Create Course' : 'Edit Course'}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-gray-700">
          <BookText className="size-4 text-[#F26F21]" />
          <span className="font-bold uppercase">Course Information</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Code" required error={errors.code?.message}>
            <input
              {...register('code')}
              placeholder="SE101"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <Field label="Credits" required error={errors.credits?.message}>
            <input
              type="number"
              min={1}
              max={20}
              {...register('credits', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <Field label="Category" required error={errors.categoryId?.message}>
            <select
              {...register('categoryId')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {!isCreate && (
          <Field label="Status" error={errors.status?.message}>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>
        )}

        <Field label="Name" required error={errors.name?.message}>
          <input
            {...register('name')}
            placeholder="Introduction to Programming"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            rows={3}
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <Field label="Objectives" error={errors.objectives?.message}>
          <textarea
            rows={2}
            {...register('objectives')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <Field label="Learning Outcomes" error={errors.learningOutcomes?.message}>
          <textarea
            rows={2}
            {...register('learningOutcomes')}
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
            disabled={isLoading || isLoadingInitial}
            className="px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-lg disabled:opacity-60"
          >
            {isLoadingInitial ? 'Loading...' : isLoading ? 'Saving...' : isCreate ? 'Create Course' : 'Save Changes'}
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