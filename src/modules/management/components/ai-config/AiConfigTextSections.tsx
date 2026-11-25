import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
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
            <option value="GEMINI">Gemini</option>
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
