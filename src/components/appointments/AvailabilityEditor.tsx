// src/components/appointments/AvailabilityEditor.tsx
import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useConfigureAvailabilityMutation } from '../../hooks/mutations/useAppointmentMutations';
import { ISO_WEEKDAY_LABELS } from '../../lib/appointmentDate';
import type { AvailabilitySlot, IsoWeekday } from '../../types/appointment';

const inputClass =
  'h-[38px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-[#F26F21] focus:outline-none focus:ring-1 focus:ring-[#F26F21]';

interface AvailabilityEditorProps {
  /** The advisor's current weekly template, when it is already loaded. */
  initialSlots?: AvailabilitySlot[];
}

/** Configure the weekly availability published to students. */
export function AvailabilityEditor({ initialSlots }: AvailabilityEditorProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots ?? []);
  const mutation = useConfigureAvailabilityMutation();

  useEffect(() => {
    if (initialSlots) setSlots(initialSlots);
  }, [initialSlots]);

  const updateSlot = (index: number, patch: Partial<AvailabilitySlot>) => {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const addSlot = () => {
    const day: IsoWeekday = 1;
    setSlots((prev) => [...prev, { dayOfWeek: day, startTime: '09:00', endTime: '09:30' }]);
  };

  const removeSlot = (index: number) => setSlots((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    mutation.mutate({ slots });
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#151c27]">Weekly availability</h2>
          <p className="mt-0.5 text-[13px] text-[#555f6f]">
            Publish the time slots students can book.
          </p>
        </div>
        <button
          type="button"
          onClick={addSlot}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
        >
          <Plus className="size-3.5" />
          Add slot
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="mt-4 rounded-lg bg-[#f7f8fa] px-4 py-6 text-center text-sm text-[#555f6f]">
          No slots published yet. Students cannot book until you add some.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {slots.map((slot, index) => (
            <div key={`${slot.dayOfWeek}-${slot.startTime}-${index}`} className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Day of week"
                value={slot.dayOfWeek}
                onChange={(e) => updateSlot(index, { dayOfWeek: Number(e.target.value) as IsoWeekday })}
                className={`${inputClass} w-[130px]`}
              >
                {ISO_WEEKDAY_LABELS.map((label, i) => (
                  <option key={label} value={i + 1}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="time"
                aria-label="Start time"
                value={slot.startTime}
                step={1800}
                onChange={(e) => updateSlot(index, { startTime: e.target.value })}
                className={`${inputClass} w-[140px]`}
              />
              <span className="text-sm font-medium text-[#98a2b3]">to</span>
              <input
                type="time"
                aria-label="End time"
                value={slot.endTime}
                step={1800}
                onChange={(e) => updateSlot(index, { endTime: e.target.value })}
                className={`${inputClass} w-[140px]`}
              />
              <button
                type="button"
                onClick={() => removeSlot(index)}
                aria-label="Remove slot"
                className="flex size-[38px] items-center justify-center rounded-lg border border-[#e5e7eb] text-[#98a2b3] hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-[#e5e7eb] pt-4">
        <p className="mr-auto text-[11px] text-[#98a2b3]">
          {slots.length} slot{slots.length === 1 ? '' : 's'} published
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={mutation.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:opacity-50"
        >
          <Save className="size-4" />
          {mutation.isPending ? 'Saving...' : 'Save availability'}
        </button>
      </div>
    </div>
  );
}
