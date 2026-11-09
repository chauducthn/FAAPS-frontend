// Form to send an advising request to the assigned advisor.
// The backend only stores a title and a description, so the form has exactly those two fields.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { advisingRequestSchema, type AdvisingRequestFormValues } from '../validations/advisingRequest.schema';

const field =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] disabled:bg-[#f7f8fa] disabled:opacity-70 aria-[invalid=true]:border-red-400';
const labelClass = 'mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]';

const MAX_TITLE = 255;
const MAX_DESCRIPTION = 10000;

export function AdvisingRequestForm({ disabled, disabledReason }: { disabled: boolean; disabledReason?: string }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdvisingRequestFormValues>({
    resolver: zodResolver(advisingRequestSchema),
    defaultValues: { title: '', description: '' },
  });

  const title = watch('title') ?? '';
  const description = watch('description') ?? '';

  const onSubmit = handleSubmit(async (values) => {
    try {
      await studentAcademicService.createAdvising({ title: values.title, description: values.description });
      toast.success('Advising request submitted');
      reset({ title: '', description: '' });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['student', 'advising-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['student', 'assignment'] }),
      ]);
    } catch (error) {
      toast.error(apiMessage(error));
    }
  });

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[#151c27]">Send Advising Request</h2>
      <p className="mt-0.5 text-[13px] text-[#555f6f]">Describe the issue clearly so your advisor can respond more effectively.</p>

      {disabled && disabledReason && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900" role="status">
          {disabledReason}
        </p>
      )}

      <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <label htmlFor="advising-title" className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="advising-title"
            {...register('title')}
            disabled={disabled}
            aria-invalid={!!errors.title}
            placeholder="Example: Review my Semester 7 study plan"
            maxLength={MAX_TITLE}
            className={field}
          />
          <div className="mt-1 flex justify-between gap-2">
            <p className="text-[11px] text-red-600">{errors.title?.message}</p>
            <p className="text-[11px] text-[#98a2b3]">
              {title.length}/{MAX_TITLE}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="advising-description" className={labelClass}>
            Details <span className="text-red-500">*</span>
          </label>
          <textarea
            id="advising-description"
            {...register('description')}
            disabled={disabled}
            aria-invalid={!!errors.description}
            rows={6}
            placeholder="Describe what you need advice about..."
            maxLength={MAX_DESCRIPTION}
            className={`${field} resize-none`}
          />
          <div className="mt-1 flex justify-between gap-2">
            <p className="text-[11px] text-red-600">{errors.description?.message}</p>
            <p className="text-[11px] text-[#98a2b3]">
              {description.length}/{MAX_DESCRIPTION}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="size-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </section>
  );
}
