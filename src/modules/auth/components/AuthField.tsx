import type { ReactNode } from 'react';
import { authErrorTextClass, authLabelClass } from './authFormStyles';

interface AuthFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  /** Extra content aligned to the right of the label, such as a "Forgot password?" link. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function AuthField({ label, htmlFor, required, error, aside, className, children }: AuthFieldProps) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className={authLabelClass}>
          {label} {required && <span className="text-brand">*</span>}
        </label>
        {aside}
      </div>
      {children}
      {error && <p className={authErrorTextClass}>{error}</p>}
    </div>
  );
}
