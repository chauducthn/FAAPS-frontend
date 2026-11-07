// AI Configuration form — Operate-mode redesign synced with RuleFormModal:
// gradient header, sectioned layout, strict numeric validation (no letters,
// no negatives — zod messages + no-spin inputs + steppers), read-only view mode.
import { useEffect, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cpu, Loader2, Minus, Plus, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import {
  createAiConfigSchema,
  type CreateAiConfigFormValues,
} from '../../../ai/validations/ai-config.schema';
import type { AiConfig, AiPreset } from '../../../ai/types/ai-config';

interface Props {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  initial?: AiConfig | null;
  /** When set, the form is prefilled from this preset (create mode). */
  preset?: AiPreset | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAiConfigFormValues) => void;
}

const field =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:opacity-60';
const labelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';
const selectClass = cn(field, 'appearance-none pr-9');
const numClass = cn(
  field,
  'font-mono font-bold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
);

const noSpin = numClass;

export default function AiConfigForm({ open, mode, initial, preset, isLoading, onClose, onSubmit }: Props) {
  const isCreate = mode === 'create';
  const isView = mode === 'view';
  const readOnly = isView;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAiConfigFormValues>({
    resolver: zodResolver(createAiConfigSchema),
    defaultValues: {
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
    },
    mode: 'onChange',
  });

  const purpose = watch('purpose');
  const temperature = watch('temperature');
  const approvalActive = watch('isActive');

  useEffect(() => {
    if (!open) return;
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
      reset({
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
      });
    }
  }, [open, initial, preset, reset]);

  const title = isCreate
    ? 'New AI configuration'
    : isView
      ? (initial?.name ?? 'Configuration')
      : `Edit ${initial?.name ?? 'configuration'}`;

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-3xl">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] to-white px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
              <Cpu className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-gray-900">{title}</h2>
                {initial && (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em]',
                      initial.isActive ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-gray-100 text-[#555f6f]',
                    )}
                  >
                    {initial.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
                {isCreate && (
                  <span className="inline-flex items-center rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em] text-[#9a3412] ring-1 ring-orange-200">
                    New
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                {isCreate
                  ? 'Define the model, limits and prompt — numbers reject letters and negatives.'
                  : readOnly
                    ? 'Read-only view of this configuration.'
                    : 'Changes apply to subsequent requests.'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-6 text-[13px]">
          {preset && isCreate && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-[#fff7ed] px-4 py-3">
              <p className="text-xs text-[#9a3412]">
                Prefilled from preset <span className="font-bold">{preset.label}</span> — review before creating.
              </p>
            </div>
          )}

          <Section title="Identity" hint="Name, vendor model and the feature this config powers.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={errors.name?.message}>
                <input {...register('name')} disabled={readOnly || isLoading} placeholder="Academic Advisor Chat" aria-label="Configuration name" className={field} />
              </Field>
              <Field label="Model name" required error={errors.modelName?.message} hint="Exact vendor model id.">
                <input {...register('modelName')} disabled={readOnly || isLoading} placeholder="gemini-2.0-flash" aria-label="Model name" className={cn(field, 'font-mono')} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provider" required error={errors.provider?.message}>
                <select {...register('provider')} disabled={readOnly || isLoading} aria-label="Provider" className={selectClass}>
                  <option value="GEMINI">Gemini</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Purpose" required error={errors.purpose?.message}>
                <select {...register('purpose')} disabled={readOnly || isLoading} aria-label="Purpose" className={selectClass}>
                  <option value="CHAT">Chat</option>
                  <option value="EMBEDDING">Embedding</option>
                  <option value="OCR">OCR</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Generation limits" hint="Strict numbers only — letters and negatives are rejected.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="ai-temperature">
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
                    disabled={readOnly || !!isLoading}
                    onChange={(e) => setValue('temperature', Number(e.target.value), { shouldValidate: true })}
                    aria-label="Temperature slider"
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#F26F21] disabled:cursor-not-allowed disabled:opacity-60"
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
                    disabled={readOnly || !!isLoading}
                    aria-label="Temperature"
                    className={cn(noSpin, 'w-20 bg-white text-center')}
                  />
                </div>
                {errors.temperature?.message ? (
                  <p className="mt-1.5 text-[11px] font-semibold text-red-600">{errors.temperature.message}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-gray-400">0 = precise, 2 = creative. 0–0.5 for advising.</p>
                )}
              </div>
              <StepperField
                label="Max tokens"
                hint="e.g. 4096"
                error={errors.maxTokens?.message}
                disabled={readOnly || !!isLoading}
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
            <div className="grid gap-4 sm:grid-cols-3">
              <StepperField
                label="Timeout (s)"
                hint="5 – 120s"
                error={errors.timeoutSeconds?.message}
                disabled={readOnly || !!isLoading}
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
              <StepperField
                label="Retrieval top K"
                hint="1 – 20 chunks"
                error={errors.retrievalTopK?.message}
                disabled={readOnly || !!isLoading}
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
              <Field label="Daily request limit" error={errors.dailyRequestLimit?.message} hint="Empty = no limit.">
                <input
                  type="number"
                  min={1}
                  max={1000000}
                  inputMode="numeric"
                  {...register('dailyRequestLimit', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                  })}
                  disabled={readOnly || !!isLoading}
                  placeholder="5000"
                  aria-label="Daily request limit"
                  className={cn(noSpin, 'bg-white')}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Similarity threshold" error={errors.similarityThreshold?.message} hint="0 – 1. Empty when retrieval is off.">
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  inputMode="decimal"
                  {...register('similarityThreshold', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                  })}
                  disabled={readOnly || !!isLoading}
                  placeholder="0.72"
                  aria-label="Similarity threshold"
                  className={cn(noSpin, 'bg-white')}
                />
              </Field>
              <div className="rounded-xl bg-orange-50/70 px-4 py-3 text-[11px] leading-relaxed text-[#7c2d12] ring-1 ring-orange-100 sm:self-start sm:mt-[26px]">
                {purpose === 'EMBEDDING'
                  ? 'Embedding configs ignore the prompt, temperature and fallback — they only build the vector index.'
                  : 'Limits apply per request. Daily limit caps cost across the whole feature.'}
              </div>
            </div>
          </Section>

          <Section title="Prompt" hint="What the model is told, and what students see on failure.">
            <Field label="System prompt" error={errors.systemPrompt?.message} hint="Role, tone and response rules.">
              <textarea
                rows={8}
                {...register('systemPrompt')}
                disabled={readOnly || isLoading}
                placeholder="You are the FAAPS academic assistant..."
                aria-label="System prompt"
                className={cn(field, 'resize-y font-mono text-[13px] leading-6')}
              />
            </Field>
            <Field label="Fallback message" error={errors.fallbackMessage?.message} hint="Shown when a request fails or quota runs out.">
              <textarea
                rows={3}
                {...register('fallbackMessage')}
                disabled={readOnly || isLoading}
                placeholder="Hệ thống đang bận. Vui lòng thử lại sau ít phút..."
                aria-label="Fallback message"
                className={cn(field, 'resize-y leading-relaxed')}
              />
            </Field>
          </Section>

          <Section title="Activation" hint="Only active configs serve live traffic.">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={!!approvalActive}
                aria-label="Active configuration"
                disabled={readOnly || !!isLoading}
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
          </Section>

          {!isCreate && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
              API keys are write-only and configured via backend environment — never stored in this form.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-[#F26F21] px-5 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
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

function StepperField({
  label,
  hint,
  error,
  disabled,
  inputProps,
  onStep,
}: {
  label: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  onStep: (dir: 1 | -1) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={disabled}
          onClick={() => onStep(-1)}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          disabled={disabled}
          {...inputProps}
          onChange={(e: ChangeEvent<HTMLInputElement>) => inputProps.onChange?.(e)}
          className={cn(noSpin, 'bg-white text-center')}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={disabled}
          onClick={() => onStep(1)}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">{title}</h3>
      <p className="mb-3.5 mt-0.5 text-[11px] text-gray-400">{hint}</p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-[#F26F21]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
