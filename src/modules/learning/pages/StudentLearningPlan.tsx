// Student / Course Learning Plan: pick one enrolled course, manage its learning tasks,
// track completion with a progress bar. Persisted through the real course-learning-plan API:
// full plan saves create a new backend version, checkbox toggles PATCH the single task.
import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, CalendarDays, CircleCheckBig, ListChecks, ListTodo, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { ConfirmDialog } from '../../management/components/ConfirmDialog';
import { TaskFormModal } from '../components/learning-plan/TaskFormModal';
import { LearningPlanTaskRow } from '../components/learning-plan/LearningPlanTaskRow';
import {
  useCourseLearningPlans,
  usePlanCourseOptions,
  useSaveCoursePlan,
  useToggleLearningTask,
} from '../hooks/queries/useLearningPlanQueries';
import type { LearningTask } from '../../academic/services/studentAcademicService';
import type { LearningTaskFormValues } from '../validations/learningPlan.schema';

const toServerTask = (task: LearningTaskFormValues): LearningTask => ({
  title: task.title.trim(),
  description: task.description?.trim() ? task.description.trim() : null,
  dueDate: task.dueDate ? task.dueDate : null,
  resourceUrl: task.resourceUrl?.trim() ? task.resourceUrl.trim() : null,
});

const toFormTask = (task: LearningTask): LearningTaskFormValues => ({
  title: task.title,
  description: task.description ?? '',
  dueDate: task.dueDate ?? '',
  resourceUrl: task.resourceUrl ?? '',
});

const todayKey = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export default function StudentLearningPlan() {
  const plansQuery = useCourseLearningPlans();
  const coursesQuery = usePlanCourseOptions();
  const saveMutation = useSaveCoursePlan();
  const toggleMutation = useToggleLearningTask();

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const today = useMemo(() => todayKey(), []);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [goalDraft, setGoalDraft] = useState('');
  const [goalTouched, setGoalTouched] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Options = enrolled curriculum courses first, then any planned course missing from the list.
  const options = useMemo(() => {
    const byId = new Map(courses.map((c) => [c.courseId, c]));
    for (const plan of plans) {
      if (!byId.has(plan.header.courseId)) {
        byId.set(plan.header.courseId, {
          courseId: plan.header.courseId,
          code: plan.header.courseCode,
          name: plan.header.courseName,
          credits: 0,
          semesterNumber: 0,
          mandatory: false,
          groupName: null,
        });
      }
    }
    return [...byId.values()].sort((a, b) => a.code.localeCompare(b.code));
  }, [courses, plans]);

  useEffect(() => {
    if (!selectedCourseId && options.length > 0) setSelectedCourseId(options[0].courseId);
  }, [options, selectedCourseId]);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.header.courseId === selectedCourseId) ?? null,
    [plans, selectedCourseId],
  );
  const activeCourse = useMemo(
    () => options.find((c) => c.courseId === selectedCourseId) ?? null,
    [options, selectedCourseId],
  );
  const tasks = useMemo(() => activePlan?.tasks ?? [], [activePlan]);
  const goal = goalTouched ? goalDraft : (activePlan?.header.learningGoal ?? '');

  useEffect(() => {
    setGoalTouched(false);
    setGoalDraft('');
  }, [selectedCourseId, activePlan?.header.id]);

  const completed = tasks.filter((t) => t.completed).length;
  const percent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const openTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const busy = saveMutation.isPending || toggleMutation.isPending;

  const persist = async (next: LearningTaskFormValues[], nextGoal: string, success: string) => {
    if (!selectedCourseId) return;
    try {
      await saveMutation.mutateAsync({
        courseId: selectedCourseId,
        learningGoal: nextGoal.trim(),
        tasks: next.map(toServerTask),
      });
      setGoalTouched(false);
      toast.success(success);
    } catch (error) {
      toast.error(apiMessage(error));
    }
  };

  const handleModalSubmit = async (values: LearningTaskFormValues) => {
    const current = tasks.map(toFormTask);
    const next = editingIndex === null ? [...current, values] : current.map((t, i) => (i === editingIndex ? values : t));
    await persist(next, goal, editingIndex === null ? 'Task added' : 'Task updated');
    setModalOpen(false);
    setEditingIndex(null);
  };

  const handleDelete = async () => {
    if (deleteIndex === null) return;
    const next = tasks.map(toFormTask).filter((_, i) => i !== deleteIndex);
    if (next.length === 0) {
      toast.error('A plan needs at least one task. Edit the remaining task instead of deleting it.');
      setDeleteIndex(null);
      return;
    }
    await persist(next, goal, 'Task deleted');
    setDeleteIndex(null);
  };

  const toggle = (taskId: string, nextCompleted: boolean) => {
    if (!activePlan) return;
    toggleMutation.mutate({ planId: activePlan.header.id, taskId, completed: nextCompleted });
  };

  const courseLabel = activeCourse ? `${activeCourse.code} · ${activeCourse.name}` : 'Choose a course';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Student / Learning Plan</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Course Learning Plan</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Pick one of your enrolled courses, break it into tasks with deadlines and resource links, then check them off.
        </p>
      </div>

      {plansQuery.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          <span>Unable to load your learning plans.</span>
          <button
            type="button"
            onClick={() => plansQuery.refetch()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {/* Mobile course picker */}
      <div className="lg:hidden">
        <label htmlFor="learning-plan-course" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]">
          Course
        </label>
        <select
          id="learning-plan-course"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          disabled={coursesQuery.isLoading || options.length === 0}
          className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none focus:border-[#F26F21]"
        >
          {options.map((c) => (
            <option key={c.courseId} value={c.courseId}>
              {c.code} · {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Course list */}
        <section aria-label="Enrolled courses" className="hidden rounded-xl bg-white shadow-sm lg:block">
          <div className="border-b border-[#f1f5f9] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#151c27]">Your courses</h2>
            <p className="mt-0.5 text-[12px] text-[#555f6f]">{options.length > 0 ? `${options.length} enrolled` : 'No courses yet'}</p>
          </div>
          {coursesQuery.isLoading ? (
            <ul className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </ul>
          ) : coursesQuery.isError ? (
            <div className="p-4 text-center">
              <p className="text-[13px] font-semibold text-[#151c27]">Unable to load courses</p>
              <button
                type="button"
                onClick={() => coursesQuery.refetch()}
                className="mt-2 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
              >
                Try again
              </button>
            </div>
          ) : options.length === 0 ? (
            <p className="p-4 text-[13px] text-[#555f6f]">
              No enrolled courses yet. Once your curriculum is assigned, your courses will appear here.
            </p>
          ) : (
            <ul className="max-h-[480px] space-y-1 overflow-y-auto p-2">
              {options.map((course) => {
                const plan = plans.find((p) => p.header.courseId === course.courseId);
                const done = plan?.tasks.filter((t) => t.completed).length ?? 0;
                const total = plan?.tasks.length ?? 0;
                const selected = course.courseId === selectedCourseId;
                return (
                  <li key={course.courseId}>
                    <button
                      type="button"
                      onClick={() => setSelectedCourseId(course.courseId)}
                      aria-current={selected ? 'true' : undefined}
                      className={cn(
                        'block w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                        selected
                          ? 'border-[#F26F21] bg-orange-50/60'
                          : 'border-transparent hover:border-[#e5e7eb] hover:bg-[#f7f8fa]',
                      )}
                    >
                      <p className="text-[13px] font-bold text-[#151c27]">{course.code}</p>
                      <p className="mt-0.5 truncate text-[12px] text-[#555f6f]">{course.name}</p>
                      {plan ? (
                        <p className="mt-1 text-[11px] font-semibold text-[#F26F21]">
                          {done}/{total} completed
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-[#98a2b3]">No plan yet</p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Plan detail */}
        <section aria-label="Learning tasks" className="overflow-hidden rounded-xl bg-white shadow-sm">
          {plansQuery.isLoading || coursesQuery.isLoading ? (
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
                    <p className="mt-0.5 text-[12px] text-[#555f6f] flex items-center gap-1.5">
                      <span>{activeCourse.credits > 0 ? `${activeCourse.credits} credits` : 'Course plan'}</span>
                      {activePlan && (
                        <span className="text-[#98a2b3]">· Version {activePlan.header.version}</span>
                      )}
                    </p>
                  </div>
                  {activePlan && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIndex(null);
                        setModalOpen(true);
                      }}
                      disabled={busy || tasks.length >= 100}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-3 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus className="size-4" />
                      New task
                    </button>
                  )}
                </div>

                {activePlan && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2 text-[12px]">
                      <span className="font-semibold text-[#151c27]">
                        {completed} of {tasks.length} tasks completed
                      </span>
                      <span className="font-bold text-[#F26F21]">{percent}%</span>
                    </div>
                    <div
                      className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progress for ${activeCourse.code}`}
                    >
                      <div
                        className="h-full rounded-full bg-[#F26F21] transition-[width]"
                        style={{ width: `${percent}%` }}
                      />
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
                    onClick={() => {
                      setEditingIndex(null);
                      setModalOpen(true);
                    }}
                    disabled={busy}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:opacity-60"
                  >
                    <Plus className="size-4" />
                    Create first task
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
                        onChange={(e) => {
                          setGoalDraft(e.target.value);
                          setGoalTouched(true);
                        }}
                        placeholder="Example: Master OOP and score 8+ on the final"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] disabled:bg-[#f7f8fa] disabled:opacity-70"
                      />
                      {goalTouched && (
                        <button
                          type="button"
                          disabled={busy || goal.trim() === (activePlan.header.learningGoal ?? '')}
                          onClick={() => persist(tasks.map(toFormTask), goal, 'Learning goal saved')}
                          className="shrink-0 rounded-lg border border-[#F26F21] px-3 py-2 text-[13px] font-bold text-[#F26F21] hover:bg-orange-50 disabled:opacity-50"
                        >
                          {saveMutation.isPending ? 'Saving...' : 'Save goal'}
                        </button>
                      )}
                    </div>
                  </div>

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
                                onToggle={() => toggle(task.id, true)}
                                onEdit={() => {
                                  setEditingIndex(index);
                                  setModalOpen(true);
                                }}
                                onDelete={() => setDeleteIndex(index)}
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
                                onToggle={() => toggle(task.id, false)}
                                onEdit={() => {
                                  setEditingIndex(index);
                                  setModalOpen(true);
                                }}
                                onDelete={() => setDeleteIndex(index)}
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
              )}
            </>
          )}
        </section>
      </div>

      <TaskFormModal
        open={modalOpen}
        initial={editingIndex === null ? null : toFormTask(tasks[editingIndex])}
        courseLabel={courseLabel}
        saving={saveMutation.isPending}
        onClose={() => {
          setModalOpen(false);
          setEditingIndex(null);
        }}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        open={deleteIndex !== null}
        title="Delete this task?"
        message={
          deleteIndex !== null && tasks[deleteIndex]
            ? `"${tasks[deleteIndex].title}" will be removed from this plan. This saves a new plan version immediately.`
            : 'This task will be removed from this plan.'
        }
        confirmLabel="Delete task"
        destructive
        isLoading={saveMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteIndex(null)}
      />
    </div>
  );
}
