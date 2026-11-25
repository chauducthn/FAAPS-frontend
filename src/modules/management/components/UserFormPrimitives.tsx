import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { userLabelClass } from './createUserSchema';

export function UserFormSection({
  title,
  bordered = false,
  children,
}: {
  title?: string;
  bordered?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={bordered ? 'border-t border-gray-100 pt-5' : ''}>
      {title && <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function UserFormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={userLabelClass}>
        {label}
        {required && <span className="ml-0.5 text-[#F26F21]">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 flex items-start gap-1 text-xs font-medium leading-snug text-red-600">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
