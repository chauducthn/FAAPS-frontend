import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export const aiFieldClass = cn(
  'h-9 w-full rounded-md border border-line bg-white px-3 text-[13px] text-ink-primary',
  'placeholder:text-ink-subtle shadow-2xs transition-colors',
  'hover:border-ink-subtle/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
  'disabled:cursor-not-allowed disabled:bg-surface-page disabled:opacity-60',
);

export const aiTextareaClass = cn(
  'w-full rounded-md border border-line bg-white px-3 py-2 text-[13px] text-ink-primary',
  'placeholder:text-ink-subtle shadow-2xs transition-colors',
  'hover:border-ink-subtle/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
  'disabled:cursor-not-allowed disabled:bg-surface-page disabled:opacity-60',
);

export const aiLabelClass = 'mb-1.5 block text-[13px] font-medium text-ink-secondary';
export const aiSelectClass = cn(aiFieldClass, 'appearance-none pr-8');
export const aiNoSpinClass = cn(
  aiFieldClass,
  'font-mono font-semibold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
);

export function AiStepperField({
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
      <label className={aiLabelClass}>{label}</label>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={disabled}
          onClick={() => onStep(-1)}
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-white text-ink-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          disabled={disabled}
          {...inputProps}
          onChange={(e: ChangeEvent<HTMLInputElement>) => inputProps.onChange?.(e)}
          className={cn(aiNoSpinClass, 'text-center')}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={disabled}
          onClick={() => onStep(1)}
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-white text-ink-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      {hint && !error && <p className="mt-1 text-[11px] text-ink-subtle">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function AiFormSection({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">{title}</h3>
        <p className="text-[11px] text-ink-subtle">{hint}</p>
      </div>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

export function AiFormField({
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
  children: ReactNode;
}) {
  return (
    <div>
      <label className={aiLabelClass}>
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-ink-subtle">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
