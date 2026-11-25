// Checks an import spreadsheet in the browser before it is uploaded, and re-exports
// the example sheet builders. The rules follow how the backend reads each file
// (CourseImportService, CurriculumImportService), plus the catalogue rule that
// credits are one of CREDIT_OPTIONS (0, 2, 3 or 10).
import { readFirstSheet, XlsxReadError, type SheetRows } from '../../../shared/lib/xlsxRead';
import type { CourseCategory } from '../../academic/types/course';
import { CREDIT_OPTIONS, CREDIT_OPTIONS_MESSAGE } from '../../academic/validations/course.schema';

export { courseTableExample, courseSyllabusExample, curriculumExample } from './importExamples';

/** Whether an imported credits value is allowed. */
export const isAllowedCredits = (credits: number) => (CREDIT_OPTIONS as readonly number[]).includes(credits);

export interface ImportProblem {
  /** Spreadsheet row (1-based), or a course block number for the syllabus layout. Null for the whole file. */
  row: number | null;
  message: string;
}

export interface ImportCheck {
  /** Number of data rows (or course blocks) found. */
  rowCount: number;
  problems: ImportProblem[];
}

const cleanKey = (value: string) => value.trim().toLowerCase().replace(/[:：]+$/, '').trim();
const cell = (rows: SheetRows, r: number, c: number) => (c < 0 ? '' : (rows[r]?.[c] ?? '').trim());

const CODE_KEYS = ['subject code', 'subjectcode', 'course code', 'code', 'mã môn', 'mã học phần'];
const NAME_KEYS = ['course name english', 'course name', 'name', 'syllabus name', 'tên môn', 'tên học phần'];
const CREDIT_KEYS = ['nocredit', 'no credit', 'nocredits', 'no credits', 'credits', 'credit', 'tín chỉ', 'số tín chỉ'];
const CATEGORY_KEYS = ['category', 'category code', 'course category', 'khối kiến thức', 'department', 'chuyên ngành'];

const findCol = (header: string[], keys: string[]) => {
  const cleaned = header.map(cleanKey);
  for (const k of keys) {
    const i = cleaned.indexOf(k);
    if (i >= 0) return i;
  }
  return -1;
};

/** Whether a file can be read here; .xls (old binary Excel) is left to the server. */
export function isReadableXlsx(file: File) {
  return /\.xlsx$/i.test(file.name);
}

function checkExtension(file: File): ImportProblem | null {
  if (/\.(xlsx|xls)$/i.test(file.name)) return null;
  return { row: null, message: 'Upload an Excel file (.xlsx). Download the example sheet to start from the right layout.' };
}

async function read(file: File): Promise<SheetRows | ImportProblem> {
  try {
    return await readFirstSheet(file);
  } catch (error) {
    return { row: null, message: error instanceof XlsxReadError ? error.message : 'The file could not be read as an Excel workbook.' };
  }
}

interface CourseFields {
  row: number;
  code: string;
  name: string;
  credits: string;
  category: string;
}

function checkCourseRows(rows: CourseFields[], categories: CourseCategory[]): ImportProblem[] {
  const problems: ImportProblem[] = [];
  const known = new Set(categories.flatMap((c) => [c.code.toUpperCase(), c.name.toUpperCase()]));
  const seen = new Set<string>();
  for (const r of rows) {
    const add = (message: string) => problems.push({ row: r.row, message });
    if (!r.code) add('Course code is required.');
    else if (!/^[A-Za-z0-9_-]{2,20}$/.test(r.code)) add(`Course code "${r.code}" must be 2-20 letters, digits, dash or underscore.`);
    else if (seen.has(r.code.toUpperCase())) add(`Course code ${r.code.toUpperCase()} appears more than once in the file.`);
    else seen.add(r.code.toUpperCase());
    if (!r.name) add('Course name is required.');
    const credits = Number(r.credits);
    if (r.credits === '' || Number.isNaN(credits)) add('Credits must be a number.');
    else if (!isAllowedCredits(credits)) add(`${CREDIT_OPTIONS_MESSAGE} (found ${r.credits}).`);
    if (r.category && known.size > 0 && !known.has(r.category.toUpperCase())) add(`Category "${r.category}" does not exist.`);
  }
  return problems;
}

function extractSyllabusCourses(sheet: SheetRows): CourseFields[] {
  const blocks: Map<string, string>[] = [];
  let current = new Map<string, string>();
  for (let r = 0; r < sheet.length; r++) {
    const k = cleanKey(cell(sheet, r, 0));
    const v = cell(sheet, r, 1);
    if (!k && !v) {
      if (current.size) blocks.push(current);
      current = new Map();
      continue;
    }
    if (current.size && ['syllabus id', 'subject code', 'code', 'mã môn'].some((key) => k === key && current.has(key))) {
      blocks.push(current);
      current = new Map();
    }
    if (k) current.set(k, v);
  }
  if (current.size) blocks.push(current);
  const pick = (block: Map<string, string>, keys: string[]) =>
    keys.map((k) => block.get(k)).find((v) => v !== undefined)?.trim() ?? '';
  return blocks
    .map((block, i) => ({
      row: i + 1,
      code: pick(block, CODE_KEYS),
      name: pick(block, NAME_KEYS),
      credits: pick(block, CREDIT_KEYS),
      category: pick(block, CATEGORY_KEYS),
    }))
    .filter((c) => c.code || c.name);
}

/** Checks a course import file (table layout or syllabus block layout). */
export async function checkCourseImport(file: File, categories: CourseCategory[]): Promise<ImportCheck> {
  const bad = checkExtension(file);
  if (bad) return { rowCount: 0, problems: [bad] };
  if (!isReadableXlsx(file)) return { rowCount: 0, problems: [] };
  const sheet = await read(file);
  if (!Array.isArray(sheet)) return { rowCount: 0, problems: [sheet] };

  let courses: CourseFields[] = [];
  const headerRow = sheet.slice(0, 6).findIndex((row) => {
    const header = row ?? [];
    return findCol(header, CODE_KEYS) >= 0 && (findCol(header, NAME_KEYS) >= 0 || findCol(header, CREDIT_KEYS) >= 0);
  });

  if (headerRow >= 0) {
    const header = sheet[headerRow];
    const [codeCol, nameCol, creditCol, catCol] = [CODE_KEYS, NAME_KEYS, CREDIT_KEYS, CATEGORY_KEYS].map((k) => findCol(header, k));
    for (let r = headerRow + 1; r < sheet.length; r++) {
      const fields = { row: r + 1, code: cell(sheet, r, codeCol), name: cell(sheet, r, nameCol), credits: cell(sheet, r, creditCol), category: cell(sheet, r, catCol) };
      if (fields.code || fields.name) courses.push(fields);
    }
  } else {
    courses = extractSyllabusCourses(sheet);
  }

  if (courses.length === 0) {
    return {
      rowCount: 0,
      problems: [{ row: null, message: 'No courses found. Use a header row with Course code, Course name and Credits, or the syllabus layout from the example sheet.' }],
    };
  }
  return { rowCount: courses.length, problems: checkCourseRows(courses, categories) };
}

/** Checks a curriculum import file (row 1 header, columns A..D: code, semester, mandatory, group). */
export async function checkCurriculumImport(file: File): Promise<ImportCheck> {
  const bad = checkExtension(file);
  if (bad) return { rowCount: 0, problems: [bad] };
  if (!isReadableXlsx(file)) return { rowCount: 0, problems: [] };
  const sheet = await read(file);
  if (!Array.isArray(sheet)) return { rowCount: 0, problems: [sheet] };

  const problems: ImportProblem[] = [];
  if (!/code/i.test(cell(sheet, 0, 0))) {
    problems.push({ row: 1, message: 'Row 1 must be the header (Course code, Semester, Mandatory, Group). The first row is never imported.' });
  }
  const seen = new Set<string>();
  let rowCount = 0;
  for (let r = 1; r < sheet.length; r++) {
    const code = cell(sheet, r, 0).toUpperCase();
    if (!code) continue;
    rowCount++;
    const add = (message: string) => problems.push({ row: r + 1, message });
    if (seen.has(code)) add(`Course ${code} appears more than once in the file.`);
    seen.add(code);
    const semester = cell(sheet, r, 1);
    if (!/^\d+$/.test(semester) || Number(semester) < 1 || Number(semester) > 9) add(`Semester must be a whole number from 1 to 9 (found "${semester}").`);
    const mandatory = cell(sheet, r, 2).toUpperCase();
    if (mandatory && !['YES', 'NO', 'TRUE', 'FALSE'].includes(mandatory)) add(`Mandatory must be YES or NO (found "${cell(sheet, r, 2)}").`);
  }
  if (rowCount === 0) problems.push({ row: null, message: 'No courses found below the header row.' });
  return { rowCount, problems };
}
