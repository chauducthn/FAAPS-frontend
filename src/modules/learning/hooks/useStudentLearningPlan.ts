// State and mutation orchestration hook for StudentLearningPlan.

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { apiMessage } from '../../../shared/lib/apiMessage';
import {
  useCourseLearningPlans,
  usePlanCourseOptions,
  useSaveCoursePlan,
  useToggleLearningTask,
} from './queries/useLearningPlanQueries';
import type { LearningTask } from '../../academic/services/studentAcademicService';
import type { LearningTaskFormValues } from '../validations/learningPlan.schema';

const toServerTask = (task: LearningTaskFormValues): LearningTask => ({
  title: task.title.trim(),
  description: task.description?.trim() ? task.description.trim() : null,
  dueDate: task.dueDate ? task.dueDate : null,
  resourceUrl: task.resourceUrl?.trim() ? task.resourceUrl.trim() : null,
});

export const toFormTask = (task: LearningTask): LearningTaskFormValues => ({
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

export function useStudentLearningPlan() {
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

  return {
    plansQuery,
    coursesQuery,
    saveMutation,
    plans,
    options,
    today,
    selectedCourseId,
    setSelectedCourseId,
    activePlan,
    activeCourse,
    tasks,
    goal,
    goalTouched,
    setGoalDraft,
    setGoalTouched,
    completed,
    percent,
    openTasks,
    doneTasks,
    busy,
    modalOpen,
    setModalOpen,
    editingIndex,
    setEditingIndex,
    deleteIndex,
    setDeleteIndex,
    persist,
    handleModalSubmit,
    handleDelete,
    toggle,
  };
}
