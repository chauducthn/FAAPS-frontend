import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Key as KeyRound } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AiConfig } from '../../../ai/types/ai-config';
import type { CreateAiConfigFormValues } from '../../../ai/validations/ai-config.schema';
import {
  AiFormField,
  AiFormSection,
  aiFieldClass,
  aiSelectClass,
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
      <div className="grid gap-4 sm:grid-cols-2">
        <AiFormField label="Name" required error={errors.name?.message}>
          <input {...register('name')} disabled={disabled} placeholder="Academic Advisor Chat" aria-label="Configuration name" className={aiFieldClass} />
        </AiFormField>
        <AiFormField label="Model name" required error={errors.modelName?.message} hint="Exact vendor model id.">
          <input {...register('modelName')} disabled={disabled} placeholder="gemini-2.0-flash" aria-label="Model name" className={cn(aiFieldClass, 'font-mono')} />
        </AiFormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AiFormField label="Provider" required error={errors.provider?.message}>
          <select {...register('provider')} disabled={disabled} aria-label="Provider" className={aiSelectClass}>
            <option value="GEMINI">Google AI Studio (Gemini)</option>
            <option value="OPENROUTER">OpenRouter</option>
            <option value="OTHER">Other</option>
          </select>
        </AiFormField>
        <AiFormField label="Purpose" required error={errors.purpose?.message}>
          <select {...register('purpose')} disabled={disabled} aria-label="Purpose" className={aiSelectClass}>
            <option value="CHAT">Chat</option>
            <option value="EMBEDDING">Embedding</option>
            <option value="OCR">OCR</option>
          </select>
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
            rows={8}
            {...register('systemPrompt')}
            disabled={disabled}
            placeholder="You are the FAAPS academic assistant..."
            aria-label="System prompt"
            className={cn(aiFieldClass, 'resize-y font-mono text-[13px] leading-6')}
          />
        </AiFormField>
        <AiFormField label="Fallback message" error={errors.fallbackMessage?.message} hint="Shown when a request fails or quota runs out.">
          <textarea
            rows={3}
            {...register('fallbackMessage')}
            disabled={disabled}
            placeholder="The system is busy. Please try again in a few minutes..."
            aria-label="Fallback message"
            className={cn(aiFieldClass, 'resize-y leading-relaxed')}
          />
        </AiFormField>
      </AiFormSection>

      <AiFormSection title="Activation" hint="Only active configs serve live traffic.">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={!!approvalActive}
            aria-label="Active configuration"
            disabled={disabled}
            onClick={() => setValue('isActive', !approvalActive)}
            className="flex items-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', approvalActive ? 'bg-[#F26F21]' : 'bg-gray-300')}>
              <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', approvalActive ? 'left-[22px]' : 'left-0.5')} />
            </span>
            <span className="text-xs font-bold text-gray-700">{approvalActive ? 'Active' : 'Inactive'}</span>
          </button>
          <p className="text-[11px] text-gray-400">
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
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
          <KeyRound className="size-3.5 text-[#F26F21]" />
          {provider === 'OPENROUTER' ? 'OpenRouter API Key' : 'Google AI Studio API Key'} (write-only)
        </label>
        {initial?.hasApiKey && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            Saved: {initial.apiKeyMasked ?? 'Configured'}
          </span>
        )}
      </div>
      {!readOnly && (
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          disabled={disabled}
          placeholder={provider === 'OPENROUTER' ? 'sk-or-v1-… (leave blank to keep existing or use ENV)' : 'AIza… (leave blank to keep existing or use ENV)'}
          aria-label="Provider API key"
          className="mt-2 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 font-mono text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
        />
      )}
    </div>
  );
}
