import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export interface AdminTabItem<T extends string = string> {
  key: T;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  count?: number;
  badgeTone?: 'orange' | 'emerald' | 'red' | 'amber' | 'slate';
}

/** Shared segmented-tab styling, reused by pages that render their own tab buttons. */
export const ADMIN_TAB_LIST_CLASS =
  'inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-line bg-surface-page p-0.5';

export function adminTabClass(active: boolean, disabled = false): string {
  return cn(
    'inline-flex h-8 items-center gap-2 rounded-md px-3 text-[13px] font-medium transition-colors',
    '[&>svg]:text-ink-subtle',
    active
      ? 'bg-white text-ink-primary shadow-[0_1px_2px_rgb(0_0_0/0.08)] ring-1 ring-line [&>svg]:text-brand'
      : disabled
        ? 'cursor-not-allowed text-ink-subtle'
        : 'text-ink-muted hover:text-ink-primary',
  );
}

export const ADMIN_TAB_ACTIVE_COUNT_CLASS = 'bg-brand-soft text-brand-ink';

const BADGE_TONE: Record<NonNullable<AdminTabItem['badgeTone']>, string> = {
  orange: 'bg-brand-soft-strong text-brand-ink',
  emerald: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-line-soft text-ink-muted',
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
        className={ADMIN_TAB_LIST_CLASS}
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
              className={adminTabClass(active)}
            >
              {Icon && <Icon className="size-4" aria-hidden />}
              {label}
              {count !== undefined && (
                <span
                  className={cn(
                    'rounded-sm px-1.5 py-px text-[11px] font-semibold tabular-nums',
                    active
                      ? ADMIN_TAB_ACTIVE_COUNT_CLASS
                      : count > 0
                        ? BADGE_TONE[badgeTone]
                        : 'bg-line-soft text-ink-muted',
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
