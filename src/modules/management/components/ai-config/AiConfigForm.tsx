// AI Configuration modal — create, edit, and read-only view modes.
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cpu, SpinnerGap as Loader2 } from '@phosphor-icons/react';
import { InlineAlert } from '../../../../shared/components/ui/InlineAlert';
import { Modal } from '../../../../shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../../shared/components/ui/ModalParts';
import { createAiConfigSchema, type CreateAiConfigFormValues } from '../../../ai/validations/ai-config.schema';
import type { AiConfig, AiPreset } from '../../../ai/types/ai-config';
import { StatusBadge } from '../StatusBadge';
import { AiConfigLimitsSection } from './AiConfigLimitsSection';
import { AiConfigIdentitySection, AiConfigPromptAndStatus, AiConfigSecretSection } from './AiConfigTextSections';

interface Props {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  initial?: AiConfig | null;
  preset?: AiPreset | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAiConfigFormValues, apiKey?: string) => void;
}

const DEFAULT_VALUES: CreateAiConfigFormValues = {
  name: '',
  provider: 'GEMINI',
  modelName: 'gemini-2.0-flash',
  purpose: 'CHAT',
  temperature: 0.4,
  maxTokens: 4096,
  retrievalTopK: 6,
  similarityThreshold: 0.72,
  timeoutSeconds: 30,
  dailyRequestLimit: 5000,
  systemPrompt: '',
  fallbackMessage: '',
  isActive: true,
};

export default function AiConfigForm({ open, mode, initial, preset, isLoading, onClose, onSubmit }: Props) {
  const isCreate = mode === 'create';
  const readOnly = mode === 'view';
  const disabled = readOnly || !!isLoading;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAiConfigFormValues>({
    resolver: zodResolver(createAiConfigSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const purpose = watch('purpose');
  const provider = watch('provider');
  const temperature = watch('temperature');
  const approvalActive = watch('isActive');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (!open) return;
    setApiKey('');
    if (initial) {
      reset({
        name: initial.name,
        provider: initial.provider,
        modelName: initial.modelName,
        purpose: initial.purpose,
        temperature: initial.temperature,
        maxTokens: initial.maxTokens,
        retrievalTopK: initial.retrievalTopK,
        similarityThreshold: initial.similarityThreshold,
        timeoutSeconds: initial.timeoutSeconds,
        dailyRequestLimit: initial.dailyRequestLimit,
        systemPrompt: initial.systemPrompt ?? '',
        fallbackMessage: initial.fallbackMessage ?? '',
        isActive: initial.isActive,
      });
    } else if (preset) {
      reset({
        name: '',
        provider: preset.provider,
        modelName: preset.modelName,
        purpose: preset.purpose,
        temperature: preset.config.temperature,
        maxTokens: preset.config.maxTokens,
        retrievalTopK: preset.config.retrievalTopK,
        similarityThreshold: preset.config.similarityThreshold,
        timeoutSeconds: preset.config.timeoutSeconds,
        dailyRequestLimit: preset.config.dailyRequestLimit,
        systemPrompt: preset.config.systemPrompt ?? '',
        fallbackMessage: preset.config.fallbackMessage ?? '',
        isActive: true,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [open, initial, preset, reset]);

  const title = isCreate
    ? 'New AI configuration'
    : readOnly
      ? (initial?.name ?? 'Configuration')
      : `Edit ${initial?.name ?? 'configuration'}`;

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-3xl">
      <form noValidate onSubmit={handleSubmit((vals) => onSubmit(vals, apiKey.trim() || undefined))} className="flex min-h-0 flex-col">
        <ModalHeader
          icon={<Cpu aria-hidden />}
          tone={readOnly ? 'neutral' : 'brand'}
          title={title}
          description={
            isCreate
              ? 'Define the model, limits and prompt — numbers reject letters and negatives.'
              : readOnly
                ? 'Read-only view of this configuration.'
                : 'Changes apply to subsequent requests.'
          }
          actions={
            initial ? (
              <StatusBadge status={initial.isActive ? 'ACTIVE' : 'INACTIVE'} />
            ) : isCreate ? (
              <span className="rounded-sm bg-brand-soft px-2 py-0.5 text-[11px] font-semibold uppercase text-brand-ink">
                New
              </span>
            ) : undefined
          }
          onClose={onClose}
        />

        <ModalBody className="max-h-[68vh] space-y-4 bg-surface-page/50 text-[13px]">
          {preset && isCreate && (
            <InlineAlert tone="info">
              <span className="text-xs">
                Prefilled from preset <strong className="font-semibold">{preset.label}</strong> — review before creating.
              </span>
            </InlineAlert>
          )}

          <AiConfigIdentitySection disabled={disabled} register={register} errors={errors} />
          <AiConfigLimitsSection
            purpose={purpose}
            temperature={temperature}
            disabled={disabled}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
          <AiConfigPromptAndStatus
            disabled={disabled}
            approvalActive={!!approvalActive}
            register={register}
            setValue={setValue}
            errors={errors}
          />
          <AiConfigSecretSection
            provider={provider}
            initial={initial}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            readOnly={readOnly}
            disabled={disabled}
          />
        </ModalBody>

        <ModalFooter>
          <button type="button" onClick={onClose} className={modalButtonClass('secondary')}>
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button type="submit" disabled={isLoading} className={modalButtonClass('primary')}>
              {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {isCreate ? 'Create configuration' : 'Save changes'}
            </button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  );
}
