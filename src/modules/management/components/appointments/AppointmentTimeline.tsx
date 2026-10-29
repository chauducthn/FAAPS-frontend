import { CalendarDays, MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  AppointmentAvatar,
  STATUS_META,
  formatSlotDay,
  formatSlotTimeRange,
  formatWeekday,
  localDayKey,
} from '../AppointmentBits';
import type { Appointment } from '../../types/admin';

/**
 * Groups the appointments by local calendar day, preserving the newest-first
 * order of the incoming list.
 */
function groupByDay(items: Appointment[]) {
  const groups = new Map<string, Appointment[]>();
  for (const item of items) {
    const key = localDayKey(item.scheduledAt);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.entries()].map(([day, appointments]) => ({ day, appointments }));
}

export interface AppointmentTimelineProps {
  items: Appointment[];
  isLoading?: boolean;
  onOpen: (id: string) => void;
}

/**
 * The timeline view: appointments grouped under their day, each entry on a
 * rail that carries the status colour. It answers "what is happening when"
 * faster than a table can, which is the reason the view exists.
 */
export function AppointmentTimeline({ items, isLoading = false, onOpen }: AppointmentTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-xl bg-[#f1f5f9]"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#e5e7eb] py-16 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#f7f8fa] text-[#5b6577]">
          <CalendarDays className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-[#151c27]">No appointments to schedule</p>
        <p className="text-[13px] text-[#555f6f]">
          Adjust the filters or pick another date range to see the schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupByDay(items).map(({ day, appointments }) => (
        <section key={day}>
          <div className="mb-2.5 flex items-baseline gap-2">
            <h3 className="text-[13px] font-semibold text-[#151c27]">{formatWeekday(day)}</h3>
            <span className="text-[12px] text-[#5b6577]">{formatSlotDay(day)}</span>
            <span className="ml-auto text-[11px] font-medium text-[#5b6577]">
              {appointments.length} session{appointments.length === 1 ? '' : 's'}
            </span>
          </div>

          <ul className="space-y-2">
            {appointments.map((appointment) => {
              const meta = STATUS_META[appointment.status];
              const StatusIcon = meta.icon;

              return (
                <li key={appointment.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(appointment.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3 text-left',
                      'transition-[box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                      'hover:border-[#f37021]/40 hover:shadow-[0_6px_16px_rgba(20,32,51,0.07)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f37021]/40',
                    )}
                  >
                    <AppointmentAvatar name={appointment.studentName} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[13px] font-semibold text-[#151c27]">
                          {appointment.studentName}
                        </span>
                        <span className="text-[12px] text-[#5b6577]">with</span>
                        <span className="text-[13px] text-[#555f6f]">
                          {appointment.advisorName}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[12px] text-[#555f6f]">
                        {appointment.agenda || 'No agenda provided.'}
                      </p>
                    </div>

                    <div className="hidden shrink-0 items-center gap-1.5 text-[12px] text-[#5b6577] sm:flex">
                      <MapPin className="size-3.5" aria-hidden />
                      {appointment.location || '—'}
                    </div>

                    <span className="shrink-0 whitespace-nowrap text-[12px] font-semibold tabular-nums text-[#151c27]">
                      {formatSlotTimeRange(appointment)}
                    </span>

                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        meta.chip,
                      )}
                    >
                      <StatusIcon className="size-3.5" aria-hidden />
                      {meta.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
