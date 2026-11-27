import type { ReactNode } from 'react';
import { Warning as AlertTriangle } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { userLabelClass } from './createUserSchema';

/** One column of the user form: a small eyebrow label over a single-file stack of fields. */
export function UserFormSection({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      {title && <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">{title}</h3>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function UserFormField({
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  /** Quiet one-line note under the control, replaced by the error when there is one. */
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <label className={userLabelClass}>
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-start gap-1 text-xs font-medium leading-snug text-red-600">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 truncate text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}
