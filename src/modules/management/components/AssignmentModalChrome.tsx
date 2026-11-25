import type { ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';

export const assignmentSelectClass =
  'h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-9 text-sm text-gray-900 shadow-2xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60';

export const assignmentTextareaClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-2xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15';

export const assignmentCancelBtn =
  'h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50';

export const assignmentPrimaryBtn =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55';

export function AssignmentModalHeader({
  icon: Icon,
  title,
  subtitle,
  tone = 'brand',
  onClose,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  tone?: 'brand' | 'danger';
  onClose: () => void;
}) {
  const iconTone =
    tone === 'danger'
      ? 'bg-red-50 text-red-600 ring-1 ring-red-200/70'
      : 'bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70';

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold tracking-tight text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function AssignmentModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5 sm:flex-row">
      {children}
    </div>
  );
}
