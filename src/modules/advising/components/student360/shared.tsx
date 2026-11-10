// src/modules/advising/components/student360/shared.tsx
// Pieces shared by the Student 360 tabs: the progress bar and the initials badge.

import { cn } from '@/shared/lib/utils';

/** A slim gradient progress bar (credits earned / credits required). */
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f1f4f9]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#F26F21] to-[#ff9a4d] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Up to two uppercase initials of a person's name. */
export function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** The academic-status pill used in the modal header. */
export function AcademicStatusPill({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 ring-green-200',
    PROBATION: 'bg-orange-100 text-orange-800 ring-orange-200',
    SUSPENDED: 'bg-red-100 text-red-800 ring-red-200',
    GRADUATED: 'bg-blue-100 text-blue-800 ring-blue-200',
    WITHDRAWN: 'bg-gray-100 text-gray-700 ring-gray-200',
    LEAVE_OF_ABSENCE: 'bg-gray-100 text-gray-700 ring-gray-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold ring-1 ring-inset',
        styles[status ?? ''] ?? 'bg-white text-gray-700 ring-gray-200',
      )}
    >
      {status ?? '—'}
    </span>
  );
}
