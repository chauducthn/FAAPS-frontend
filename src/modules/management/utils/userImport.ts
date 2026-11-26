import { buildXlsx, type XlsxRow } from '../../learning/utils/studyPlanXlsx';
import { readFirstSheet, XlsxReadError, type SheetRows } from '../../../shared/lib/xlsxRead';
import type { ImportProblem } from './importChecks';

export interface UserImportItem {
  role: 'STUDENT' | 'ADVISOR';
  email: string;
  fullName: string;
  phone?: string;
  studentCode?: string;
  majorCode?: string;
  cohort?: string;
  enrollmentSemester?: string;
  currentSemester?: number;
  maxAdvisees?: number;
}

export interface UserImportParseResult {
  items: UserImportItem[];
  problems: ImportProblem[];
}

const EMAIL_KEYS = ['email', 'email address', 'fpt email'];
const NAME_KEYS = ['full name', 'fullname', 'name', 'họ tên', 'họ và tên'];
const PHONE_KEYS = ['phone', 'phone number', 'số điện thoại', 'sđt'];
const STUDENT_CODE_KEYS = ['student code', 'studentcode', 'student id', 'mssv', 'mã sinh viên'];
const MAJOR_KEYS = ['major code', 'majorcode', 'major', 'mã ngành', 'ngành'];
const COHORT_KEYS = ['cohort', 'cohort version', 'curriculum', 'khóa'];
const ENROLL_KEYS = ['enrollment semester', 'enrollment', 'start semester', 'kỳ nhập học'];
const CURRENT_SEM_KEYS = ['current semester', 'semester', 'kỳ hiện tại'];
const MAX_ADVISEES_KEYS = ['max advisees', 'maxadvisees', 'advisee limit', 'tối đa sinh viên'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^0\d{9}$/;
const STUDENT_CODE_RE = /^[QDHSC][ESA](0[1-9]|1\d|2[0-2])\d{4}$/;

const cleanKey = (value: string) => value.trim().toLowerCase().replace(/[:：]+$/, '').trim();
const cell = (rows: SheetRows, r: number, c: number) => (c < 0 ? '' : (rows[r]?.[c] ?? '').trim());
const findCol = (header: string[], keys: string[]) => {
  const cleaned = header.map(cleanKey);
  for (const k of keys) {
    const idx = cleaned.indexOf(k);
    if (idx >= 0) return idx;
  }
  return -1;
};

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s.-]+/g, '');
  return /^[35789]\d{8}$/.test(digits) ? `0${digits}` : digits;
}

async function readWorkbook(file: File): Promise<SheetRows | ImportProblem> {
  if (!/\.xlsx$/i.test(file.name)) {
    return { row: null, message: 'Upload an Excel file (.xlsx). Download the example sheet for the right layout.' };
  }
  try {
    return await readFirstSheet(file);
  } catch (error) {
    return { row: null, message: error instanceof XlsxReadError ? error.message : 'The file could not be read as an Excel workbook.' };
  }
}

function checkIdentity(
  email: string,
  fullName: string,
  phoneRaw: string,
  seenEmails: Set<string>,
  add: (message: string) => void,
  checkAdvisorPrefix = false,
): string {
  if (!email || !EMAIL_RE.test(email) || email.length > 255) add(`Email "${email}" is not a valid email address.`);
  else if (seenEmails.has(email)) add(`Email "${email}" appears more than once in the file.`);
  else {
    seenEmails.add(email);
    if (checkAdvisorPrefix && (email.split('@')[0] ?? '').length > 50) {
      add('Advisor email prefix before "@" must be at most 50 characters.');
    }
  }
  if (!fullName || fullName.length > 255) add('Full name is required (up to 255 characters).');
  const phone = phoneRaw ? normalizePhone(phoneRaw) : '';
  if (phone && !PHONE_RE.test(phone)) add(`Phone "${phoneRaw}" must be a 10-digit Vietnamese number starting with 0.`);
  return phone;
}

export function studentImportExample(): Blob {
  const rows: XlsxRow[] = [
    ['Email', 'Full name', 'Phone', 'Student code', 'Major code', 'Cohort', 'Enrollment semester', 'Current semester'],
    ['an.se190001@fpt.edu.vn', 'Nguyen Van An', '0901234567', 'SE190001', 'SE', 'K19', 'FA2024', 1],
    ['binh.he190002@fpt.edu.vn', 'Tran Thi Binh', '0912345678', 'HE190002', 'AI', 'K19', 'FA2024', 1],
  ];
  return buildXlsx(rows, { sheetName: 'Students', widths: [28, 22, 14, 15, 12, 10, 20, 17] });
}

export function advisorImportExample(): Blob {
  const rows: XlsxRow[] = [
    ['Email', 'Full name', 'Phone', 'Max advisees', 'Major code', 'Cohort'],
    ['cuong.advisor@fe.edu.vn', 'Le Minh Cuong', '0987654321', 30, 'SE', 'K19'],
    ['dung.advisor@fe.edu.vn', 'Pham Thu Dung', '0976543210', 25, 'AI', 'K19'],
  ];
  return buildXlsx(rows, { sheetName: 'Advisors', widths: [28, 24, 15, 15, 12, 10] });
}

export async function parseStudentImport(file: File): Promise<UserImportParseResult> {
  const sheet = await readWorkbook(file);
  if (!Array.isArray(sheet)) return { items: [], problems: [sheet] };
  const headerIdx = sheet.slice(0, 6).findIndex((row) => {
    const h = row ?? [];
    return findCol(h, EMAIL_KEYS) >= 0 && findCol(h, NAME_KEYS) >= 0 && findCol(h, STUDENT_CODE_KEYS) >= 0;
  });
  if (headerIdx < 0) {
    return { items: [], problems: [{ row: null, message: 'Missing required student columns: Email, Full name, and Student code.' }] };
  }
  const h = sheet[headerIdx];
  const cols = {
    email: findCol(h, EMAIL_KEYS), name: findCol(h, NAME_KEYS), phone: findCol(h, PHONE_KEYS),
    code: findCol(h, STUDENT_CODE_KEYS), major: findCol(h, MAJOR_KEYS), cohort: findCol(h, COHORT_KEYS),
    enroll: findCol(h, ENROLL_KEYS), sem: findCol(h, CURRENT_SEM_KEYS),
  };
  const items: UserImportItem[] = [];
  const problems: ImportProblem[] = [];
  const seenEmails = new Set<string>();
  const seenCodes = new Set<string>();
  for (let r = headerIdx + 1; r < sheet.length; r++) {
    const email = cell(sheet, r, cols.email).toLowerCase();
    const fullName = cell(sheet, r, cols.name).replace(/\s+/g, ' ');
    const code = cell(sheet, r, cols.code).toUpperCase();
    const majorCode = cell(sheet, r, cols.major).toUpperCase();
    const cohort = cell(sheet, r, cols.cohort).toUpperCase();
    const enrollmentSemester = cell(sheet, r, cols.enroll).toUpperCase();
    const semRaw = cell(sheet, r, cols.sem);
    if (!email && !fullName && !code) continue;
    const add = (message: string) => problems.push({ row: r + 1, message });
    const phone = checkIdentity(email, fullName, cell(sheet, r, cols.phone), seenEmails, add);
    if (!code) add('Student code is required.');
    else if (!STUDENT_CODE_RE.test(code)) add(`Student code "${code}" must match campus (Q/D/H/S/C), group (E/S/A), cohort 01–22, and 4 digits (e.g. SE182965).`);
    else if (seenCodes.has(code)) add(`Student code "${code}" appears more than once in the file.`);
    else {
      seenCodes.add(code);
      const idCohort = `K${Number(code.slice(2, 4))}`;
      if (cohort && idCohort !== cohort) add(`Student code "${code}" cohort (${idCohort}) does not match "${cohort}".`);
    }
    let currentSemester: number | undefined;
    if (semRaw) {
      const n = Number(semRaw);
      if (!Number.isInteger(n) || n < 1) add(`Current semester must be a whole number >= 1 (found "${semRaw}").`);
      else currentSemester = n;
    }
    items.push({
      role: 'STUDENT', email, fullName, phone: phone || undefined, studentCode: code,
      majorCode: majorCode || undefined, cohort: cohort || undefined,
      enrollmentSemester: enrollmentSemester || undefined, currentSemester,
    });
  }
  if (items.length === 0 && problems.length === 0) problems.push({ row: null, message: 'No student rows found below the header row.' });
  return { items, problems };
}

export async function parseAdvisorImport(file: File): Promise<UserImportParseResult> {
  const sheet = await readWorkbook(file);
  if (!Array.isArray(sheet)) return { items: [], problems: [sheet] };
  const headerIdx = sheet.slice(0, 6).findIndex((row) => {
    const h = row ?? [];
    return findCol(h, EMAIL_KEYS) >= 0 && findCol(h, NAME_KEYS) >= 0;
  });
  if (headerIdx < 0) {
    return { items: [], problems: [{ row: null, message: 'Missing required advisor columns: Email and Full name.' }] };
  }
  const h = sheet[headerIdx];
  const cols = {
    email: findCol(h, EMAIL_KEYS), name: findCol(h, NAME_KEYS), phone: findCol(h, PHONE_KEYS),
    max: findCol(h, MAX_ADVISEES_KEYS), major: findCol(h, MAJOR_KEYS), cohort: findCol(h, COHORT_KEYS),
  };
  const items: UserImportItem[] = [];
  const problems: ImportProblem[] = [];
  const seenEmails = new Set<string>();
  for (let r = headerIdx + 1; r < sheet.length; r++) {
    const email = cell(sheet, r, cols.email).toLowerCase();
    const fullName = cell(sheet, r, cols.name).replace(/\s+/g, ' ');
    const maxRaw = cell(sheet, r, cols.max);
    const majorCode = cell(sheet, r, cols.major).toUpperCase();
    const cohort = cell(sheet, r, cols.cohort).toUpperCase();
    if (!email && !fullName) continue;
    const add = (message: string) => problems.push({ row: r + 1, message });
    const phone = checkIdentity(email, fullName, cell(sheet, r, cols.phone), seenEmails, add, true);
    let maxAdvisees: number | undefined;
    if (maxRaw) {
      const n = Number(maxRaw);
      if (!Number.isInteger(n) || n < 1) add(`Max advisees must be a whole number >= 1 (found "${maxRaw}").`);
      else maxAdvisees = n;
    }
    if ((majorCode && !cohort) || (!majorCode && cohort)) add('Provide both Major code and Cohort together (or leave both blank).');
    items.push({ role: 'ADVISOR', email, fullName, phone: phone || undefined, maxAdvisees, majorCode: majorCode || undefined, cohort: cohort || undefined });
  }
  if (items.length === 0 && problems.length === 0) problems.push({ row: null, message: 'No advisor rows found below the header row.' });
  return { items, problems };
}
