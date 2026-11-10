// One row of the learning-plan task list: checkbox, content, deadline, resource link and row actions.
import { CalendarDays, Check, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { CoursePlan } from '../../../academic/services/studentAcademicService';

export type PlanTask = CoursePlan['tasks'][number];

export const formatDueDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

interface LearningPlanTaskRowProps {
  task: PlanTask;
  today: string;
  disabled: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function LearningPlanTaskRow({ task, today, disabled, onToggle, onEdit, onDelete }: LearningPlanTaskRowProps) {
  const overdue = !task.completed && !!task.dueDate && task.dueDate < today;

  return (
    <li className={cn('flex items-start gap-3 px-4 py-3.5 sm:px-5', task.completed && 'bg-[#f7f8fa]')}>
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? `Mark "${task.title}" as not completed` : `Mark "${task.title}" as completed`}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26F21]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          task.completed
            ? 'border-[#F26F21] bg-[#F26F21] text-white'
            : 'border-[#d0d5dd] bg-white hover:border-[#F26F21]',
        )}
      >
        {task.completed && <Check className="size-3.5" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-semibold', task.completed ? 'text-[#98a2b3] line-through' : 'text-[#151c27]')}>
          {task.title}
        </p>
        {task.description && (
          <p className={cn('mt-1 break-words text-[13px] leading-relaxed', task.completed ? 'text-[#98a2b3]' : 'text-[#555f6f]')}>
            {task.description}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
          {task.dueDate ? (
            <span className={cn('inline-flex items-center gap-1', overdue ? 'font-semibold text-red-600' : 'text-[#555f6f]')}>
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {overdue ? `Overdue · ${formatDueDate(task.dueDate)}` : `Due ${formatDueDate(task.dueDate)}`}
            </span>
          ) : (
            <span className="text-[#98a2b3]">No due date</span>
          )}
          {task.resourceUrl && (
            <a
              href={task.resourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex max-w-full items-center gap-1 font-medium text-[#F26F21] hover:underline"
            >
              <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{task.resourceUrl.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          aria-label={`Edit "${task.title}"`}
          title="Edit task"
          className="rounded-lg p-1.5 text-[#98a2b3] hover:bg-gray-100 hover:text-[#151c27] disabled:opacity-50"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          aria-label={`Delete "${task.title}"`}
          title="Delete task"
          className="rounded-lg p-1.5 text-[#98a2b3] hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}
