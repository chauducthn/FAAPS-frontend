// Agenda textarea of the booking form, with the "Suggest agenda" shortcut and a character counter.

import { Sparkle as Sparkles } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

/** A starter agenda built from the student's progress, for the "Suggest agenda" button. */
export function draftAgenda(progress: { currentGpa: number | null; earnedCredits: number } | undefined): string {
  const gpa = progress?.currentGpa != null ? progress.currentGpa.toFixed(2) : 'N/A';
  const summary = progress
    ? `Current GPA: ${gpa}, Credits earned: ${progress.earnedCredits}`
    : 'Reviewing current academic progress';
  return [
    `Academic consultation request (${summary}).`,
    '1. Review upcoming semester course selection & prerequisite sequence.',
    '2. Discuss strategies to stay on track for target GPA and graduation timeline.',
    '3. Clarify elective / OJT / Capstone milestones.',
  ].join('\n');
}

interface BookingAgendaFieldProps {
  value: string;
  maxLength: number;
  missing: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onSuggest: () => void;
}

export function BookingAgendaField({ value, maxLength, missing, onChange, onBlur, onSuggest }: BookingAgendaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="appointment-reason" className="text-xs font-semibold text-[#555f6f]">
          Consultation agenda <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={onSuggest}
          className={cn(
            'inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-semibold text-[#C2410C]',
            'hover:bg-orange-100',
          )}
        >
          <Sparkles className="size-3" /> Suggest agenda
        </button>
      </div>
      <textarea
        id="appointment-reason"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        required
        placeholder="Describe the topic you want to discuss with your advisor..."
        className={cn(
          'w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#151c27] outline-none',
          'placeholder:text-[#98a2b3] focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]',
        )}
      />
      <div className="flex items-center justify-between">
        <p className={cn('text-[11px]', missing ? 'font-semibold text-red-500' : 'text-[#98a2b3]')}>
          {missing ? 'A reason is required.' : 'The advisor reads this before accepting.'}
        </p>
        <p className="text-[11px] text-[#98a2b3]">
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}
