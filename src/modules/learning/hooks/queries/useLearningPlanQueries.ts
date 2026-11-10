// React Query access for the Course Learning Plan screen, backed by the real student API.
// Saving always writes a new plan version; toggling a checkbox PATCHes that single task.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  studentAcademicService,
  type CoursePlan,
  type LearningTask,
} from '../../../academic/services/studentAcademicService';
import { apiMessage } from '../../../../shared/lib/apiMessage';

export const LEARNING_PLAN_KEYS = {
  plans: ['student', 'course-plans'],
  courses: ['student', 'curriculum-courses'],
  versions: ['student', 'course-plan-versions'],
} as const;

export const useCourseLearningPlans = () =>
  useQuery({ queryKey: LEARNING_PLAN_KEYS.plans, queryFn: studentAcademicService.coursePlans });

export const usePlanCourseOptions = () =>
  useQuery({
    queryKey: LEARNING_PLAN_KEYS.courses,
    queryFn: studentAcademicService.curriculumCourses,
    retry: false,
  });

type SaveCoursePlanBody = { courseId: string; learningGoal: string; tasks: LearningTask[] };

export function useSaveCoursePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveCoursePlanBody) => studentAcademicService.saveCoursePlan(body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LEARNING_PLAN_KEYS.plans }),
        queryClient.invalidateQueries({ queryKey: LEARNING_PLAN_KEYS.versions }),
      ]);
    },
    onError: (error) => {
      toast.error(apiMessage(error));
    },
  });
}

type ToggleTaskVars = { planId: string; taskId: string; completed: boolean };

export function useToggleLearningTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: ToggleTaskVars) =>
      studentAcademicService.updateTask(vars.planId, vars.taskId, vars.completed),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: LEARNING_PLAN_KEYS.plans });
      const previous = queryClient.getQueryData<CoursePlan[]>(LEARNING_PLAN_KEYS.plans);
      queryClient.setQueryData<CoursePlan[]>(LEARNING_PLAN_KEYS.plans, (old) =>
        old?.map((plan) =>
          plan.header.id === vars.planId
            ? {
                ...plan,
                tasks: plan.tasks.map((task) =>
                  task.id === vars.taskId ? { ...task, completed: vars.completed } : task,
                ),
              }
            : plan,
        ),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(LEARNING_PLAN_KEYS.plans, context.previous);
      toast.error(apiMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_PLAN_KEYS.plans });
    },
  });
}
