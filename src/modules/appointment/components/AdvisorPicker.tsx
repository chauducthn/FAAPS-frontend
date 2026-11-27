// src/modules/appointment/components/AdvisorPicker.tsx
// Danh sách cố vấn sinh viên có thể đặt lịch.
//
// BE đã sort ưu tiên cố vấn CÙNG Major Group lên đầu ⇒ component giữ nguyên
// thứ tự BE trả về và gắn badge "Recommended · Same Major Group" cho cố vấn
// có cờ `sameMajorGroup`.
//
// Mỗi cố vấn hiện số slot trống trong ngày đang chọn (nếu BE gộp sẵn `slots`),
// nếu không thì FE tự hỏi `/appointments/available-slots?advisorId=`.

import { useMemo } from 'react';
import { Check, Sparkles, UserRound } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { isSameMajorGroup, type AdvisorOption } from '../types/advisorOption';

interface AdvisorPickerProps {
  advisors: AdvisorOption[];
  /** Cố vấn đang chọn (users.id). */
  value: string | null;
  onChange: (advisorId: string) => void;
  /** Số slot trống theo từng advisor — key là users.id. */
  slotCounts?: Record<string, number>;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

function initialsOf(name: string | null | undefined) {
  return (
    (name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

export function AdvisorPicker({
  advisors,
  value,
  onChange,
  slotCounts,
  isLoading,
  isError,
  onRetry,
}: AdvisorPickerProps) {
  /** Cố vấn có slot trống trong ngày đang chọn (được xếp trước). */
  const advisorsWithSlots = useMemo(() => {
    if (!slotCounts) return advisors;
    return [...advisors].sort((a, b) => {
      const aFree = (slotCounts[a.id] ?? 0) > 0 ? 1 : 0;
      const bFree = (slotCounts[b.id] ?? 0) > 0 ? 1 : 0;
      if (aFree !== bFree) return bFree - aFree;
      // Giữ nguyên thứ tự BE (cùng Major Group đã được ưu tiên lên đầu).
      return advisors.indexOf(a) - advisors.indexOf(b);
    });
  }, [advisors, slotCounts]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#555f6f]">Could not load the advisors.</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="text-[13px] font-semibold text-orange-600 hover:underline">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
        <UserRound className="size-3.5" />
        Choose an advisor
      </p>

      {isLoading ? (
        <div className="mt-3 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[62px] animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : advisorsWithSlots.length === 0 ? (
        <p className="mt-3 rounded-lg bg-[#f7f8fa] px-4 py-6 text-center text-sm text-[#555f6f]">
          No advisors are available for booking right now.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {advisorsWithSlots.map((advisor) => {
            const active = value === advisor.id;
            const sameGroup = isSameMajorGroup(advisor);
            const free = slotCounts?.[advisor.id];
            return (
              <li key={advisor.id}>
                <button
                  type="button"
                  onClick={() => onChange(advisor.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                    active
                      ? 'border-[#F26F21] bg-orange-50/60 shadow-sm'
                      : 'border-[#e5e7eb] bg-white hover:border-orange-300 hover:bg-orange-50/40',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white',
                      active
                        ? 'bg-[#F26F21]'
                        : 'bg-gradient-to-br from-slate-500 to-slate-700',
                    )}
                  >
                    {initialsOf(advisor.fullName)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-[#151c27]">
                        {advisor.fullName ?? '—'}
                      </span>
                      {sameGroup && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 ring-1 ring-inset ring-emerald-200">
                          <Sparkles className="size-3" aria-hidden />
                          Recommended · Same Major Group
                        </span>
                      )}
                      {advisor.assigned && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Assigned advisor
                        </span>
                      )}
                    </span>
                    {advisor.email && (
                      <span className="mt-0.5 block truncate text-xs text-[#98a2b3]">{advisor.email}</span>
                    )}
                  </span>

                  <span className="flex shrink-0 items-center gap-2">
                    {free != null && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold',
                          free > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {free > 0 ? `${free} free` : 'Full'}
                      </span>
                    )}
                    {active && <Check className="size-4 shrink-0 text-[#F26F21]" aria-hidden />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
