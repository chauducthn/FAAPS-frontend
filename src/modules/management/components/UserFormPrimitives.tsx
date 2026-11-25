import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { userLabelClass } from './createUserSchema';

export function UserFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">{title}</h3>
      <div className="space-y-3.5">{children}</div>
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
        {required && <span className="ml-0.5 text-[#C2410C]">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 flex items-start gap-1 text-[11px] font-semibold leading-snug text-red-600">
          <AlertTriangle className="mt-px size-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
