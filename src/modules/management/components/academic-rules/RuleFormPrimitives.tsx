import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export const RULE_FIELD_CLASS =
  'h-9 w-full rounded-md border border-line bg-white px-3 text-[13px] text-ink-primary ' +
  'placeholder:text-ink-subtle shadow-2xs transition-colors hover:border-ink-subtle/50 ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-page disabled:opacity-60';
export const RULE_LABEL_CLASS = 'mb-1.5 block text-[13px] font-medium text-ink-secondary';
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
        'flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors',
        checked ? 'border-brand/60 bg-brand-soft/60' : 'border-line bg-white hover:border-ink-subtle/50',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-brand"
      />
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-ink-primary">{label}</span>
        <span className="block text-[11px] text-ink-subtle">{hint}</span>
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
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
      <div className="flex items-center gap-2.5 border-b border-line-soft px-4 py-3">
        {step !== undefined && (
          <span
            className={
              'flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft ' +
              'text-[11px] font-semibold text-brand-ink ring-1 ring-brand/25'
            }
          >
            {step}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-ink-primary">{title}</h3>
          <p className="text-[11px] text-ink-subtle">{hint}</p>
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
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-ink-subtle">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
