// src/hooks/mutations/useCohortMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cohortService } from '../../services/admin/cohort.service';
import type { CreateCohortDto, UpdateCohortDto } from '../../types/cohort';
import { COHORT_QUERY_KEYS } from '../queries/useCohortsQuery';

export const useCohortMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CreateCohortDto) => cohortService.create(body),
    onSuccess: (created) => {
      toast.success('Cohort created', { description: `${created.code} - ${created.name}` });
      qc.invalidateQueries({ queryKey: COHORT_QUERY_KEYS.all });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCohortDto }) =>
      cohortService.update(id, body),
    onSuccess: () => {
      toast.success('Cohort updated');
      qc.invalidateQueries({ queryKey: COHORT_QUERY_KEYS.all });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => cohortService.remove(id),
    onSuccess: () => {
      toast.success('Cohort deleted');
      qc.invalidateQueries({ queryKey: COHORT_QUERY_KEYS.all });
    },
  });

  const attachMajor = useMutation({
    mutationFn: ({ cohortId, majorId }: { cohortId: string; majorId: string }) =>
      cohortService.attachMajor(cohortId, majorId),
    onSuccess: (_data, vars) => {
      toast.success('Major attached to cohort');
      qc.invalidateQueries({ queryKey: COHORT_QUERY_KEYS.majors(vars.cohortId) });
      qc.invalidateQueries({ queryKey: COHORT_QUERY_KEYS.all });
    },
  });

  const detachMajor = useMutation({
    mutationFn: ({ cohortId, majorId }: { cohortId: string; majorId: string }) =>
      cohortService.detachMajor(cohortId, majorId),
    onSuccess: (_data, vars) => {
      toast.success('Major detached from cohort');
      qc.invalidateQueries({ queryKey: COHORT_QUERY_KEYS.majors(vars.cohortId) });
      qc.invalidateQueries({ queryKey: COHORT_QUERY_KEYS.all });
    },
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
    attachMajor: attachMajor.mutateAsync,
    isAttaching: attachMajor.isPending,
    detachMajor: detachMajor.mutateAsync,
    isDetaching: detachMajor.isPending,
  };
};