// Modal for creating or editing a single learning task: title, description, deadline and resource link.
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import {
  MAX_TASK_DESCRIPTION,
  MAX_TASK_TITLE,
  MAX_TASK_URL,
  learningTaskSchema,
  type LearningTaskFormValues,
} from '../../validations/learningPlan.schema';

const field =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] disabled:bg-[#f7f8fa] disabled:opacity-70 aria-[invalid=true]:border-red-400';
const labelClass = 'mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]';

const EMPTY: LearningTaskFormValues = { title: '', description: '', dueDate: '', resourceUrl: '' };

interface TaskFormModalProps {
  open: boolean;
  initial: LearningTaskFormValues | null;
  courseLabel: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: LearningTaskFormValues) => void;
}

export function TaskFormModal({ open, initial, courseLabel, saving, onClose, onSubmit }: TaskFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LearningTaskFormValues>({
    resolver: zodResolver(learningTaskSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset(initial ?? EMPTY);
  }, [open, initial, reset]);

  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const resourceUrl = watch('resourceUrl') ?? '';

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit task' : 'New task'}>
      <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-[#151c27]">{initial ? 'Edit task' : 'New task'}</h2>
          <p className="mt-0.5 truncate text-[12px] text-[#555f6f]">{courseLabel}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-lg p-1.5 text-[#98a2b3] hover:bg-gray-100 hover:text-[#151c27]"
        >
          <X className="size-4" />
        </button>
      </div>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-5 py-5">
        <div>
          <label htmlFor="task-title" className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            {...register('title')}
            disabled={saving}
            aria-invalid={!!errors.title}
            placeholder="Example: Summarize chapter 4 key terms"
            maxLength={MAX_TASK_TITLE}
            className={field}
          />
          <div className="mt-1 flex justify-between gap-2">
            <p className="text-[11px] text-red-600">{errors.title?.message}</p>
            <p className="text-[11px] text-[#98a2b3]">
              {title.length}/{MAX_TASK_TITLE}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="task-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="task-description"
            {...register('description')}
            disabled={saving}
            aria-invalid={!!errors.description}
            rows={4}
            placeholder="What exactly needs to be done?"
            maxLength={MAX_TASK_DESCRIPTION}
            className={`${field} resize-none`}
          />
          <div className="mt-1 flex justify-between gap-2">
            <p className="text-[11px] text-red-600">{errors.description?.message}</p>
            <p className="text-[11px] text-[#98a2b3]">
              {description.length}/{MAX_TASK_DESCRIPTION}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="task-due-date" className={labelClass}>
              Deadline
            </label>
            <input
              id="task-due-date"
              {...register('dueDate')}
              disabled={saving}
              aria-invalid={!!errors.dueDate}
              type="date"
              className={field}
            />
            <p className="mt-1 text-[11px] text-red-600">{errors.dueDate?.message}</p>
          </div>

          <div>
            <label htmlFor="task-resource-url" className={labelClass}>
              Resource link
            </label>
            <input
              id="task-resource-url"
              {...register('resourceUrl')}
              disabled={saving}
              aria-invalid={!!errors.resourceUrl}
              type="url"
              inputMode="url"
              placeholder="https://example.com/notes"
              maxLength={MAX_TASK_URL}
              className={field}
            />
            <div className="mt-1 flex justify-between gap-2">
              <p className="text-[11px] text-red-600">{errors.resourceUrl?.message}</p>
              <p className="text-[11px] text-[#98a2b3]">
                {resourceUrl.length}/{MAX_TASK_URL}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 hover:text-[#151c27] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#F26F21] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#d95e13] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : initial ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
