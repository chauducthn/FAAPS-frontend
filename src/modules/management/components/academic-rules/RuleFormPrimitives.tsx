import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export const RULE_FIELD_CLASS =
  'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-400 shadow-2xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60';
export const RULE_LABEL_CLASS = 'mb-1.5 block text-[13px] font-medium text-gray-700';
export const RULE_SELECT_CLASS = cn(RULE_FIELD_CLASS, 'appearance-none pr-9');
export const RULE_NUM_CLASS = cn(RULE_FIELD_CLASS, 'font-mono font-semibold tabular-nums');

export function RuleToggleChip({
  checked,
  onChange,
  disabled,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
  hint: string;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors',
        checked ? 'border-[#F26F21]/60 bg-orange-50/60' : 'border-gray-200 bg-white hover:border-gray-300',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[#F26F21]"
      />
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-gray-800">{label}</span>
        <span className="block text-[11px] text-gray-400">{hint}</span>
      </span>
    </label>
  );
}

export function RuleFormSection({
  step,
  title,
  hint,
  children,
}: {
  step?: number;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-3">
        {step !== undefined && (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-bold text-[#C2410C] ring-1 ring-orange-200/80">
            {step}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-gray-900">{title}</h3>
          <p className="text-[11px] text-gray-400">{hint}</p>
        </div>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

export function RuleFormField({
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
      <label className={RULE_LABEL_CLASS}>
        {label}
        {required && <span className="ml-0.5 text-[#F26F21]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
