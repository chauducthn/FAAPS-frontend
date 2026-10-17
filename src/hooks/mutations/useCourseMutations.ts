// src/hooks/mutations/useCourseMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { courseService } from '../../services/admin/course.service';
import type {
  AddCourseRelationDto,
  CreateCourseDto,
  UpdateCourseDto,
  UpdateCourseRelationDto,
} from '../../types/course';
import { COURSE_QUERY_KEYS } from '../queries/useCoursesQuery';

export const useCourseMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CreateCourseDto) => courseService.create(body),
    onSuccess: (created) => {
      toast.success('Course created', { description: `${created.code} - ${created.name}` });
      qc.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCourseDto }) =>
      courseService.update(id, body),
    onSuccess: (_data, vars) => {
      toast.success('Course updated');
      qc.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.detail(vars.id) });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => courseService.remove(id),
    onSuccess: () => {
      toast.success('Course deleted');
      qc.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
  });

  const addRelation = useMutation({
    mutationFn: ({ courseId, body }: { courseId: string; body: AddCourseRelationDto }) =>
      courseService.addRelation(courseId, body),
    onSuccess: (_data, vars) => {
      toast.success('Relation added');
      qc.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.detail(vars.courseId) });
    },
  });

  const updateRelation = useMutation({
    mutationFn: ({
      courseId,
      relationId,
      body,
    }: {
      courseId: string;
      relationId: string;
      body: UpdateCourseRelationDto;
    }) => courseService.updateRelation(courseId, relationId, body),
    onSuccess: (_data, vars) => {
      toast.success('Relation updated');
      qc.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.detail(vars.courseId) });
    },
  });

  const removeRelation = useMutation({
    mutationFn: ({ courseId, relationId }: { courseId: string; relationId: string }) =>
      courseService.removeRelation(courseId, relationId),
    onSuccess: (_data, vars) => {
      toast.success('Relation removed');
      qc.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.detail(vars.courseId) });
    },
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
    addRelation: addRelation.mutateAsync,
    isAddingRelation: addRelation.isPending,
    updateRelation: updateRelation.mutateAsync,
    isUpdatingRelation: updateRelation.isPending,
    removeRelation: removeRelation.mutateAsync,
    isRemovingRelation: removeRelation.isPending,
  };
};