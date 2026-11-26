import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export const aiFieldClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:opacity-60';
export const aiLabelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';
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
          className={cn(aiNoSpinClass, 'bg-white text-center')}
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

export function AiFormSection({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">{title}</h3>
      <p className="mb-3.5 mt-0.5 text-[11px] text-gray-400">{hint}</p>
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
        {required && <span className="ml-0.5 text-[#F26F21]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
