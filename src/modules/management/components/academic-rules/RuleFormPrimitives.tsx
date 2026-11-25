import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export const RULE_FIELD_CLASS =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F37021] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F37021]/20 disabled:cursor-not-allowed disabled:opacity-60';
export const RULE_LABEL_CLASS = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';
export const RULE_SELECT_CLASS = cn(RULE_FIELD_CLASS, 'appearance-none pr-9');
export const RULE_NUM_CLASS = cn(RULE_FIELD_CLASS, 'font-mono font-bold tabular-nums');

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
        'flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/50 p-3 transition-colors has-checked:border-orange-300 has-checked:bg-orange-50',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 accent-[#F37021]"
      />
      <span>
        <span className="block text-xs font-bold text-gray-700">{label}</span>
        <span className="block text-[11px] font-medium text-gray-400">{hint}</span>
      </span>
    </label>
  );
}

export function RuleFormSection({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">{title}</h3>
      <p className="mb-3.5 mt-0.5 text-[11px] text-gray-400">{hint}</p>
      <div className="space-y-4">{children}</div>
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
        {required && <span className="ml-0.5 text-[#F37021]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
