// src/hooks/mutations/useAiConfigMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiConfigService } from '../../services/admin/ai-config.service';
import type {
  AiConfigSecretDto,
  CreateAiConfigDto,
  UpdateAiConfigDto,
} from '../../types/ai-config';
import { AI_CONFIG_QUERY_KEYS } from '../queries/useAiConfigQuery';

export const useAiConfigMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CreateAiConfigDto) => aiConfigService.create(body),
    onSuccess: (created) => {
      toast.success('AI configuration created', { description: created.name });
      qc.invalidateQueries({ queryKey: AI_CONFIG_QUERY_KEYS.all });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAiConfigDto }) =>
      aiConfigService.update(id, body),
    onSuccess: (_data, vars) => {
      toast.success('AI configuration updated');
      qc.invalidateQueries({ queryKey: AI_CONFIG_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: AI_CONFIG_QUERY_KEYS.detail(vars.id) });
    },
  });

  const setSecret = useMutation({
    mutationFn: ({ id, body }: { id: string; body: AiConfigSecretDto }) =>
      aiConfigService.setSecret(id, body),
    onSuccess: () => {
      toast.success('API key saved');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => aiConfigService.remove(id),
    onSuccess: () => {
      toast.success('AI configuration deleted');
      qc.invalidateQueries({ queryKey: AI_CONFIG_QUERY_KEYS.all });
    },
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    setSecret: setSecret.mutateAsync,
    isSettingSecret: setSecret.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
};