// Learning tasks panel for the selected course in StudentLearningPlan.

import { BookOpenCheck, ListChecks, Plus } from 'lucide-react';
import type { CoursePlan, CurriculumCourse } from '../../../academic/services/studentAcademicService';
import { LearningPlanTaskLists } from './LearningPlanTaskLists';

type CoursePlanTask = CoursePlan['tasks'][number];

interface LearningPlanTaskBoardProps {
  isLoading: boolean;
  activeCourse: CurriculumCourse | null;
  activePlan: CoursePlan | null;
  tasks: CoursePlanTask[];
  openTasks: CoursePlanTask[];
  doneTasks: CoursePlanTask[];
  completed: number;
  percent: number;
  goal: string;
  goalTouched: boolean;
  today: string;
  busy: boolean;
  savingGoal: boolean;
  onNewTask: () => void;
  onGoalChange: (value: string) => void;
  onSaveGoal: () => void;
  onToggleTask: (taskId: string, nextCompleted: boolean) => void;
  onEditTask: (index: number) => void;
  onDeleteTask: (index: number) => void;
}

export function LearningPlanTaskBoard({
  isLoading,
  activeCourse,
  activePlan,
  tasks,
  openTasks,
  doneTasks,
  completed,
  percent,
  goal,
  goalTouched,
  today,
  busy,
  savingGoal,
  onNewTask,
  onGoalChange,
  onSaveGoal,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: LearningPlanTaskBoardProps) {
  return (
    <section aria-label="Learning tasks" className="overflow-hidden rounded-xl bg-white shadow-sm">
      {isLoading ? (
        <div className="space-y-3 p-5">
          <div className="h-5 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="h-2.5 w-full animate-pulse rounded-full bg-gray-100" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : !activeCourse ? (
        <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-orange-100 text-[#F26F21]">
            <BookOpenCheck className="size-5" />
          </span>
          <p className="text-sm font-semibold text-[#151c27]">No courses to plan for yet</p>
          <p className="max-w-sm text-[13px] text-[#555f6f]">
            Once your curriculum is assigned, pick a course here and break it into learning tasks.
          </p>
        </div>
      ) : (
        <>
          <div className="border-b border-[#f1f5f9] px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#F26F21]">{activeCourse.code}</p>
                <h2 className="mt-0.5 text-base font-semibold text-[#151c27]">{activeCourse.name}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#555f6f]">
                  <span>{activeCourse.credits > 0 ? `${activeCourse.credits} credits` : 'Course plan'}</span>
                  {activePlan && <span className="text-[#98a2b3]">· Version {activePlan.header.version}</span>}
                </p>
              </div>
              {activePlan && (
                <button
                  type="button"
                  onClick={onNewTask}
                  disabled={busy || tasks.length >= 100}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-3 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="size-4" /> New task
                </button>
              )}
            </div>

            {activePlan && (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="font-semibold text-[#151c27]">{completed} of {tasks.length} tasks completed</span>
                  <span className="font-bold text-[#F26F21]">{percent}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress for ${activeCourse.code}`}>
                  <div className="h-full rounded-full bg-[#F26F21] transition-[width]" style={{ width: `${percent}%` }} />
                </div>
              </div>
            )}
          </div>

          {!activePlan ? (
            <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-orange-100 text-[#F26F21]">
                <ListChecks className="size-5" />
              </span>
              <p className="text-sm font-semibold text-[#151c27]">No tasks for {activeCourse.code} yet</p>
              <p className="max-w-sm text-[13px] text-[#555f6f]">
                Create your first task — a title, an optional deadline and a study link — to start this course plan.
              </p>
              <button
                type="button"
                onClick={onNewTask}
                disabled={busy}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:opacity-60"
              >
                <Plus className="size-4" /> Create first task
              </button>
            </div>
          ) : (
            <>
              <div className="border-b border-[#f1f5f9] px-4 py-3 sm:px-5">
                <label htmlFor="learning-goal" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]">
                  Learning goal
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="learning-goal"
                    value={goal}
                    maxLength={10000}
                    disabled={busy}
                    onChange={(e) => onGoalChange(e.target.value)}
                    placeholder="Example: Master OOP and score 8+ on the final"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] disabled:bg-[#f7f8fa] disabled:opacity-70"
                  />
                  {goalTouched && (
                    <button
                      type="button"
                      disabled={busy || goal.trim() === (activePlan.header.learningGoal ?? '')}
                      onClick={onSaveGoal}
                      className="shrink-0 rounded-lg border border-[#F26F21] px-3 py-2 text-[13px] font-bold text-[#F26F21] hover:bg-orange-50 disabled:opacity-50"
                    >
                      {savingGoal ? 'Saving...' : 'Save goal'}
                    </button>
                  )}
                </div>
              </div>

              <LearningPlanTaskLists
                tasks={tasks}
                openTasks={openTasks}
                doneTasks={doneTasks}
                today={today}
                busy={busy}
                onToggleTask={onToggleTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
