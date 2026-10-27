// src/hooks/mutations/useAcademicRuleMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academicRuleService } from '../../services/management/academic-rule.service';
import type {
  CreateAcademicRuleDto,
  ToggleAcademicRuleStatusDto,
  UpdateAcademicRuleDto,
} from '../../types/academic-rule';
import { ACADEMIC_RULE_QUERY_KEYS } from '../queries/useAcademicRulesQuery';

export const useAcademicRuleMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CreateAcademicRuleDto) => academicRuleService.create(body),
    onSuccess: () => {
      toast.success('Academic rule created');
      qc.invalidateQueries({ queryKey: ACADEMIC_RULE_QUERY_KEYS.all });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAcademicRuleDto }) =>
      academicRuleService.update(id, body),
    onSuccess: (_data, vars) => {
      toast.success('Academic rule updated');
      qc.invalidateQueries({ queryKey: ACADEMIC_RULE_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: ACADEMIC_RULE_QUERY_KEYS.detail(vars.id) });
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ToggleAcademicRuleStatusDto }) =>
      academicRuleService.toggle(id, body),
    onSuccess: (_data, vars) => {
      toast.success(`Rule ${vars.body.isActive ? 'activated' : 'deactivated'}`);
      qc.invalidateQueries({ queryKey: ACADEMIC_RULE_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: ACADEMIC_RULE_QUERY_KEYS.detail(vars.id) });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => academicRuleService.remove(id),
    onSuccess: () => {
      toast.success('Academic rule deleted');
      qc.invalidateQueries({ queryKey: ACADEMIC_RULE_QUERY_KEYS.all });
    },
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    toggle: toggle.mutateAsync,
    isToggling: toggle.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
};