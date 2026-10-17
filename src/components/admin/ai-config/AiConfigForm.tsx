// src/components/admin/ai-config/AiConfigForm.tsx
// Edit an AI configuration. Secret is managed in a separate local form to avoid
// accidental overwrites and to keep it out of the main RHF state.

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot } from 'lucide-react';
import {
  createAiConfigSchema,
  aiSecretSchema,
  type CreateAiConfigFormValues,
} from '../../../validations/ai-config.schema';
import type { AiConfig } from '../../../types/ai-config';

interface Props {
  mode: 'create' | 'edit';
  initial?: AiConfig | null;
  isLoading?: boolean;
  onSubmit: (values: CreateAiConfigFormValues) => void;
  onSetSecret: (apiKey: string) => void;
  isSettingSecret?: boolean;
}

export default function AiConfigForm({
  mode,
  initial,
  isLoading,
  onSubmit,
  onSetSecret,
  isSettingSecret,
}: Props) {
  const isCreate = mode === 'create';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAiConfigFormValues>({
    resolver: zodResolver(createAiConfigSchema),
    defaultValues: initial
      ? {
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
        }
      : {
          name: '',
          provider: 'GEMINI',
          modelName: 'gemini-1.5-flash',
          purpose: 'CHAT',
          temperature: 0.7,
          maxTokens: 2048,
          retrievalTopK: 5,
          similarityThreshold: 0.7,
          timeoutSeconds: 30,
          dailyRequestLimit: 1000,
        },
  });

  useEffect(() => {
    if (!initial) return;
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
  }, [initial, reset]);

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-2 text-gray-700">
          <Bot className="size-4 text-[#F26F21]" />
          <span className="font-bold uppercase text-xs">AI Configuration</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Name" required error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="Main chat assistant"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <Field label="Provider" required error={errors.provider?.message}>
            <select
              {...register('provider')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            >
              <option value="GEMINI">Gemini</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field label="Purpose" required error={errors.purpose?.message}>
            <select
              {...register('purpose')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            >
              <option value="CHAT">Chat</option>
              <option value="EMBEDDING">Embedding</option>
              <option value="OCR">OCR</option>
            </select>
          </Field>
        </div>

        <Field label="Model Name" required error={errors.modelName?.message}>
          <input
            {...register('modelName')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <div className="grid grid-cols-4 gap-4">
          <Field label="Temperature" error={errors.temperature?.message}>
            <input
              type="number"
              step="0.05"
              min={0}
              max={2}
              {...register('temperature', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <Field label="Max Tokens" error={errors.maxTokens?.message}>
            <input
              type="number"
              min={64}
              {...register('maxTokens', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <Field label="Top K" error={errors.retrievalTopK?.message}>
            <input
              type="number"
              min={1}
              max={20}
              {...register('retrievalTopK', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <Field label="Timeout (s)" error={errors.timeoutSeconds?.message}>
            <input
              type="number"
              min={5}
              max={120}
              {...register('timeoutSeconds', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Similarity Threshold" error={errors.similarityThreshold?.message}>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              {...register('similarityThreshold', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
          <Field label="Daily Request Limit" error={errors.dailyRequestLimit?.message}>
            <input
              type="number"
              min={1}
              {...register('dailyRequestLimit', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
            />
          </Field>
        </div>

        <Field label="System Prompt" error={errors.systemPrompt?.message}>
          <textarea
            rows={3}
            {...register('systemPrompt')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <Field label="Fallback Message" error={errors.fallbackMessage?.message}>
          <textarea
            rows={2}
            {...register('fallbackMessage')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </Field>

        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <input type="checkbox" {...register('isActive')} />
          Active
        </label>

        <div className="pt-3 flex justify-end gap-2.5 border-t border-gray-100">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-lg disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : isCreate ? 'Create Configuration' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Secret section: write-only. Never pre-filled. */}
      {!isCreate && (
        <SecretForm onSubmit={onSetSecret} isSubmitting={isSettingSecret} />
      )}
    </div>
  );
}

function SecretForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (apiKey: string) => void;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ apiKey: string }>({
    resolver: zodResolver(aiSecretSchema),
    defaultValues: { apiKey: '' },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => {
        onSubmit(v.apiKey);
        reset();
      })}
      className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">
          API Key (write-only)
        </span>
      </div>
      <p className="text-[11px] text-amber-700">
        The server never returns the API key. Submitting a new value overwrites it.
      </p>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <input
            type="password"
            autoComplete="off"
            placeholder="••••••••"
            {...register('apiKey')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
          {errors.apiKey && (
            <p className="mt-1 text-[10px] text-red-600">{errors.apiKey.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-lg disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save Key'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-bold text-gray-700 uppercase mb-1 text-xs">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}