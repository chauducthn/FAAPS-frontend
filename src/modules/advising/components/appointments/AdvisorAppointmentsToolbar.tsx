// Toolbar switcher for calendar navigation and list period tabs in AdvisorAppointments.

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  LayoutList,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { shiftWeek, weekLabel } from '../../../appointment/components/WeeklyCalendar';
import { cn } from '@/shared/lib/utils';

export type AppointmentsViewMode = 'calendar' | 'list';
export type AppointmentsListTab = 'upcoming' | 'history';

interface AdvisorAppointmentsToolbarProps {
  view: AppointmentsViewMode;
  onViewChange: (view: AppointmentsViewMode) => void;
  weekAnchor: Date;
  onWeekAnchorChange: (updater: Date | ((prev: Date) => Date)) => void;
  isFetching: boolean;
  onRefresh: () => void;
  showAvailability: boolean;
  onToggleAvailability: () => void;
  tab: AppointmentsListTab;
  onTabChange: (tab: AppointmentsListTab) => void;
  upcomingCount: number;
  historyCount: number;
}

export function AdvisorAppointmentsToolbar({
  view,
  onViewChange,
  weekAnchor,
  onWeekAnchorChange,
  isFetching,
  onRefresh,
  showAvailability,
  onToggleAvailability,
  tab,
  onTabChange,
  upcomingCount,
  historyCount,
}: AdvisorAppointmentsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="View mode">
        {(
          [
            { key: 'calendar', label: 'Calendar', icon: CalendarDays },
            { key: 'list', label: 'List', icon: LayoutList },
          ] as const
        ).map((v) => {
          const active = view === v.key;
          const Icon = v.icon;
          return (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onViewChange(v.key)}
              className={cn(
                'flex h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-bold transition-all',
                active ? 'bg-white text-[#F26F21] shadow-sm' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {v.label}
            </button>
          );
        })}
      </div>

      {view === 'calendar' ? (
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            aria-label="Refresh appointments"
            className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
          </button>
          <button
            type="button"
            onClick={() => onWeekAnchorChange((d) => shiftWeek(d, -1))}
            aria-label="Previous week"
            className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[170px] text-center text-sm font-bold text-slate-900">
            {weekLabel(weekAnchor)}
          </span>
          <button
            type="button"
            onClick={() => onWeekAnchorChange((d) => shiftWeek(d, 1))}
            aria-label="Next week"
            className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onWeekAnchorChange(new Date())}
            className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onToggleAvailability}
            aria-pressed={showAvailability}
            className={cn(
              'flex h-11 items-center gap-1.5 rounded-xl border px-4 text-sm font-bold shadow-sm transition-colors',
              showAvailability
                ? 'border-[#F26F21] bg-[#fff3ea] text-[#F26F21]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
            )}
          >
            <SlidersHorizontal className="size-4" />
            Availability
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3" role="tablist" aria-label="Appointment period">
          {(
            [
              { key: 'upcoming', label: `Upcoming (${upcomingCount})`, icon: Clock3 },
              { key: 'history', label: `History (${historyCount})`, icon: CircleCheckBig },
            ] as const
          ).map((t) => {
            const active = tab === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(t.key)}
                className={cn(
                  'inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold ring-1 ring-inset transition-colors',
                  active
                    ? 'bg-[#F26F21] text-white ring-[#F26F21] shadow-sm'
                    : 'bg-white text-slate-700 ring-slate-200 hover:bg-[#fff7f0] hover:text-slate-900',
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {t.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
