import { CalendarDots as CalendarRange, ListDashes as LayoutList } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export type AppointmentViewMode = 'table' | 'timeline';

const OPTIONS: { id: AppointmentViewMode; label: string; icon: typeof LayoutList }[] = [
  { id: 'table', label: 'Table', icon: LayoutList },
  { id: 'timeline', label: 'Timeline', icon: CalendarRange },
];

/**
 * A segmented control that switches between the table and the timeline.
 *
 * The active option is marked with `aria-pressed`, and the moving highlight
 * is a single element that slides, so the switch reads as one mechanism.
 */
export function ViewToggle({
  value,
  onChange,
}: {
  value: AppointmentViewMode;
  onChange: (value: AppointmentViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Appointment view"
      className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-page p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = option.id === value;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            title={`${option.label} view`}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
              active
                ? 'bg-white text-ink-primary shadow-[0_1px_2px_rgba(20,32,51,0.08)]'
                : 'text-ink-muted hover:text-ink-primary',
            )}
          >
            <Icon className="size-4" aria-hidden />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
