import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export const aiFieldClass =
  'w-full rounded-lg border border-line bg-surface-page/50 px-3.5 py-2.5 text-[13px] font-medium text-ink-primary placeholder:font-normal placeholder:text-ink-subtle transition-all focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60';
export const aiLabelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-ink-muted';
export const aiSelectClass = cn(aiFieldClass, 'appearance-none pr-9');
export const aiNoSpinClass = cn(
  aiFieldClass,
  'font-mono font-bold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
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
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          disabled={disabled}
          {...inputProps}
          onChange={(e: ChangeEvent<HTMLInputElement>) => inputProps.onChange?.(e)}
          className={cn(aiNoSpinClass, 'bg-white text-center')}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={disabled}
          onClick={() => onStep(1)}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      {hint && !error && <p className="mt-1 text-[11px] text-ink-subtle">{hint}</p>}
      {error && <p className="mt-1.5 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}

export function AiFormSection({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line-soft bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="text-[13px] font-extrabold tracking-tight text-ink-primary">{title}</h3>
      <p className="mb-3.5 mt-0.5 text-[11px] text-ink-subtle">{hint}</p>
      <div className="space-y-4">{children}</div>
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
      {error && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
