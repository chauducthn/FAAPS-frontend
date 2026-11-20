import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type {
  AttendanceImportHistoryItem,
  AttendanceImportPreview,
  AttendanceRule,
  CourseAttendanceOverride,
} from '../types/attendance';

/* Backend: /api/admin/attendance (AdminAttendanceController). The server reads the file and checks each row. */

const BASE = '/admin/attendance';

export const TEMPLATE_HEADERS = ['Student ID', 'Semester', 'Course code', 'Total sessions', 'Absent sessions'] as const;

/** The same checks the backend makes, so a bad value is shown before the request is sent. */
export function validateRule(rule: AttendanceRule): string | null {
  const { totalSessions, minAttendancePercent, warnAbsentSessions } = rule;
  if (!Number.isInteger(totalSessions) || totalSessions < 1 || totalSessions > 200) return 'Total sessions must be a whole number from 1 to 200.';
  if (!Number.isFinite(minAttendancePercent) || minAttendancePercent < 1 || minAttendancePercent > 100) return 'Minimum attendance must be from 1% to 100%.';
  if (!Number.isInteger(warnAbsentSessions) || warnAbsentSessions < 1) return 'Warn at must be a whole number of at least 1.';
  if (warnAbsentSessions > totalSessions) return 'Warn at cannot be more than the total sessions.';
  return null;
}

const toRule = ({ totalSessions, minAttendancePercent, warnAbsentSessions }: AttendanceRule): AttendanceRule =>
  ({ totalSessions, minAttendancePercent, warnAbsentSessions });

export const attendanceService = {
  getDefaultRule: async (): Promise<AttendanceRule> =>
    (await apiClient.get<AttendanceRule>(`${BASE}/config/default`)).data,

  saveDefaultRule: async (rule: AttendanceRule): Promise<AttendanceRule> =>
    (await apiClient.put<AttendanceRule>(`${BASE}/config/default`, toRule(rule), { headers: await getCsrfHeaders() })).data,

  listOverrides: async (): Promise<CourseAttendanceOverride[]> =>
    (await apiClient.get<CourseAttendanceOverride[]>(`${BASE}/config`)).data,

  saveOverride: async (courseId: string, rule: AttendanceRule): Promise<CourseAttendanceOverride> =>
    (await apiClient.put<CourseAttendanceOverride>(`${BASE}/config/${courseId}`, toRule(rule), { headers: await getCsrfHeaders() })).data,

  removeOverride: async (courseId: string): Promise<void> => {
    await apiClient.delete(`${BASE}/config/${courseId}`, { headers: await getCsrfHeaders() });
  },

  /** Uploads a .csv or .xlsx file; the server checks every row and keeps the preview until it is confirmed. */
  previewImport: async (file: File): Promise<AttendanceImportPreview> => {
    const body = new FormData();
    body.append('file', file);
    return (await apiClient.post<AttendanceImportPreview>(`${BASE}/imports/preview`, body,
      { headers: { ...(await getCsrfHeaders()), 'Content-Type': 'multipart/form-data' } })).data;
  },

  confirmImport: async (importId: string): Promise<AttendanceImportHistoryItem> =>
    (await apiClient.post<AttendanceImportHistoryItem>(`${BASE}/imports/${importId}/confirm`, null, { headers: await getCsrfHeaders() })).data,

  listImports: async (): Promise<AttendanceImportHistoryItem[]> =>
    (await apiClient.get<AttendanceImportHistoryItem[]>(`${BASE}/imports`)).data,
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
