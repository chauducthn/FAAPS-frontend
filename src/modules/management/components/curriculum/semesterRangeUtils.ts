import type { QueryClient } from '@tanstack/react-query';
import { semesterService } from '../../../academic/services/semesterService';
import { CURRICULUM_QUERY_KEYS } from '../../../academic/hooks/queries/useCurriculumsQuery';

export type TermPrefix = 'SP' | 'SU' | 'FA';
export const TERMS: TermPrefix[] = ['SP', 'SU', 'FA'];
export const MIN_END_TERM_GAP = 9;

export interface SemesterDraft {
  term: TermPrefix | '';
  year: string;
  startDate: string;
  endDate: string;
}

export const EMPTY_SEMESTER_DRAFT: SemesterDraft = { term: '', year: '', startDate: '', endDate: '' };

const TERM_META: Record<TermPrefix, { label: string; start: string; end: string }> = {
  SP: { label: 'Spring', start: '01-01', end: '04-30' },
  SU: { label: 'Summer', start: '05-01', end: '08-31' },
  FA: { label: 'Fall', start: '09-01', end: '12-31' },
};

export function semesterOrdinal(code?: string | null): number | null {
  const m = code ? /^(SP|SU|FA)(\d{4})$/i.exec(code.trim()) : null;
  return m ? Number(m[2]) * 3 + TERMS.indexOf(m[1].toUpperCase() as TermPrefix) : null;
}

export function currentSemesterOrdinal(): number {
  const now = new Date();
  return now.getFullYear() * 3 + Math.floor(now.getMonth() / 4);
}

export const todayIso = () => new Date().toISOString().slice(0, 10);

export function termBounds(term: TermPrefix, year: string) {
  const meta = TERM_META[term];
  return {
    code: `${term}${year}`,
    name: `${meta.label} ${year}`,
    startDate: `${year}-${meta.start}`,
    endDate: `${year}-${meta.end}`,
  };
}

export function termFromDate(iso: string): { term: TermPrefix; year: string } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  const term: TermPrefix = month <= 4 ? 'SP' : month <= 8 ? 'SU' : 'FA';
  return { term, year: m[1] };
}

export function draftCode(draft: SemesterDraft): string {
  return draft.term && /^\d{4}$/.test(draft.year) ? `${draft.term}${draft.year}` : '';
}

  export function draftFromSemester(
    code?: string | null,
    startDate?: string | null,
    endDate?: string | null,
  ): SemesterDraft {
    const m = code ? /^(SP|SU|FA)(\d{4})$/i.exec(code.trim()) : null;
    if (!m) return EMPTY_SEMESTER_DRAFT;
    const term = m[1].toUpperCase() as TermPrefix;
    const year = m[2];
    const bounds = termBounds(term, year);
    const start = startDate || bounds.startDate;
    const end = endDate && endDate > start ? endDate : bounds.endDate;
    return { term, year, startDate: start, endDate: end };
  }

  export function validateSemesterDrafts(start: SemesterDraft, end: SemesterDraft): { startError?: string; endError?: string } {
    const sCode = draftCode(start);
    const eCode = draftCode(end);
    let startError: string | undefined;
    let endError: string | undefined;

    if (sCode && start.startDate && start.endDate && start.endDate <= start.startDate) {
      startError = 'End date must be after start date';
    }
    if (eCode) {
      const eOrd = semesterOrdinal(eCode);
      const sOrd = semesterOrdinal(sCode);
      if (end.startDate && end.endDate && end.endDate <= end.startDate) {
        endError = 'End date must be after start date';
      } else if ((eOrd !== null && eOrd < currentSemesterOrdinal()) || (end.endDate && end.endDate < todayIso())) {
        endError = 'End semester must be from the current semester onwards';
      } else if (sOrd !== null && eOrd !== null && eOrd - sOrd < MIN_END_TERM_GAP) {
        endError = `End semester must be at least ${MIN_END_TERM_GAP} terms after ${sCode}`;
      }
    }
    return { startError, endError };
  }

  export async function resolveSemesterId(
    draft: SemesterDraft,
    existing: { id: string; code: string }[],
    cache: QueryClient,
  ): Promise<string> {
    const code = draftCode(draft);
    if (!code || !draft.term) throw new Error('Semester is incomplete');
    const found = existing.find((s) => s.code.toUpperCase() === code);
    if (found) return found.id;
    const bounds = termBounds(draft.term, draft.year);
    try {
      const created = await semesterService.create({
        code,
        name: bounds.name,
        startDate: draft.startDate || bounds.startDate,
        endDate: draft.endDate || bounds.endDate,
      });
      await cache.refetchQueries({ queryKey: CURRICULUM_QUERY_KEYS.semesters() });
      return created.id;
    } catch {
      const refreshed = await semesterService.list();
      const match = refreshed.find((s) => s.code.toUpperCase() === code);
      if (match) return match.id;
      throw new Error(`Could not create semester ${code}`);
    }
  }
