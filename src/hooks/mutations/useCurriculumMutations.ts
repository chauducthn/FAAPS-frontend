// src/hooks/mutations/useCurriculumMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { curriculumService } from '../../services/admin/curriculum.service';
import type {
  AddCurriculumCourseDto,
  CreateCurriculumDto,
  CurriculumBulkRequest,
  UpdateCurriculumCourseDto,
  UpdateCurriculumDto,
} from '../../types/curriculum';
import { CURRICULUM_QUERY_KEYS } from '../queries/useCurriculumsQuery';

export const useCurriculumMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CreateCurriculumDto) => curriculumService.create(body),
    onSuccess: (created) => {
      toast.success('Curriculum created', { description: created.name });
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCurriculumDto }) =>
      curriculumService.update(id, body),
    onSuccess: () => {
      toast.success('Curriculum updated');
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
    },
  });

  const publish = useMutation({
    mutationFn: (id: string) => curriculumService.publish(id),
    onSuccess: () => {
      toast.success('Curriculum published');
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
    },
  });

  const archive = useMutation({
    mutationFn: (id: string) => curriculumService.archive(id),
    onSuccess: () => {
      toast.success('Curriculum archived');
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => curriculumService.remove(id),
    onSuccess: () => {
      toast.success('Curriculum deleted');
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
    },
  });

  const addCourse = useMutation({
    mutationFn: ({ curriculumId, body }: { curriculumId: string; body: AddCurriculumCourseDto }) =>
      curriculumService.addCourse(curriculumId, body),
    onSuccess: (_data, vars) => {
      toast.success('Course added to curriculum');
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.detail(vars.curriculumId) });
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
    },
  });

  const updateCourse = useMutation({
    mutationFn: ({
      curriculumId,
      curriculumCourseId,
      body,
    }: {
      curriculumId: string;
      curriculumCourseId: string;
      body: UpdateCurriculumCourseDto;
    }) => curriculumService.updateCourse(curriculumId, curriculumCourseId, body),
    onSuccess: (_data, vars) => {
      toast.success('Curriculum course updated');
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.detail(vars.curriculumId) });
    },
  });

  const removeCourse = useMutation({
    mutationFn: ({
      curriculumId,
      curriculumCourseId,
    }: {
      curriculumId: string;
      curriculumCourseId: string;
    }) => curriculumService.removeCourse(curriculumId, curriculumCourseId),
    onSuccess: (_data, vars) => {
      toast.success('Course removed from curriculum');
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.detail(vars.curriculumId) });
    },
  });

  const bulk = useMutation({
    mutationFn: (body: CurriculumBulkRequest) => curriculumService.bulk(body),
    onSuccess: (result) => {
      toast.success(`Bulk action completed`, {
        description: `${result.affected} curriculum(s) updated.`,
      });
      qc.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
    },
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    publish: publish.mutateAsync,
    isPublishing: publish.isPending,
    archive: archive.mutateAsync,
    isArchiving: archive.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
    addCourse: addCourse.mutateAsync,
    isAddingCourse: addCourse.isPending,
    updateCourse: updateCourse.mutateAsync,
    isUpdatingCourse: updateCourse.isPending,
    removeCourse: removeCourse.mutateAsync,
    isRemovingCourse: removeCourse.isPending,
    bulk: bulk.mutateAsync,
    isBulk: bulk.isPending,
  };
};