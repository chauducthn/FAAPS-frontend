import { CaretDown as ChevronDown } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import {
  draftCode,
  termBounds,
  termFromDate,
  TERMS,
  type SemesterDraft,
  type TermPrefix,
} from './semesterRangeUtils';

const controlClass = (hasError?: boolean) =>
  cn(
    'h-9 w-full rounded-lg border bg-white px-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 shadow-2xs transition-colors focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-gray-200 hover:border-gray-300 focus:border-[#F26F21] focus:ring-[#F26F21]/15',
  );

interface Props {
  label: string;
  draft: SemesterDraft;
  semesters: { id: string; code: string; startDate?: string | null }[];
  minEndDate?: string;
  hasError?: boolean;
  onChange: (next: SemesterDraft) => void;
}

export function SemesterPickerField({ label, draft, semesters, minEndDate, hasError, onChange }: Props) {
  const code = draftCode(draft);

  const buildForTermYear = (term: TermPrefix, year: string): SemesterDraft => {
    const bounds = termBounds(term, year);
    const existing = semesters.find((s) => s.code.toUpperCase() === bounds.code);
    return {
      term,
      year,
      startDate: existing?.startDate || bounds.startDate,
      endDate: bounds.endDate,
    };
  };

  const handleTermChange = (raw: string) => {
    const nextTerm = (raw as TermPrefix | '') || '';
    if (nextTerm && /^\d{4}$/.test(draft.year)) {
      onChange(buildForTermYear(nextTerm, draft.year));
      return;
    }
    onChange({ ...draft, term: nextTerm });
  };

  const handleYearChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (draft.term && digits.length === 4) {
      onChange(buildForTermYear(draft.term, digits));
      return;
    }
    onChange({ ...draft, year: digits });
  };

  const handleStartDateChange = (nextStart: string) => {
    if (!nextStart) {
      onChange({ ...draft, startDate: '' });
      return;
    }
    const inferred = termFromDate(nextStart);
    if (!inferred) {
      onChange({ ...draft, startDate: nextStart });
      return;
    }
    const endInferred = draft.endDate ? termFromDate(draft.endDate) : null;
    const sameTerm = endInferred?.term === inferred.term && endInferred?.year === inferred.year;
    const nextEnd =
      sameTerm && draft.endDate > nextStart
        ? draft.endDate
        : termBounds(inferred.term, inferred.year).endDate;
    onChange({ term: inferred.term, year: inferred.year, startDate: nextStart, endDate: nextEnd });
  };

  const handleEndDateChange = (nextEnd: string) => {
    if (!nextEnd) {
      onChange({ ...draft, endDate: '' });
      return;
    }
    const inferred = termFromDate(nextEnd);
    if (!inferred) {
      onChange({ ...draft, endDate: nextEnd });
      return;
    }
    const startInferred = draft.startDate ? termFromDate(draft.startDate) : null;
    const sameTerm = startInferred?.term === inferred.term && startInferred?.year === inferred.year;
    const nextStart =
      sameTerm && draft.startDate < nextEnd
        ? draft.startDate
        : termBounds(inferred.term, inferred.year).startDate;
    onChange({ term: inferred.term, year: inferred.year, startDate: nextStart, endDate: nextEnd });
  };

  return (
    <div className={cn('space-y-2 rounded-xl border p-2.5', hasError ? 'border-red-200 bg-red-50/30' : 'border-gray-200/80 bg-gray-50/50')}>
      <div className="grid grid-cols-[84px_1fr_auto] items-center gap-2">
        <div className="relative">
          <select
            value={draft.term}
            aria-label={`${label} term`}
            onChange={(e) => handleTermChange(e.target.value)}
            className={cn(controlClass(hasError), 'appearance-none pr-7 font-semibold', !draft.term && 'font-normal text-gray-400')}
          >
            <option value="">Term…</option>
            {TERMS.map((t) => (
              <option key={t} value={t} className="text-gray-900">
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        </div>

        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="Year (e.g. 2026)"
          aria-label={`${label} year`}
          value={draft.year}
          onChange={(e) => handleYearChange(e.target.value)}
          className={cn(controlClass(hasError), 'tabular-nums')}
        />

        {code && (
          <span className="rounded-md bg-[#FFF4ED] px-2 py-1 font-mono text-xs font-semibold text-[#C2410C]">
            {code}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="mb-0.5 block text-[11px] font-medium text-gray-500">From date</span>
          <input
            type="date"
            aria-label={`${label} start date`}
            value={draft.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className={cn(controlClass(hasError), 'h-8 px-2 text-xs tabular-nums')}
          />
        </div>
        <div>
          <span className="mb-0.5 block text-[11px] font-medium text-gray-500">To date</span>
          <input
            type="date"
            min={minEndDate}
            aria-label={`${label} end date`}
            value={draft.endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className={cn(controlClass(hasError), 'h-8 px-2 text-xs tabular-nums')}
          />
        </div>
      </div>
    </div>
  );
}
