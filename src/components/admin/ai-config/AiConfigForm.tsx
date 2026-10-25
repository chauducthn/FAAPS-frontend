// src/components/admin/ai-config/AiConfigForm.tsx
// Form cấu hình AI: chia 3 tab (General / Prompt / Advanced) + khu API key riêng.
// Secret là write-only nên nằm ở form riêng, không nằm trong state của RHF chính.

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, KeyRound, Save, Sparkles } from 'lucide-react';
import {
  createAiConfigSchema,
  aiSecretSchema,
  type CreateAiConfigFormValues,
} from '../../../validations/ai-config.schema';
import type { AiConfig, AiPreset } from '../../../types/ai-config';
import { cn } from '@/lib/utils';

interface Props {
  mode: 'create' | 'edit';
  initial?: AiConfig | null;
  /** Khi đổi preset, form được prefill theo giá trị của preset đó. */
  preset?: AiPreset | null;
  isLoading?: boolean;
  onSubmit: (values: CreateAiConfigFormValues) => void;
  onSetSecret: (apiKey: string) => void;
  isSettingSecret?: boolean;
}

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'prompt', label: 'Prompt' },
  { id: 'advanced', label: 'Advanced' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AiConfigForm({
  mode,
  initial,
  preset,
  isLoading,
  onSubmit,
  onSetSecret,
  isSettingSecret,
}: Props) {
  const isCreate = mode === 'create';
  const [tab, setTab] = useState<TabId>('general');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
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
  });

  // Chọn một config khác -> nạp lại toàn bộ giá trị vào form.
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
    setTab('general');
  }, [initial, reset]);

  // Áp preset -> nạp giá trị mẫu (giữ nguyên tên/purpose nếu preset có).
  useEffect(() => {
    if (!preset) return;
    reset((prev) => ({
      ...prev,
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
    }));
    setTab('general');
  }, [preset, reset]);

  const purpose = watch('purpose');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="flex items-center gap-1 border-b border-[#e7eefe] px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={cn(
              'relative px-4 py-3 text-sm font-semibold transition-colors',
              tab === t.id ? 'text-[#f37021]' : 'text-[#555f6f] hover:text-[#151c27]',
            )}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#f37021]" />}
          </button>
        ))}
        {isDirty && (
          <span className="ml-auto pr-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-amber-600">
            Unsaved changes
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5 py-5">
        {tab === 'general' && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Name" required error={errors.name?.message} hint="Tên nội bộ, dùng để nhận diện trong báo cáo.">
                <input
                  {...register('name')}
                  placeholder="Academic Advisor Chat"
                  className={inputClass}
                />
              </Field>
              <Field label="Provider" required error={errors.provider?.message}>
                <select {...register('provider')} className={inputClass}>
                  <option value="GEMINI">Gemini</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Purpose" required error={errors.purpose?.message} hint="Quyết định model nào được dùng cho tính năng nào.">
                <select {...register('purpose')} className={inputClass}>
                  <option value="CHAT">Chat</option>
                  <option value="EMBEDDING">Embedding</option>
                  <option value="OCR">OCR</option>
                </select>
              </Field>
            </div>

            <Field label="Model name" required error={errors.modelName?.message} hint="Tên model chính xác từ nhà cung cấp.">
              <input {...register('modelName')} placeholder="gemini-2.0-flash" className={inputClass} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Max tokens" error={errors.maxTokens?.message} hint="Độ dài tối đa của câu trả lời.">
                <input type="number" min={64} max={32768} {...register('maxTokens', { valueAsNumber: true })} className={inputClass} />
              </Field>
              <Field label="Timeout (seconds)" error={errors.timeoutSeconds?.message} hint="Timeout cho mỗi request.">
                <input type="number" min={5} max={120} {...register('timeoutSeconds', { valueAsNumber: true })} className={inputClass} />
              </Field>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] p-4">
              <input type="checkbox" {...register('isActive')} className="mt-0.5 size-4 accent-[#f37021]" />
              <span>
                <span className="block text-sm font-semibold text-[#151c27]">Active</span>
                <span className="mt-0.5 block text-[13px] text-[#555f6f]">
                  Cấu hình đang hoạt động sẽ được dùng cho các request tới tính năng tương ứng.
                </span>
              </span>
            </label>
          </>
        )}

        {tab === 'prompt' && (
          <>
            <Field
              label="System prompt"
              error={errors.systemPrompt?.message}
              hint="Chỉ dẫn cho model về vai trò, giọng điệu và quy tắc trả lời."
            >
              <textarea
                rows={12}
                {...register('systemPrompt')}
                placeholder="Bạn là trợ lý học thuật của FAAPS..."
                className={`${inputClass} resize-y font-mono text-[13px] leading-6`}
              />
            </Field>
            <Field
              label="Fallback message"
              error={errors.fallbackMessage?.message}
              hint="Nội dung hiển thị khi request lỗi hoặc hết quota."
            >
              <textarea
                rows={4}
                {...register('fallbackMessage')}
                placeholder="Hệ thống đang bận. Vui lòng thử lại sau ít phút..."
                className={`${inputClass} resize-y`}
              />
            </Field>
          </>
        )}

        {tab === 'advanced' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Temperature"
                error={errors.temperature?.message}
                hint="0 = chặt chẽ, 2 = sáng tạo. 0–0.5 hợp với tư vấn học thuật."
              >
                <input
                  type="number"
                  step="0.05"
                  min={0}
                  max={2}
                  {...register('temperature', { valueAsNumber: true })}
                  className={inputClass}
                />
              </Field>
              <Field label="Retrieval top K" error={errors.retrievalTopK?.message} hint="Số đoạn tài liệu lấy ra từ chỉ mục vector.">
                <input
                  type="number"
                  min={1}
                  max={20}
                  {...register('retrievalTopK', { valueAsNumber: true })}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Similarity threshold"
                error={errors.similarityThreshold?.message}
                hint="Ngưỡng khớp tối thiểu. Để trống nếu không dùng truy xuất."
              >
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  {...register('similarityThreshold', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                  })}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Daily request limit"
                error={errors.dailyRequestLimit?.message}
                hint="Để trống = không giới hạn."
              >
                <input
                  type="number"
                  min={1}
                  {...register('dailyRequestLimit', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                  })}
                  className={inputClass}
                />
              </Field>
            </div>

            {purpose === 'EMBEDDING' && (
              <p className="rounded-lg bg-[#eef2ff] px-4 py-3 text-[13px] text-[#3730a3]">
                Cấu hình Embedding không dùng system prompt, temperature hay fallback message. Các giá trị này bị bỏ qua khi
                tạo vector.
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#e7eefe] pt-4">
        <p className="text-xs text-[#98a2b3]">
          {isCreate ? 'Tạo mới một cấu hình AI cho hệ thống.' : 'Thay đổi sẽ có hiệu lực với các request tiếp theo.'}
        </p>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-60"
        >
          {isLoading ? (
            'Saving...'
          ) : (
            <>
              {isCreate ? <Sparkles className="size-4" /> : <Save className="size-4" />}
              {isCreate ? 'Create configuration' : 'Save changes'}
            </>
          )}
        </button>
      </div>

      {/* Secret section: write-only. Never pre-filled. */}
      {!isCreate && <SecretForm onSubmit={onSetSecret} isSubmitting={isSettingSecret} />}
    </form>
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
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-amber-700" />
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">API key (write-only)</span>
      </div>
      <p className="mt-1.5 text-[11px] text-amber-700">
        Server không bao giờ trả lại API key. Gửi một giá trị mới sẽ ghi đè giá trị cũ.
      </p>
      <form
        onSubmit={handleSubmit((v) => {
          onSubmit(v.apiKey);
          reset();
        })}
        className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <input
            type="password"
            autoComplete="off"
            placeholder="••••••••••••"
            {...register('apiKey')}
            className={cn(inputClass, 'bg-white')}
          />
          {errors.apiKey && <p className="mt-1 text-[11px] font-medium text-red-600">{errors.apiKey.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-60"
        >
          <Bot className="size-4" />
          {isSubmitting ? 'Saving...' : 'Save key'}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#151c27] outline-none transition-colors placeholder:text-[#98a2b3] focus:border-[#f37021] focus:ring-1 focus:ring-[#f37021]';

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-[#98a2b3]">{hint}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}
