// src/components/learning/AdvisingRequestForm.tsx
// Form gửi yêu cầu tư vấn của sinh viên.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import {
  createAdvisingRequestSchema,
  type CreateAdvisingRequestFormValues,
} from '../../advising/validations/advising.schema';
import { useCreateAdvisingRequest } from '../../advising/hooks/mutations/useAdvisingMutations';

const field =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21] disabled:bg-gray-50';
const labelClass = 'mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]';

const MAX_TITLE = 255;
const MAX_DESCRIPTION = 2000;

const emptyValues: CreateAdvisingRequestFormValues = {
  requestType: 'PLAN_REVIEW',
  title: '',
  description: '',
  studyPlanId: '',
};

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
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

export function AdvisingRequestForm() {
  const createMutation = useCreateAdvisingRequest();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateAdvisingRequestFormValues>({
    resolver: zodResolver(createAdvisingRequestSchema),
    defaultValues: emptyValues,
  });

  const title = watch('title') ?? '';
  const description = watch('description') ?? '';

  const onSubmit = handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      requestType: values.requestType,
      title: values.title.trim(),
      description: values.description?.trim() ? values.description.trim() : undefined,
      studyPlanId: values.studyPlanId || undefined,
    });
    reset(emptyValues);
  });

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[#151c27]">Send Advising Request</h2>
      <p className="mt-0.5 text-[13px] text-[#555f6f]">
        Describe the issue clearly so your advisor can respond more effectively.
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <Field label="Request Type" required error={errors.requestType?.message}>
          <select {...register('requestType')} className={field} aria-label="Request type">
            <option value="PLAN_REVIEW">Study plan review</option>
            <option value="COURSE_SELECTION">Course selection</option>
            <option value="ACADEMIC_GUIDANCE">Academic guidance</option>
            <option value="GRADUATION_CHECK">Graduation eligibility check</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>

        <Field label="Title" required error={errors.title?.message}>
          <input
            {...register('title')}
            placeholder="Example: Review my Semester 7 study plan"
            maxLength={MAX_TITLE}
            className={field}
            aria-label="Title"
          />
          <p className="mt-1 text-right text-[11px] text-[#98a2b3]">
            {title.length}/{MAX_TITLE}
          </p>
        </Field>

        <Field label="Details" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Describe what you need advice about..."
            maxLength={MAX_DESCRIPTION}
            className={`${field} resize-none`}
            aria-label="Details"
          />
          <p className="mt-1 text-right text-[11px] text-[#98a2b3]">
            {description.length}/{MAX_DESCRIPTION}
          </p>
        </Field>

        <Field label="Related Study Plan" error={errors.studyPlanId?.message}>
          <select {...register('studyPlanId')} disabled className={field} aria-label="Related study plan">
            <option value="">No study plans available</option>
          </select>
          <p className="mt-1 text-[11px] text-[#98a2b3]">
            The student study-plan list API is not available yet.
          </p>
        </Field>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="size-4" />
          {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </section>
  );
}
