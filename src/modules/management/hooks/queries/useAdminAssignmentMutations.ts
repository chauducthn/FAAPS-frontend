import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '../../../advising/services/assignmentService';

const KEY = ['admin', 'assignments'] as const;

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    qc.invalidateQueries({ queryKey: ['admin', 'appointments'] });
  };
};

export const usePreviewAssign = () =>
  useMutation({
    mutationFn: (input: { studentIds: string[]; advisorId: string }) =>
      assignmentService.previewAssign(input.studentIds, input.advisorId),
  });

export const useAssignStudents = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { studentIds: string[]; advisorId: string; acknowledge: boolean; notes?: string }) =>
      assignmentService.assign(input.studentIds, input.advisorId, input.acknowledge, input.notes),
    onSuccess: invalidate,
  });
};

export const usePreviewUnassign = () =>
  useMutation({ mutationFn: (studentIds: string[]) => assignmentService.previewUnassign(studentIds) });

export const useUnassignStudents = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { studentIds: string[]; acknowledge: boolean; notes?: string }) =>
      assignmentService.unassign(input.studentIds, input.acknowledge, input.notes),
    onSuccess: invalidate,
  });
};

export const usePreviewCohortAssign = () =>
  useMutation({
    mutationFn: (input: { cohortId: string; advisorId: string }) =>
      assignmentService.previewCohortAssign(input.cohortId, input.advisorId),
  });

export const useAssignCohort = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortId: string; advisorId: string; notes?: string }) =>
      assignmentService.assignCohort(input.cohortId, input.advisorId, input.notes),
    onSuccess: invalidate,
  });
};

export const usePreviewAutoAssign = () =>
  useMutation({
    mutationFn: (input: { cohortId: string; advisorIds?: string[]; allowOverLimit?: boolean }) =>
      assignmentService.previewAutoAssign(input.cohortId, input.advisorIds, input.allowOverLimit),
  });

export const useConfirmAutoAssign = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortId: string; advisorIds?: string[]; notes?: string; allowOverLimit?: boolean }) =>
      assignmentService.confirmAutoAssign(input.cohortId, input.advisorIds, input.notes, input.allowOverLimit),
    onSuccess: invalidate,
  });
};

export const useSmartAutoAssignAll = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortIds?: string[]; autoConfigurePools?: boolean; allowOverLimit?: boolean; notes?: string }) =>
      assignmentService.smartAutoAssignAll(input),
    onSuccess: invalidate,
  });
};

export const useUnassignAll = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { advisorIds?: string[]; clearPools?: boolean; notes?: string }) =>
      assignmentService.unassignAll(input),
    onSuccess: invalidate,
  });
};

export const useAutoAssignStudents = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { students: { id: string; cohortId: string }[] }) =>
      assignmentService.autoAssignStudents(input.students),
    onSettled: invalidate,
  });
};

export const useReplaceCohortPool = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortId: string; advisorIds: string[] }) =>
      assignmentService.replaceCohortPool(input.cohortId, input.advisorIds),
    onSuccess: invalidate,
  });
};

export const useReplaceAdvisorCohorts = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { advisorId: string; cohortIds: string[] }) =>
      assignmentService.replaceAdvisorCohorts(input.advisorId, input.cohortIds),
    onSuccess: invalidate,
  });
};

export const useBulkAssignAdvisorCohorts = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { advisorIds: string[]; cohortIds: string[] }) =>
      assignmentService.bulkAssignAdvisorCohorts(input.advisorIds, input.cohortIds),
    onSuccess: invalidate,
  });
};

export const useAutoAssignAdvisorCohorts = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { advisorIds: string[] }) => assignmentService.autoAssignAdvisorCohorts(input.advisorIds),
    onSuccess: invalidate,
  });
};

export const useUpdateAdvisorLimit = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { advisorId: string; maxAdvisees: number }) =>
      assignmentService.updateLimit(input.advisorId, input.maxAdvisees),
    onSuccess: invalidate,
  });
};
