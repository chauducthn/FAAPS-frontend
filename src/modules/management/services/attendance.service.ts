import {
  attendanceResult,
  type AttendanceImportHistoryItem,
  type AttendanceImportPreview,
  type AttendanceImportRow,
  type AttendanceRule,
  type CourseAttendanceOverride,
} from '../types/attendance';

/*
 * TEMPORARY in-memory service: the attendance endpoints do not exist in the backend yet
 * (see Nghien_cuu_Attendance_Import_Config.md). Data lives only until the page is reloaded.
 * Planned endpoints, to swap in when the backend is ready:
 *   GET/PUT  /api/admin/attendance/config/default
 *   GET      /api/admin/attendance/config            (course overrides)
 *   PUT/DEL  /api/admin/attendance/config/{courseId}
 *   POST     /api/imports/preview?type=ATTENDANCE    (multipart .xlsx)
 *   POST     /api/admin/attendance/imports/{id}/confirm
 *   GET      /api/admin/attendance/imports
 */

export const TEMPLATE_HEADERS = ['Student ID', 'Semester', 'Course code', 'Total sessions', 'Absent sessions'] as const;

let defaultRule: AttendanceRule = { totalSessions: 20, minAttendancePercent: 80, warnAbsentSessions: 3 };
let overrides = new Map<string, CourseAttendanceOverride>();
let previews = new Map<string, AttendanceImportPreview>();
let history: AttendanceImportHistoryItem[] = [];

/** Clears the in-memory data. For tests. */
export function resetAttendanceMock() {
  defaultRule = { totalSessions: 20, minAttendancePercent: 80, warnAbsentSessions: 3 };
  overrides = new Map();
  previews = new Map();
  history = [];
}

const id = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

export function validateRule(rule: AttendanceRule): string | null {
  const { totalSessions, minAttendancePercent, warnAbsentSessions } = rule;
  if (!Number.isInteger(totalSessions) || totalSessions < 1 || totalSessions > 200) return 'Total sessions must be a whole number from 1 to 200.';
  if (!Number.isFinite(minAttendancePercent) || minAttendancePercent < 1 || minAttendancePercent > 100) return 'Minimum attendance must be from 1% to 100%.';
  if (!Number.isInteger(warnAbsentSessions) || warnAbsentSessions < 1) return 'Warn at must be a whole number of at least 1.';
  if (warnAbsentSessions > totalSessions) return 'Warn at cannot be more than the total sessions.';
  return null;
}

function ensureValid(rule: AttendanceRule) {
  const error = validateRule(rule);
  if (error) throw new Error(error);
}

function ruleFor(courseCode: string): AttendanceRule {
  for (const o of overrides.values()) if (o.courseCode.toUpperCase() === courseCode.toUpperCase()) return o;
  return defaultRule;
}

function parseCount(raw: string | undefined): number | null {
  const v = (raw ?? '').trim();
  if (!/^\d+$/.test(v)) return null;
  return Number(v);
}

/** Splits one CSV line, honouring double-quoted cells. */
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      cells.push(cur);
      cur = '';
    } else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

export function parseAttendanceCsv(text: string): AttendanceImportRow[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const header = splitCsvLine(lines[0] ?? '').map((h) => h.toLowerCase());
  const expected = TEMPLATE_HEADERS.map((h) => h.toLowerCase());
  if (expected.some((h, i) => header[i] !== h)) {
    throw new Error(`The file must start with the columns: ${TEMPLATE_HEADERS.join(', ')}.`);
  }

  const seen = new Set<string>();
  const rows: AttendanceImportRow[] = [];
  lines.slice(1).forEach((line, i) => {
    if (line.trim() === '') return;
    const [studentCode = '', semesterCode = '', courseCode = '', totalRaw, absentRaw] = splitCsvLine(line);
    const totalSessions = parseCount(totalRaw);
    const absentSessions = parseCount(absentRaw);
    const key = `${studentCode}|${semesterCode}|${courseCode}`.toUpperCase();

    let error: string | null = null;
    if (!studentCode || !semesterCode || !courseCode) error = 'Student ID, semester and course code are required.';
    else if (totalSessions === null || totalSessions < 1) error = 'Total sessions must be a whole number of at least 1.';
    else if (absentSessions === null) error = 'Absent sessions must be a whole number.';
    else if (absentSessions > totalSessions) error = 'Absent sessions cannot be more than total sessions.';
    else if (seen.has(key)) error = 'Duplicate row for this student, semester and course.';
    seen.add(key);

    let result: AttendanceImportRow['result'] = null;
    if (!error) {
      const rule = { ...ruleFor(courseCode), totalSessions: totalSessions as number };
      result = attendanceResult(rule, absentSessions as number);
    }
    rows.push({ lineNumber: i + 2, studentCode, semesterCode, courseCode, totalSessions, absentSessions, error, result });
  });
  if (rows.length === 0) throw new Error('The file has no data rows.');
  return rows;
}

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsText(file);
  });
}

export const attendanceService = {
  getDefaultRule: async (): Promise<AttendanceRule> => ({ ...defaultRule }),

  saveDefaultRule: async (rule: AttendanceRule): Promise<AttendanceRule> => {
    ensureValid(rule);
    defaultRule = { ...rule };
    return { ...defaultRule };
  },

  listOverrides: async (): Promise<CourseAttendanceOverride[]> => [...overrides.values()].map((o) => ({ ...o })),

  saveOverride: async (courseId: string, courseCode: string, courseName: string, rule: AttendanceRule): Promise<CourseAttendanceOverride> => {
    ensureValid(rule);
    const saved = { ...rule, courseId, courseCode, courseName, updatedAt: new Date().toISOString() };
    overrides.set(courseId, saved);
    return { ...saved };
  },

  removeOverride: async (courseId: string): Promise<void> => {
    overrides.delete(courseId);
  },

  previewImport: async (file: File): Promise<AttendanceImportPreview> => {
    if (!/\.csv$/i.test(file.name)) {
      // Reading .xlsx needs the backend; until it exists only CSV can be previewed.
      throw new Error('Excel files will be read by the server once it is connected. For now, upload the CSV template.');
    }
    const rows = parseAttendanceCsv(await readText(file));
    const errorRows = rows.filter((r) => r.error).length;
    const preview: AttendanceImportPreview = { importId: id(), fileName: file.name, rows, validRows: rows.length - errorRows, errorRows };
    previews.set(preview.importId, preview);
    return preview;
  },

  confirmImport: async (importId: string): Promise<AttendanceImportHistoryItem> => {
    const preview = previews.get(importId);
    if (!preview) throw new Error('This preview has expired. Upload the file again.');
    if (preview.validRows === 0) throw new Error('There are no valid rows to import.');
    const valid = preview.rows.filter((r) => !r.error);
    const item: AttendanceImportHistoryItem = {
      id: importId,
      fileName: preview.fileName,
      rowCount: valid.length,
      warningCount: valid.filter((r) => r.result === 'WARNING').length,
      failCount: valid.filter((r) => r.result === 'FAIL').length,
      confirmedAt: new Date().toISOString(),
    };
    previews.delete(importId);
    history = [item, ...history];
    return item;
  },

  listImports: async (): Promise<AttendanceImportHistoryItem[]> => history.map((h) => ({ ...h })),
};

/** CSV text of the import template, with one example row. */
export function attendanceTemplateCsv(): string {
  return `${TEMPLATE_HEADERS.join(',')}\nSE173012,FA25,PRF192,20,3\n`;
}

/** CSV text of the invalid rows of a preview, with the reason in the last column. */
export function attendanceErrorsCsv(preview: AttendanceImportPreview): string {
  const esc = (v: string | number | null) => {
    const s = v === null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = preview.rows
    .filter((r) => r.error)
    .map((r) => [r.studentCode, r.semesterCode, r.courseCode, r.totalSessions, r.absentSessions, r.error].map(esc).join(','));
  return [[...TEMPLATE_HEADERS, 'Error'].join(','), ...lines].join('\n') + '\n';
}
