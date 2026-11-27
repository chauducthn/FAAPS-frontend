import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

/** Semantic tones shared by every admin metric tile. Orange is reserved for the brand accent. */
export type AdminStatTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

/** Older per-page tone names, mapped onto the semantic set so call sites need no changes. */
type LegacyTone =
  | 'slate' | 'gray' | 'default' | 'blue' | 'indigo' | 'violet'
  | 'orange' | 'emerald' | 'green' | 'amber' | 'warn' | 'red' | 'rose';

const TONE_ALIASES: Record<LegacyTone, AdminStatTone> = {
  slate: 'neutral',
  gray: 'neutral',
  default: 'neutral',
  blue: 'neutral',
  indigo: 'neutral',
  violet: 'neutral',
  orange: 'brand',
  emerald: 'success',
  green: 'success',
  amber: 'warning',
  warn: 'warning',
  red: 'danger',
  rose: 'danger',
};

const ICON_TONE: Record<AdminStatTone, string> = {
  neutral: 'bg-surface-page text-ink-muted ring-1 ring-line',
  brand: 'bg-brand-soft text-brand ring-1 ring-brand/15',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
  danger: 'bg-red-50 text-red-600 ring-1 ring-red-600/10',
};

export function resolveStatTone(tone?: AdminStatTone | LegacyTone): AdminStatTone {
  if (!tone) return 'neutral';
  return tone in TONE_ALIASES ? TONE_ALIASES[tone as LegacyTone] : (tone as AdminStatTone);
}

export interface AdminStatTileProps {
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
  /** Secondary text shown next to the value, such as a unit or a comparison. */
  meta?: ReactNode;
  tone?: AdminStatTone | LegacyTone;
  /** Highlights the tile when it acts as the current filter. */
  active?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

/** The single metric tile used across admin pages (stat strips, KPI rows, filter tiles). */
export function AdminStatTile({
  icon,
  label,
  value,
  meta,
  tone,
  active = false,
  onClick,
  isLoading = false,
  className,
}: AdminStatTileProps) {
  const resolved = resolveStatTone(tone);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex min-w-0 items-center gap-3 rounded-lg border bg-white px-3.5 py-3 text-left transition-colors',
        onClick && 'cursor-pointer',
        active
          ? 'border-brand/60 bg-brand-soft/40 ring-1 ring-brand/20'
          : cn('border-line', onClick && 'hover:border-ink-subtle/50 hover:bg-surface-hover'),
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md [&_svg]:size-[18px]',
            ICON_TONE[resolved],
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-ink-muted">{label}</p>
        {isLoading ? (
          <div className="mt-1.5 h-5 w-16 animate-pulse rounded-sm bg-line-soft" />
        ) : (
          <div className="mt-1 flex min-w-0 items-baseline gap-1.5">
            <span className="text-lg font-semibold leading-none tracking-tight text-ink-primary tabular-nums">
              {value}
            </span>
            {meta && <span className="truncate text-xs text-ink-subtle">{meta}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
