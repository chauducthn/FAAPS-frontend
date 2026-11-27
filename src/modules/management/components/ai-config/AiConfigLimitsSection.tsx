import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
import type { CreateAiConfigFormValues } from '../../../ai/validations/ai-config.schema';
import {
  AiFormField,
  AiFormSection,
  AiStepperField,
  aiLabelClass,
  aiNoSpinClass,
} from './AiConfigFormPrimitives';

interface Props {
  purpose: string;
  temperature: number | undefined;
  disabled: boolean;
  register: UseFormRegister<CreateAiConfigFormValues>;
  watch: UseFormWatch<CreateAiConfigFormValues>;
  setValue: UseFormSetValue<CreateAiConfigFormValues>;
  errors: FieldErrors<CreateAiConfigFormValues>;
}

export function AiConfigLimitsSection({
  purpose,
  temperature,
  disabled,
  register,
  watch,
  setValue,
  errors,
}: Props) {
  return (
    <AiFormSection title="Generation limits" hint="Strict numbers only — letters and negatives are rejected.">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label className={aiLabelClass} htmlFor="ai-temperature">
            Temperature
          </label>
          <div className="flex items-center gap-3">
            <input
              id="ai-temperature-range"
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={typeof temperature === 'number' && Number.isFinite(temperature) ? temperature : 0}
              disabled={disabled}
              onChange={(e) => setValue('temperature', Number(e.target.value), { shouldValidate: true })}
              aria-label="Temperature slider"
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-brand disabled:cursor-not-allowed disabled:opacity-60"
            />
            <input
              id="ai-temperature"
              type="number"
              min={0}
              max={2}
              step={0.05}
              inputMode="decimal"
              {...register('temperature', {
                setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
              })}
              disabled={disabled}
              aria-label="Temperature"
              className={cn(aiNoSpinClass, 'w-20 text-center')}
            />
          </div>
          {errors.temperature?.message ? (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.temperature.message}</p>
          ) : (
            <p className="mt-1 text-[11px] text-ink-subtle">0 = precise, 2 = creative. 0–0.5 for advising.</p>
          )}
        </div>
        <AiStepperField
          label="Max tokens"
          hint="e.g. 4096"
          error={errors.maxTokens?.message}
          disabled={disabled}
          inputProps={{
            ...register('maxTokens', { setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)) }),
            min: 64,
            max: 32768,
            'aria-label': 'Max tokens',
          }}
          onStep={(dir) => {
            const cur = typeof watch('maxTokens') === 'number' ? (watch('maxTokens') as number) : 4096;
            setValue('maxTokens', Math.min(32768, Math.max(64, cur + dir * 512)), { shouldValidate: true });
          }}
        />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        <AiStepperField
          label="Timeout (s)"
          hint="5 – 120s"
          error={errors.timeoutSeconds?.message}
          disabled={disabled}
          inputProps={{
            ...register('timeoutSeconds', { setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)) }),
            min: 5,
            max: 120,
            'aria-label': 'Timeout seconds',
          }}
          onStep={(dir) => {
            const cur = typeof watch('timeoutSeconds') === 'number' ? (watch('timeoutSeconds') as number) : 30;
            setValue('timeoutSeconds', Math.min(120, Math.max(5, cur + dir * 5)), { shouldValidate: true });
          }}
        />
        <AiStepperField
          label="Retrieval top K"
          hint="1 – 20 chunks"
          error={errors.retrievalTopK?.message}
          disabled={disabled}
          inputProps={{
            ...register('retrievalTopK', { setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)) }),
            min: 1,
            max: 20,
            'aria-label': 'Retrieval top K',
          }}
          onStep={(dir) => {
            const cur = typeof watch('retrievalTopK') === 'number' ? (watch('retrievalTopK') as number) : 6;
            setValue('retrievalTopK', Math.min(20, Math.max(1, cur + dir)), { shouldValidate: true });
          }}
        />
        <AiFormField label="Daily request limit" error={errors.dailyRequestLimit?.message} hint="Empty = no limit.">
          <input
            type="number"
            min={1}
            max={1000000}
            inputMode="numeric"
            {...register('dailyRequestLimit', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
            disabled={disabled}
            placeholder="5000"
            aria-label="Daily request limit"
            className={aiNoSpinClass}
          />
        </AiFormField>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <AiFormField label="Similarity threshold" error={errors.similarityThreshold?.message} hint="0 – 1. Empty when retrieval is off.">
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            inputMode="decimal"
            {...register('similarityThreshold', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
            disabled={disabled}
            placeholder="0.72"
            aria-label="Similarity threshold"
            className={aiNoSpinClass}
          />
        </AiFormField>
        <div className="rounded-md border border-brand/20 bg-brand-soft px-3.5 py-2.5 text-xs leading-relaxed text-ink-secondary sm:mt-[26px] sm:self-start">
          {purpose === 'EMBEDDING'
            ? 'Embedding configs ignore the prompt, temperature and fallback — they only build the vector index.'
            : 'Limits apply per request. Daily limit caps cost across the whole feature.'}
        </div>
      </div>
    </AiFormSection>
  );
}
