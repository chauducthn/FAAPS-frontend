// src/hooks/mutations/useCurriculumMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toastBadRequest } from '../../lib/apiError';
import { cohortService } from '../../services/management/cohort.service';
import { curriculumService } from '../../services/management/curriculum.service';
import type { AddCurriculumCoursesInput, CurriculumInput, CurriculumStatus } from '../../types/curriculum';
import { CURRICULUM_QUERY_KEYS, serviceFor, type CurriculumKind } from '../queries/useCurriculumsQuery';

export const useCurriculumMutations = (kind: CurriculumKind) => {
  const qc = useQueryClient();
  const noun = kind === 'cohort' ? 'Cohort' : 'Curriculum';
  const refresh = () => qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });

  const create = useMutation({
    onError: toastBadRequest,
    mutationFn: (body: CurriculumInput) => serviceFor(kind).create(body),
    onSuccess: (created) => {
      toast.success(`${noun} created`, { description: `${created.majorCode} ${created.version} - ${created.name}` });
      refresh();
    },
  });

  const update = useMutation({
    onError: toastBadRequest,
    mutationFn: ({ id, body }: { id: string; body: CurriculumInput }) => serviceFor(kind).update(id, body),
    onSuccess: () => {
      toast.success(`${noun} updated`);
      refresh();
    },
  });

  const remove = useMutation({
    onError: toastBadRequest,
    mutationFn: (id: string) => serviceFor(kind).remove(id),
    onSuccess: () => {
      toast.success(`${noun} deleted`);
      refresh();
    },
  });

  const updateStatus = useMutation({
    onError: toastBadRequest,
    mutationFn: ({ id, status }: { id: string; status: CurriculumStatus }) =>
      (kind === 'cohort' ? cohortService : curriculumService).updateStatus(id, status),
    onSuccess: (_data, vars) => {
      toast.success(vars.status === 'ACTIVE' ? `${noun} activated` : `${noun} deactivated`);
      refresh();
    },
  });

  const addCourses = useMutation({
    onError: toastBadRequest,
    mutationFn: ({ id, body }: { id: string; body: AddCurriculumCoursesInput }) => curriculumService.addCourses(id, body),
    onSuccess: (added) => {
      toast.success(`Added ${added.length} course${added.length === 1 ? '' : 's'} to the curriculum`);
      refresh();
    },
  });
  const updateCourse = useMutation({
    onError: toastBadRequest,
    mutationFn: ({ id, courseId, semesterNumber, isMandatory }: { id: string; courseId: string; semesterNumber: number; isMandatory: boolean }) =>
      curriculumService.updateCourse(id, courseId, { semesterNumber, isMandatory }),
    onSuccess: () => { toast.success('Course placement updated'); refresh(); },
  });
  const removeCourse = useMutation({
    onError: toastBadRequest,
    mutationFn: ({ id, courseId }: { id: string; courseId: string }) => curriculumService.removeCourse(id, courseId),
    onSuccess: () => { toast.success('Course removed from curriculum'); refresh(); },
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
    updateStatus: updateStatus.mutateAsync,
    isUpdatingStatus: updateStatus.isPending,
    addCourses: addCourses.mutateAsync,
    isAddingCourses: addCourses.isPending,
    updateCourse: updateCourse.mutateAsync,
    removeCourse: removeCourse.mutateAsync,
    isUpdatingCourse: updateCourse.isPending || removeCourse.isPending,
  };
};
