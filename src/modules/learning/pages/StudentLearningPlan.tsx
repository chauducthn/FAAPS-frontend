// Student / Course Learning Plan: pick an enrolled course and manage its learning tasks.

import { ConfirmDialog } from '../../management/components/ConfirmDialog';
import { TaskFormModal } from '../components/learning-plan/TaskFormModal';
import {
  LearningPlanCourseSidebar,
  LearningPlanMobilePicker,
} from '../components/learning-plan/LearningPlanCourseSidebar';
import { LearningPlanTaskBoard } from '../components/learning-plan/LearningPlanTaskBoard';
import { toFormTask, useStudentLearningPlan } from '../hooks/useStudentLearningPlan';

export default function StudentLearningPlan() {
  const lp = useStudentLearningPlan();
  const courseLabel = lp.activeCourse
    ? `${lp.activeCourse.code} · ${lp.activeCourse.name}`
    : 'Choose a course';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Student / Learning Plan</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Course Learning Plan</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Pick one of your enrolled courses, break it into tasks with deadlines and resource links, then check them off.
        </p>
      </div>

      {lp.plansQuery.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          <span>Unable to load your learning plans.</span>
          <button
            type="button"
            onClick={() => lp.plansQuery.refetch()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      <LearningPlanMobilePicker
        options={lp.options}
        selectedCourseId={lp.selectedCourseId}
        disabled={lp.coursesQuery.isLoading || lp.options.length === 0}
        onSelect={lp.setSelectedCourseId}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <LearningPlanCourseSidebar
          options={lp.options}
          plans={lp.plans}
          selectedCourseId={lp.selectedCourseId}
          isLoading={lp.coursesQuery.isLoading}
          isError={lp.coursesQuery.isError}
          onSelect={lp.setSelectedCourseId}
          onRetry={() => lp.coursesQuery.refetch()}
        />

        <LearningPlanTaskBoard
          isLoading={lp.plansQuery.isLoading || lp.coursesQuery.isLoading}
          activeCourse={lp.activeCourse}
          activePlan={lp.activePlan}
          tasks={lp.tasks}
          openTasks={lp.openTasks}
          doneTasks={lp.doneTasks}
          completed={lp.completed}
          percent={lp.percent}
          goal={lp.goal}
          goalTouched={lp.goalTouched}
          today={lp.today}
          busy={lp.busy}
          savingGoal={lp.saveMutation.isPending}
          onNewTask={() => {
            lp.setEditingIndex(null);
            lp.setModalOpen(true);
          }}
          onGoalChange={(value) => {
            lp.setGoalDraft(value);
            lp.setGoalTouched(true);
          }}
          onSaveGoal={() => lp.persist(lp.tasks.map(toFormTask), lp.goal, 'Learning goal saved')}
          onToggleTask={lp.toggle}
          onEditTask={(index) => {
            lp.setEditingIndex(index);
            lp.setModalOpen(true);
          }}
          onDeleteTask={lp.setDeleteIndex}
        />
      </div>

      <TaskFormModal
        open={lp.modalOpen}
        initial={lp.editingIndex === null ? null : toFormTask(lp.tasks[lp.editingIndex])}
        courseLabel={courseLabel}
        saving={lp.saveMutation.isPending}
        onClose={() => {
          lp.setModalOpen(false);
          lp.setEditingIndex(null);
        }}
        onSubmit={lp.handleModalSubmit}
      />

      <ConfirmDialog
        open={lp.deleteIndex !== null}
        title="Delete this task?"
        message={
          lp.deleteIndex !== null && lp.tasks[lp.deleteIndex]
            ? `"${lp.tasks[lp.deleteIndex].title}" will be removed from this plan. This saves a new plan version immediately.`
            : 'This task will be removed from this plan.'
        }
        confirmLabel="Delete task"
        destructive
        isLoading={lp.saveMutation.isPending}
        onConfirm={lp.handleDelete}
        onCancel={() => lp.setDeleteIndex(null)}
      />
    </div>
  );
}
