// src/hooks/mutations/useAiConfigMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiConfigService } from '../../../management/services/ai-config.service';
import type {
  AiConfigSecretDto,
  CreateAiConfigDto,
  UpdateAiConfigDto,
} from '../../types/ai-config';
import { AI_CONFIG_QUERY_KEYS } from '../queries/useAiConfigQuery';

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error ? e.message : fallback;

export const useAiConfigMutations = () => {
  const qc = useQueryClient();
  const invalidate = (id?: string) => {
    qc.invalidateQueries({ queryKey: AI_CONFIG_QUERY_KEYS.all });
    if (id) qc.invalidateQueries({ queryKey: AI_CONFIG_QUERY_KEYS.detail(id) });
  };

  const create = useMutation({
    mutationFn: (body: CreateAiConfigDto) => aiConfigService.create(body),
    onSuccess: (created) => {
      toast.success('AI configuration created', { description: created.name });
      invalidate();
    },
    onError: (e: unknown) => toast.error(errMsg(e, 'Could not create configuration')),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAiConfigDto }) =>
      aiConfigService.update(id, body),
    onSuccess: (_data, vars) => {
      toast.success('AI configuration updated');
      invalidate(vars.id);
    },
    onError: (e: unknown) => toast.error(errMsg(e, 'Could not update configuration')),
  });

  const setSecret = useMutation({
    mutationFn: ({ id, body }: { id: string; body: AiConfigSecretDto }) =>
      aiConfigService.setSecret(id, body),
    onSuccess: (_data, vars) => {
      toast.success('API key saved securely');
      invalidate(vars.id);
    },
    onError: (e: unknown) => toast.error(errMsg(e, 'Could not save API key')),
  });

  const testConnection = useMutation({
    mutationFn: (id: string) => aiConfigService.testConnection(id),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(`${res.provider} · ${res.modelName} connected (${res.latencyMs}ms)`, {
          description: res.replyPreview ?? undefined,
        });
      } else {
        toast.error(`${res.provider} connection failed (${res.latencyMs}ms)`, {
          description: res.error ?? 'Check your API key and model name.',
        });
      }
      qc.invalidateQueries({ queryKey: AI_CONFIG_QUERY_KEYS.all });
    },
    onError: (e: unknown) => toast.error(errMsg(e, 'Connection test failed')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => aiConfigService.remove(id),
    onSuccess: () => {
      toast.success('AI configuration deleted');
      invalidate();
    },
    onError: (e: unknown) => toast.error(errMsg(e, 'Could not delete configuration')),
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    setSecret: setSecret.mutateAsync,
    isSettingSecret: setSecret.isPending,
    testConnection: testConnection.mutateAsync,
    isTesting: testConnection.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
};
