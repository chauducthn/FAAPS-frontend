// AI Configuration form — orange header, sectioned layout, strict numeric validation, read-only view mode.
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cpu, SpinnerGap as Loader2, X } from '@phosphor-icons/react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import { createAiConfigSchema, type CreateAiConfigFormValues } from '../../../ai/validations/ai-config.schema';
import type { AiConfig, AiPreset } from '../../../ai/types/ai-config';
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
        <div className="flex items-start justify-between gap-4 border-b border-line-soft bg-[var(--brand-soft)] px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
              <Cpu className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-ink-primary">{title}</h2>
                {initial && (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em]',
                      initial.isActive ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-line-soft text-ink-muted',
                    )}
                  >
                    {initial.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
                {isCreate && (
                  <span className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em] text-brand-ink ring-1 ring-brand/30">
                    New
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                {isCreate
                  ? 'Define the model, limits and prompt — numbers reject letters and negatives.'
                  : readOnly
                    ? 'Read-only view of this configuration.'
                    : 'Changes apply to subsequent requests.'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-ink-subtle transition-colors hover:bg-line-soft hover:text-ink-secondary">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-6 text-[13px]">
          {preset && isCreate && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-brand/30 bg-brand-soft px-4 py-3">
              <p className="text-xs text-brand-ink">
                Prefilled from preset <span className="font-bold">{preset.label}</span> — review before creating.
              </p>
            </div>
          )}

          <AiConfigIdentitySection disabled={disabled} register={register} errors={errors} />
          <AiConfigLimitsSection purpose={purpose} temperature={temperature} disabled={disabled} register={register} watch={watch} setValue={setValue} errors={errors} />
          <AiConfigPromptAndStatus disabled={disabled} approvalActive={!!approvalActive} register={register} setValue={setValue} errors={errors} />
          <AiConfigSecretSection provider={provider} initial={initial} apiKey={apiKey} onApiKeyChange={setApiKey} readOnly={readOnly} disabled={disabled} />
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-line-soft bg-surface-page/60 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line bg-white px-4 py-2.5 text-xs font-bold text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary">
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              {isLoading ? 'Saving…' : isCreate ? 'Create configuration' : 'Save changes'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
