import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, ChevronDown, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { semesterService } from '../../../academic/services/semesterService';
import { CURRICULUM_QUERY_KEYS } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { toastBadRequest } from '@/shared/lib/apiError';

type TermPrefix = 'SP' | 'SU' | 'FA';
const TERMS: TermPrefix[] = ['SP', 'SU', 'FA'];
const DEFAULT_TERM_SPAN = 15;
export const MIN_END_TERM_GAP = 9;
const TERM_META: Record<TermPrefix, { label: string; start: string; end: string }> = {
  SP: { label: 'Spring', start: '01-01', end: '04-30' },
  SU: { label: 'Summer', start: '05-01', end: '08-31' },
  FA: { label: 'Fall', start: '09-01', end: '12-31' },
};

export function semesterOrdinal(code?: string): number | null {
  const m = code ? /^(SP|SU|FA)(\d{4})$/i.exec(code.trim()) : null;
  return m ? Number(m[2]) * 3 + TERMS.indexOf(m[1].toUpperCase() as TermPrefix) : null;
}

function computeEndSemester(startTerm: TermPrefix, startYear: number) {
  const endIndex = startYear * 3 + TERMS.indexOf(startTerm) + (DEFAULT_TERM_SPAN - 1);
  const endYear = Math.floor(endIndex / 3);
  const endTerm = TERMS[endIndex % 3];
  const meta = TERM_META[endTerm];
  return { code: `${endTerm}${endYear}`, name: `${meta.label} ${endYear}`, startDate: `${endYear}-${meta.start}`, endDate: `${endYear}-${meta.end}` };
}

const fieldClass =
  'h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15';

interface Props {
  target: 'start' | 'end' | null;
  startSemesterCode?: string;
  existingSemesters: { id: string; code: string }[];
  onClose: () => void;
  onCreated: (result: { startId?: string; endId?: string }) => void;
}

export function SemesterCreator({ target, startSemesterCode, existingSemesters, onClose, onCreated }: Props) {
  const cache = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState<TermPrefix>('FA');
  const [year, setYear] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!target) return null;

  const syncDerived = (nextTerm: TermPrefix, nextYear: string) => {
    setError(null);
    if (!/^\d{4}$/.test(nextYear)) return;
    const meta = TERM_META[nextTerm];
    setName(`${meta.label} ${nextYear}`);
    setStartDate(`${nextYear}-${meta.start}`);
    setEndDate(`${nextYear}-${meta.end}`);
  };

  const onTermChange = (next: TermPrefix) => {
    setTerm(next);
    syncDerived(next, year);
  };

  const onYearChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setYear(digits);
    syncDerived(term, digits);
  };

  const resetAndClose = () => {
    setTerm('FA');
    setYear('');
    setName('');
    setStartDate('');
    setEndDate('');
    setError(null);
    onClose();
  };

  const create = async () => {
    if (!/^\d{4}$/.test(year)) return setError('Enter a 4-digit year (e.g. 2026) to complete the 6-character code.');
    if (!name.trim() || !startDate || !endDate) return setError('Please fill in semester name, start date, and end date.');
    if (endDate <= startDate) return setError('End date must be after start date.');
    const code = `${term}${year}`;
    if (target === 'end' && startSemesterCode) {
      const fromOrd = semesterOrdinal(startSemesterCode);
      const toOrd = semesterOrdinal(code);
      if (fromOrd !== null && toOrd !== null && toOrd - fromOrd < MIN_END_TERM_GAP) {
        return setError(`End semester must be at least ${MIN_END_TERM_GAP} terms after ${startSemesterCode}.`);
      }
    }
    setSaving(true);
    try {
      const created = await semesterService.create({ code, name: name.trim(), startDate, endDate });
      if (target === 'end') {
        await cache.refetchQueries({ queryKey: CURRICULUM_QUERY_KEYS.semesters() });
        onCreated({ endId: created.id });
        resetAndClose();
        toast.success(`End semester ${created.code} created`);
        return;
      }
      const endSpec = computeEndSemester(term, Number(year));
      let endId = existingSemesters.find((s) => s.code.toUpperCase() === endSpec.code)?.id;
      if (!endId) {
        try {
          endId = (await semesterService.create(endSpec)).id;
        } catch {
          const refreshed = await semesterService.list();
          endId = refreshed.find((s) => s.code.toUpperCase() === endSpec.code)?.id;
        }
      }
      await cache.refetchQueries({ queryKey: CURRICULUM_QUERY_KEYS.semesters() });
      onCreated({ startId: created.id, endId });
      resetAndClose();
      toast.success(endId ? `Semester ${created.code} created (end: ${endSpec.code}, 15 terms)` : `Semester ${created.code} created`);
    } catch (err) {
      toastBadRequest(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarPlus className="size-4 text-[#F26F21]" aria-hidden />
          <span className="text-[13px] font-semibold text-gray-900">
            {target === 'end' ? 'New end semester' : 'New start semester'}
          </span>
        </div>
        <button type="button" onClick={resetAndClose} disabled={saving} aria-label="Close new semester form" className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Code</label>
          <div className="grid grid-cols-[84px_1fr] gap-2">
            <div className="relative">
              <select
                aria-label="New semester term"
                value={term}
                onChange={(e) => onTermChange(e.target.value as TermPrefix)}
                className={`${fieldClass} appearance-none pr-7 font-semibold`}
              >
                <option value="SP">SP</option>
                <option value="SU">SU</option>
                <option value="FA">FA</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            </div>
            <input
              aria-label="New semester year"
              inputMode="numeric"
              maxLength={4}
              placeholder="e.g. 2026"
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className={`${fieldClass} tabular-nums`}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
          <input aria-label="New semester name" className={fieldClass} placeholder="e.g. Fall 2026" maxLength={100} value={name} onChange={(e) => { setError(null); setName(e.target.value); }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Start date</label>
          <input type="date" aria-label="New semester start date" className={fieldClass} value={startDate} onChange={(e) => { setError(null); setStartDate(e.target.value); }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">End date</label>
          <input type="date" aria-label="New semester end date" className={fieldClass} value={endDate} onChange={(e) => { setError(null); setEndDate(e.target.value); }} />
        </div>
      </div>

      {error && <p className="mt-2.5 text-xs font-medium text-red-600">{error}</p>}

      <div className="mt-3.5 flex items-center justify-end gap-2">
        <button type="button" disabled={saving} onClick={resetAndClose} className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
          Cancel
        </button>
        <button type="button" disabled={saving} onClick={create} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:opacity-60">
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          {saving ? 'Adding…' : 'Add semester'}
        </button>
      </div>
    </div>
  );
}
