// src/components/student/AdvisingRequestForm.tsx
// Form gửi yêu cầu tư vấn của sinh viên.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import {
  createAdvisingRequestSchema,
  type CreateAdvisingRequestFormValues,
} from '../../validations/advising.schema';
import { useCreateAdvisingRequest } from '../../hooks/mutations/useAdvisingMutations';

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
      <h2 className="text-sm font-semibold text-[#151c27]">Gửi yêu cầu tư vấn</h2>
      <p className="mt-0.5 text-[13px] text-[#555f6f]">
        Mô tả rõ vấn đề cần hỗ trợ để cố vấn phản hồi nhanh hơn.
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <Field label="Loại yêu cầu" required error={errors.requestType?.message}>
          <select {...register('requestType')} className={field} aria-label="Loại yêu cầu">
            <option value="PLAN_REVIEW">Duyệt kế hoạch học tập</option>
            <option value="COURSE_SELECTION">Chọn môn học</option>
            <option value="ACADEMIC_GUIDANCE">Hướng dẫn học thuật</option>
            <option value="GRADUATION_CHECK">Kiểm tra điều kiện tốt nghiệp</option>
            <option value="OTHER">Khác</option>
          </select>
        </Field>

        <Field label="Tiêu đề" required error={errors.title?.message}>
          <input
            {...register('title')}
            placeholder="VD: Duyệt kế hoạch học tập học kỳ 7"
            maxLength={MAX_TITLE}
            className={field}
            aria-label="Tiêu đề"
          />
          <p className="mt-1 text-right text-[11px] text-[#98a2b3]">
            {title.length}/{MAX_TITLE}
          </p>
        </Field>

        <Field label="Mô tả chi tiết" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Mô tả cụ thể nội dung cần tư vấn..."
            maxLength={MAX_DESCRIPTION}
            className={`${field} resize-none`}
            aria-label="Mô tả chi tiết"
          />
          <p className="mt-1 text-right text-[11px] text-[#98a2b3]">
            {description.length}/{MAX_DESCRIPTION}
          </p>
        </Field>

        <Field label="Kế hoạch học tập liên quan" error={errors.studyPlanId?.message}>
          <select {...register('studyPlanId')} disabled className={field} aria-label="Kế hoạch học tập liên quan">
            <option value="">Chưa có kế hoạch học tập nào</option>
          </select>
          <p className="mt-1 text-[11px] text-[#98a2b3]">
            Backend chưa có API danh sách kế hoạch học tập của sinh viên.
          </p>
        </Field>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="size-4" />
          {createMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>
    </section>
  );
}
