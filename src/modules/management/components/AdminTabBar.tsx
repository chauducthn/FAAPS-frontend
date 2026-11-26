import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export interface AdminTabItem<T extends string = string> {
  key: T;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  count?: number;
  badgeTone?: 'orange' | 'emerald' | 'red' | 'amber' | 'slate';
}

const BADGE_TONE: Record<NonNullable<AdminTabItem['badgeTone']>, string> = {
  orange: 'bg-orange-100 text-[#C2410C]',
  emerald: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-gray-100 text-gray-600',
};

export function AdminTabBar<T extends string>({
  tabs,
  activeKey,
  onChange,
  actions,
  ariaLabel = 'Section tabs',
}: {
  tabs: AdminTabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  actions?: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1 shadow-2xs"
      >
        {tabs.map(({ key, label, icon: Icon, count, badgeTone = 'slate' }) => {
          const active = activeKey === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(key)}
              className={cn(
                'inline-flex h-8.5 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors',
                active
                  ? 'bg-[#F26F21] text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              {Icon && <Icon className="size-4" aria-hidden />}
              {label}
              {count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.25 text-[11px] font-semibold tabular-nums',
                    active
                      ? 'bg-white/20 text-white'
                      : count > 0
                        ? BADGE_TONE[badgeTone]
                        : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
      )}
    </div>
  );
}
