// Open and completed task lists for LearningPlanTaskBoard.

import { CalendarDays, CircleCheckBig, ListTodo } from 'lucide-react';
import type { CoursePlan } from '../../../academic/services/studentAcademicService';
import { LearningPlanTaskRow } from './LearningPlanTaskRow';

type CoursePlanTask = CoursePlan['tasks'][number];

interface LearningPlanTaskListsProps {
  tasks: CoursePlanTask[];
  openTasks: CoursePlanTask[];
  doneTasks: CoursePlanTask[];
  today: string;
  busy: boolean;
  onToggleTask: (taskId: string, nextCompleted: boolean) => void;
  onEditTask: (index: number) => void;
  onDeleteTask: (index: number) => void;
}

export function LearningPlanTaskLists({
  tasks,
  openTasks,
  doneTasks,
  today,
  busy,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: LearningPlanTaskListsProps) {
  return (
    <>
      {tasks.length === 0 ? (
        <p className="px-5 py-8 text-center text-[13px] text-[#555f6f]">No tasks in this plan version.</p>
      ) : (
        <div>
          <div className="flex items-center gap-2 px-4 pt-4 sm:px-5">
            <ListTodo className="size-4 text-[#F26F21]" />
            <h3 className="text-[13px] font-bold text-[#151c27]">
              To do <span className="font-semibold text-[#98a2b3]">({openTasks.length})</span>
            </h3>
          </div>
          {openTasks.length === 0 ? (
            <p className="px-4 py-4 text-[13px] text-[#555f6f] sm:px-5">
              Everything is checked off. Add a new task to keep the momentum.
            </p>
          ) : (
            <ul className="mt-1 divide-y divide-[#f1f5f9]">
              {openTasks.map((task) => {
                const index = tasks.findIndex((t) => t.id === task.id);
                return (
                  <LearningPlanTaskRow
                    key={task.id}
                    task={task}
                    today={today}
                    disabled={busy}
                    onToggle={() => onToggleTask(task.id, true)}
                    onEdit={() => onEditTask(index)}
                    onDelete={() => onDeleteTask(index)}
                  />
                );
              })}
            </ul>
          )}

          <div className="mt-2 flex items-center gap-2 border-t border-[#f1f5f9] bg-[#fafbfc] px-4 pt-4 sm:px-5">
            <CircleCheckBig className="size-4 text-green-600" />
            <h3 className="text-[13px] font-bold text-[#151c27]">
              Completed <span className="font-semibold text-[#98a2b3]">({doneTasks.length})</span>
            </h3>
          </div>
          {doneTasks.length === 0 ? (
            <p className="bg-[#fafbfc] px-4 py-4 text-[13px] text-[#555f6f] sm:px-5">
              Nothing completed yet — check off a task above to see it here.
            </p>
          ) : (
            <ul className="divide-y divide-[#f1f5f9] bg-[#fafbfc] pb-2">
              {doneTasks.map((task) => {
                const index = tasks.findIndex((t) => t.id === task.id);
                return (
                  <LearningPlanTaskRow
                    key={task.id}
                    task={task}
                    today={today}
                    disabled={busy}
                    onToggle={() => onToggleTask(task.id, false)}
                    onEdit={() => onEditTask(index)}
                    onDelete={() => onDeleteTask(index)}
                  />
                );
              })}
            </ul>
          )}
        </div>
      )}

      <p className="flex items-center gap-1.5 px-4 py-3 text-[12px] text-[#98a2b3] sm:px-5">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        Overdue tasks are highlighted in red so nothing slips past its deadline.
      </p>
    </>
  );
}
