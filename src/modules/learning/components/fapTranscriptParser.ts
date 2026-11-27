import { buildXlsx, type XlsxRow } from '../utils/studyPlanXlsx';

export interface ParsedFapRow {
  courseCode: string;
  semesterCode: string;
  finalScore: string;
  status: string;
  attemptNumber: number;
}

const TERM_RE = /^(SP|SPRING|SU|SUMMER|FA|FALL)\s*(\d{2}|20\d{2})$/i;
const COURSE_RE = /^[A-Z0-9][A-Za-z0-9_-]{2,20}$/;

function normalizeTerm(raw: string): string | null {
  const m = TERM_RE.exec(raw.trim());
  if (!m) return null;
  const prefix = m[1].slice(0, 2).toUpperCase();
  const year = m[2].length === 2 ? `20${m[2]}` : m[2];
  return `${prefix}${year}`;
}

function normalizeStatus(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (s === 'PASS' || s === 'PASSED') return 'PASSED';
  if (s === 'FAIL' || s === 'FAILED' || s === 'NOT_PASSED' || s === 'NOT_PASS' || s === 'ATTENDANCE_FAIL' || s === 'SUSPENDED') return 'FAILED';
  if (s === 'STUDYING' || s === 'IN_PROGRESS' || s === 'LEARNING') return 'IN_PROGRESS';
  if (s === 'EXEMPT' || s === 'EXEMPTED' || s === 'IS_EXEMPT') return 'EXEMPTED';
  if (s === 'WITHDRAWN' || s === 'DROPPED' || s === 'NOT_STARTED') return 'WITHDRAWN';
  return s;
}

function isStatusToken(raw: string): boolean {
  const n = normalizeStatus(raw);
  return ['PASSED', 'FAILED', 'IN_PROGRESS', 'EXEMPTED', 'WITHDRAWN'].includes(n);
}

export function parseFapTranscriptText(rawText: string): ParsedFapRow[] {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const attemptCounts = new Map<string, number>();
  const rows: ParsedFapRow[] = [];

  for (const line of lines) {
    const cells = (line.includes('\t') ? line.split('\t') : line.split(/[,;|]/)).map((c) => c.trim());
    if (cells.length < 3) continue;
    // Skip header lines
    const joinedLower = cells.join(' ').toLowerCase();
    if (joinedLower.includes('subject code') || joinedLower.includes('coursecode')) continue;

    // Find term cell & status cell flexibly (handles both FAP 8-col table and 4-5 col custom tables)
    const termIdx = cells.findIndex((c) => normalizeTerm(c) !== null);
    if (termIdx < 0) continue;
    const semesterCode = normalizeTerm(cells[termIdx])!;

    let statusIdx = -1;
    for (let i = cells.length - 1; i >= 0; i--) {
      if (isStatusToken(cells[i])) { statusIdx = i; break; }
    }
    if (statusIdx < 0) continue;
    const status = normalizeStatus(cells[statusIdx]);

    // Course code: usually right after term (FAP) or col 0 (FAAPS template)
    const candidates = [cells[termIdx + 1], cells[0], cells[1], cells[2]].filter(Boolean);
    const courseCode = candidates.find(
      (c) => c !== cells[termIdx] && !/^\d+$/.test(c) && !isStatusToken(c) && COURSE_RE.test(c),
    );
    if (!courseCode) continue;

    // Score: numeric cell between 0 and 10 (prefer cell right before status)
    let finalScore = '';
    const scoreCandidates = [cells[statusIdx - 1], cells[2], ...cells].filter(Boolean);
    for (const sc of scoreCandidates) {
      if (sc === courseCode || sc === cells[termIdx] || sc === cells[statusIdx]) continue;
      if (/^\d{1,2}([.,]\d{1,2})?$/.test(sc)) {
        const val = Number(sc.replace(',', '.'));
        if (!Number.isNaN(val) && val >= 0 && val <= 10 && sc !== cells[0]) {
          finalScore = sc.replace(',', '.');
          break;
        }
      }
    }

    const key = courseCode.toUpperCase();
    const attemptNumber = (attemptCounts.get(key) ?? 0) + 1;
    attemptCounts.set(key, attemptNumber);
    rows.push({ courseCode, semesterCode, finalScore, status, attemptNumber });
  }

  return rows;
}

export function buildTranscriptXlsxFile(rows: ParsedFapRow[], fileName = 'fap-pasted-transcript.xlsx'): File {
  const aoa: XlsxRow[] = [
    ['CourseCode', 'SemesterCode', 'FinalScore', 'Status', 'AttemptNumber'],
    ...rows.map((r): XlsxRow => [r.courseCode, r.semesterCode, r.finalScore, r.status, r.attemptNumber]),
  ];
  const blob = buildXlsx(aoa, { sheetName: 'Transcript' });
  return new File([blob], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
