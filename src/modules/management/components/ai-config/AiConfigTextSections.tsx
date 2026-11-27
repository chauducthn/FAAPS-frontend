import { useState } from 'react';
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { CaretDown as ChevronDown, Eye, EyeSlash, Key as KeyRound } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AiConfig } from '../../../ai/types/ai-config';
import type { CreateAiConfigFormValues } from '../../../ai/validations/ai-config.schema';
import {
  AiFormField,
  AiFormSection,
  aiFieldClass,
  aiSelectClass,
  aiTextareaClass,
} from './AiConfigFormPrimitives';

interface Props {
  disabled: boolean;
  approvalActive: boolean;
  register: UseFormRegister<CreateAiConfigFormValues>;
  setValue: UseFormSetValue<CreateAiConfigFormValues>;
  errors: FieldErrors<CreateAiConfigFormValues>;
}

export function AiConfigIdentitySection({ disabled, register, errors }: Omit<Props, 'approvalActive' | 'setValue'>) {
  return (
    <AiFormSection title="Identity" hint="Name, vendor model and the feature this config powers.">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <AiFormField label="Name" required error={errors.name?.message}>
          <input {...register('name')} disabled={disabled} placeholder="Academic Advisor Chat" aria-label="Configuration name" className={aiFieldClass} />
        </AiFormField>
        <AiFormField label="Model name" required error={errors.modelName?.message} hint="Exact vendor model id.">
          <input {...register('modelName')} disabled={disabled} placeholder="gemini-2.0-flash" aria-label="Model name" className={cn(aiFieldClass, 'font-mono')} />
        </AiFormField>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <AiFormField label="Provider" required error={errors.provider?.message}>
          <div className="relative">
            <select {...register('provider')} disabled={disabled} aria-label="Provider" className={aiSelectClass}>
              <option value="GEMINI">Google AI Studio (Gemini)</option>
              <option value="OPENROUTER">OpenRouter</option>
              <option value="OTHER">Other</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
          </div>
        </AiFormField>
        <AiFormField label="Purpose" required error={errors.purpose?.message}>
          <div className="relative">
            <select {...register('purpose')} disabled={disabled} aria-label="Purpose" className={aiSelectClass}>
              <option value="CHAT">Chat</option>
              <option value="EMBEDDING">Embedding</option>
              <option value="OCR">OCR</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
          </div>
        </AiFormField>
      </div>
    </AiFormSection>
  );
}

export function AiConfigPromptAndStatus({ disabled, approvalActive, register, setValue, errors }: Props) {
  return (
    <>
      <AiFormSection title="Prompt" hint="What the model is told, and what students see on failure.">
        <AiFormField label="System prompt" error={errors.systemPrompt?.message} hint="Role, tone and response rules.">
          <textarea
            rows={6}
            {...register('systemPrompt')}
            disabled={disabled}
            placeholder="You are the FAAPS academic assistant..."
            aria-label="System prompt"
            className={cn(aiTextareaClass, 'resize-y font-mono leading-relaxed')}
          />
        </AiFormField>
        <AiFormField label="Fallback message" error={errors.fallbackMessage?.message} hint="Shown when a request fails or quota runs out.">
          <textarea
            rows={2}
            {...register('fallbackMessage')}
            disabled={disabled}
            placeholder="The system is busy. Please try again in a few minutes..."
            aria-label="Fallback message"
            className={cn(aiTextareaClass, 'resize-y leading-relaxed')}
          />
        </AiFormField>
      </AiFormSection>

      <AiFormSection title="Activation" hint="Only active configs serve live traffic.">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={!!approvalActive}
            aria-label="Active configuration"
            disabled={disabled}
            onClick={() => setValue('isActive', !approvalActive)}
            className="inline-flex cursor-pointer items-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={cn('relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors', approvalActive ? 'bg-brand' : 'bg-line')}>
              <span className={cn('inline-block size-3.5 rounded-full bg-primary-foreground shadow-2xs transition-transform', approvalActive ? 'translate-x-[18px]' : 'translate-x-1')} />
            </span>
            <span className="text-xs font-semibold text-ink-primary">{approvalActive ? 'Active' : 'Inactive'}</span>
          </button>
          <p className="text-xs text-ink-muted">
            {approvalActive ? 'Serves subsequent requests.' : 'Kept as draft, no live traffic.'}
          </p>
        </div>
      </AiFormSection>
    </>
  );
}

export function AiConfigSecretSection({
  provider,
  initial,
  apiKey,
  onApiKeyChange,
  readOnly,
  disabled,
}: {
  provider: string;
  initial?: AiConfig | null;
  apiKey: string;
  onApiKeyChange: (val: string) => void;
  readOnly: boolean;
  disabled: boolean;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary">
          <KeyRound className="size-4 text-brand" />
          {provider === 'OPENROUTER' ? 'OpenRouter API Key' : 'Google AI Studio API Key'}{' '}
          <span className="text-xs font-normal text-ink-subtle">(write-only)</span>
        </label>
        {initial?.hasApiKey && (
          <span className="rounded-sm bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-700">
            Saved: {initial.apiKeyMasked ?? 'Configured'}
          </span>
        )}
      </div>
      {!readOnly && (
        <div className="relative mt-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            disabled={disabled}
            placeholder={provider === 'OPENROUTER' ? 'sk-or-v1-… (leave blank to keep existing or use ENV)' : 'AIza… (leave blank to keep existing or use ENV)'}
            aria-label="Provider API key"
            className={cn(aiFieldClass, 'pr-9 font-mono text-xs')}
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-ink-subtle hover:text-ink-primary"
          >
            {showKey ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
