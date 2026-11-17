/** The attendance condition of a course: how many sessions it has and how many a student may miss. */
export interface AttendanceRule {
  totalSessions: number;
  /** A student must attend at least this share of the sessions, e.g. 80. */
  minAttendancePercent: number;
  /** Warn the student once they have missed this many sessions. */
  warnAbsentSessions: number;
}

/** A course whose condition differs from the default. */
export interface CourseAttendanceOverride extends AttendanceRule {
  courseId: string;
  courseCode: string;
  courseName: string;
  updatedAt: string;
}

/** OK, WARNING (reached the warning point) or FAIL (missed more sessions than allowed). */
export type AttendanceResult = 'OK' | 'WARNING' | 'FAIL';

export interface AttendanceImportRow {
  lineNumber: number;
  studentCode: string;
  semesterCode: string;
  courseCode: string;
  totalSessions: number | null;
  absentSessions: number | null;
  /** Why the row cannot be imported. Null when the row is valid. */
  error: string | null;
  /** Result against the course condition. Null for invalid rows. */
  result: AttendanceResult | null;
}

export interface AttendanceImportPreview {
  importId: string;
  fileName: string;
  rows: AttendanceImportRow[];
  validRows: number;
  errorRows: number;
}

export interface AttendanceImportHistoryItem {
  id: string;
  fileName: string;
  rowCount: number;
  warningCount: number;
  failCount: number;
  confirmedAt: string;
}

/** Number of sessions a student may miss before failing the attendance condition. */
export function maxAbsentSessions(rule: AttendanceRule): number {
  return Math.floor((rule.totalSessions * (100 - rule.minAttendancePercent)) / 100);
}

export function attendanceResult(rule: AttendanceRule, absent: number): AttendanceResult {
  if (absent > maxAbsentSessions(rule)) return 'FAIL';
  if (absent >= rule.warnAbsentSessions) return 'WARNING';
  return 'OK';
}
