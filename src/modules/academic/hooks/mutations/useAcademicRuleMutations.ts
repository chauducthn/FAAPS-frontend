// src/hooks/mutations/useAcademicRuleMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academicRuleService } from '../../../management/services/academic-rule.service';
import type {
  AcademicRuleStatus,
  CreateAcademicRuleDto,
  ToggleAcademicRuleStatusDto,
  UpdateAcademicRuleDto,
} from '../../types/academic-rule';
import { ACADEMIC_RULE_QUERY_KEYS } from '../queries/useAcademicRulesQuery';

export const useAcademicRuleMutations = () => {
  const qc = useQueryClient();
  const invalidate = (id?: string) => {
    qc.invalidateQueries({ queryKey: ACADEMIC_RULE_QUERY_KEYS.all });
    if (id) qc.invalidateQueries({ queryKey: ACADEMIC_RULE_QUERY_KEYS.detail(id) });
  };

  const create = useMutation({
    mutationFn: (body: CreateAcademicRuleDto) => academicRuleService.create(body),
    onSuccess: () => {
      toast.success('Academic rule created as DRAFT');
      invalidate();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not create rule'),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAcademicRuleDto }) =>
      academicRuleService.update(id, body),
    onSuccess: (_data, vars) => {
      toast.success('Academic rule updated');
      invalidate(vars.id);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not update rule'),
  });

  const toggle = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ToggleAcademicRuleStatusDto }) =>
      academicRuleService.toggle(id, body),
    onSuccess: (_data, vars) => {
      toast.success(`Rule ${vars.body.isActive ? 'published (ACTIVE)' : 'archived (INACTIVE)'}`);
      invalidate(vars.id);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not change status'),
  });

  /** Publish (DRAFT/INACTIVE -> ACTIVE) và Archive (ACTIVE -> INACTIVE). */
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AcademicRuleStatus }) =>
      academicRuleService.updateStatus(id, status),
    onSuccess: (rule) => {
      if (rule.status === 'ACTIVE') toast.success(`Published ${rule.policyType} — now ACTIVE & read-only`);
      else if (rule.status === 'INACTIVE') toast.success(`Archived ${rule.policyType} — now INACTIVE`);
      else toast.success('Rule moved back to DRAFT');
      invalidate(rule.id);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not change status'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => academicRuleService.remove(id),
    onSuccess: () => {
      toast.success('Academic rule deleted');
      invalidate();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not delete rule'),
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    toggle: toggle.mutateAsync,
    isToggling: toggle.isPending,
    publish: (id: string) => updateStatus.mutateAsync({ id, status: 'ACTIVE' }),
    archive: (id: string) => updateStatus.mutateAsync({ id, status: 'INACTIVE' }),
    reopen: (id: string) => updateStatus.mutateAsync({ id, status: 'DRAFT' }),
    isChangingStatus: updateStatus.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
};
