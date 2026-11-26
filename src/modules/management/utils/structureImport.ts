import { readNamedSheets, XlsxReadError, type SheetRows } from '../../../shared/lib/xlsxRead';
import type { CreateMajorDto, MajorStatus } from '../../academic/types/major';
import type { CurriculumStatus } from '../../academic/types/curriculum';
import { CREDIT_OPTIONS_MESSAGE } from '../../academic/validations/course.schema';
import { currentSemesterOrdinal, MIN_END_TERM_GAP, semesterOrdinal } from '../components/curriculum/semesterRangeUtils';
import { detectFlmGroupSheetType, parseFlmGroupSheet, type PendingFlmGroup } from './flmGroupImport';
import { isAllowedCredits, type ImportProblem } from './importChecks';

export { majorExample, majorCohortExample, cohortExample, cohortCurriculumExample } from './structureExamples';
export type { PendingFlmGroup } from './flmGroupImport';

const MAJOR_CODE_RE = /^[A-Z][A-Z0-9]{1,5}$/;
const COHORT_RE = /^K(0[1-9]|[1-9]\d)$/;
const SEM_CODE_RE = /^(SP|SU|FA)\d{4}$/;

export type StructureImportMode = 'major_only' | 'cohort_only' | 'major_cohort' | 'major_cohort_curriculum' | 'flm_groups';
export interface PendingCohortRow {
  majorCode: string; majorName: string; majorId?: string; version: string;
  effectiveFromSemesterId?: string; effectiveToSemesterId?: string;
  startSemesterCode: string; endSemesterCode: string; isCurrent: boolean; status: CurriculumStatus;
}
export interface PendingCurriculumLink {
  majorCode: string; majorName: string; version: string; courseId: string; term: number;
}
export interface StructureParseResult {
  mode: StructureImportMode; majors: CreateMajorDto[]; cohorts: PendingCohortRow[];
  curriculumLinks: PendingCurriculumLink[]; flmGroups: PendingFlmGroup[]; problems: ImportProblem[];
}

const cell = (rows: SheetRows, r: number, c: number) => (c < 0 ? '' : (rows[r]?.[c] ?? '').trim());
const clean = (v: string) => v.trim().toLowerCase().replace(/[:：]+$/, '').trim();
const findCol = (h: string[], keys: string[]) => keys.map((k) => h.indexOf(k)).find((i) => i >= 0) ?? -1;

async function readAllSheets(file: File): Promise<{ sheets: Record<string, SheetRows> } | { problem: ImportProblem }> {
  if (!/\.xlsx$/i.test(file.name)) return { problem: { row: null, message: 'Upload an Excel file (.xlsx).' } };
  try { return { sheets: await readNamedSheets(file) }; }
  catch (error) { return { problem: { row: null, message: error instanceof XlsxReadError ? error.message : 'Could not read Excel workbook.' } }; }
}

export async function parseStructureImport(
  file: File, context: 'majors' | 'cohorts',
  existingMajors: { id: string; code: string; name: string }[],
  semesters: { id: string; code: string }[],
  activeCourses: { id: string; code: string; credits?: number }[] = [],
): Promise<StructureParseResult> {
  const empty = (msg: string, row: number | null = 1): StructureParseResult => ({
    mode: context === 'majors' ? 'major_only' : 'cohort_only',
    majors: [], cohorts: [], curriculumLinks: [], flmGroups: [], problems: [{ row, message: msg }],
  });
  const readRes = await readAllSheets(file);
  if ('problem' in readRes) return empty(readRes.problem.message, readRes.problem.row);
  const sheetsMap = readRes.sheets;
  const sheetEntries = Object.entries(sheetsMap);
  if (sheetEntries.length === 0) return empty('The workbook has no sheets.');

  const flmGroups: PendingFlmGroup[] = [];
  for (const [, sRows] of sheetEntries) {
    const gType = detectFlmGroupSheetType(sRows);
    if (gType) flmGroups.push(...parseFlmGroupSheet(sRows, gType));
  }
  const firstSheet = sheetEntries[0][1];
  if (detectFlmGroupSheetType(firstSheet)) {
    return { mode: 'flm_groups', majors: [], cohorts: [], curriculumLinks: [], flmGroups, problems: [] };
  }
  const sheet = sheetsMap.Curriculum ?? firstSheet;
  const header = (sheet[0] ?? []).map(clean);
  const codeCol = findCol(header, ['major code', 'major', 'code']);
  const nameCol = findCol(header, ['major name', 'name']);
  const credCol = findCol(header, ['total credits', 'credits', 'credit']);
  const durCol = findCol(header, ['duration (years)', 'duration', 'duration years']);
  const majorStatusCol = findCol(header, ['major status', 'status']);
  const cohortCol = findCol(header, ['cohort', 'version']);
  const startCol = findCol(header, ['start semester', 'start', 'effective from']);
  const endCol = findCol(header, ['end semester', 'end', 'effective to']);
  const cohortStatusCol = findCol(header, ['cohort status', 'status']);
  const currentCol = findCol(header, ['is current', 'current']);
  const courseCol = findCol(header, ['course code', 'subject code', 'course']);
  const courseCreditsCol = findCol(header, ['course credits', 'course credit']);
  const termCol = findCol(header, ['term', 'semester', 'semester number']);
  const hasCohort = cohortCol >= 0;
  const hasCourse = courseCol >= 0;
  const hasMajorDetails = credCol >= 0 || durCol >= 0 || findCol(header, ['major status']) >= 0;

  if (codeCol < 0 || (!hasCohort && nameCol < 0)) return empty('Row 1 must include "Major code" and "Major name" headers.');
  if (hasCohort && (startCol < 0 || endCol < 0)) return empty('Row 1 must include "Start semester" and "End semester" headers.');
  if (hasCourse && !hasCohort) return empty('Row 1 must include "Cohort", "Start semester", and "End semester" headers.');
  if (hasCourse && termCol < 0) return empty('Row 1 must include a "Term" (0–12) header when importing curriculum courses.');
  const mode: StructureImportMode = hasCourse ? 'major_cohort_curriculum' : hasCohort ? (hasMajorDetails ? 'major_cohort' : 'cohort_only') : 'major_only';

  const semByCode = new Map(semesters.map((s) => [s.code.toUpperCase(), s]));
  const courseByCode = new Map(activeCourses.map((c) => [c.code.toUpperCase(), c]));
  const majorsByCode = new Map<string, { id: string; code: string; name: string }[]>();
  for (const m of existingMajors) {
    const k = m.code.toUpperCase();
    majorsByCode.set(k, [...(majorsByCode.get(k) ?? []), m]);
  }
  const nowOrd = currentSemesterOrdinal();
  const majorsMap = new Map<string, CreateMajorDto>();
  const cohortsMap = new Map<string, PendingCohortRow>();
  const linkSeen = new Set<string>();
  const curriculumLinks: PendingCurriculumLink[] = [];
  const problems: ImportProblem[] = [];

  for (let r = 1; r < sheet.length; r++) {
    const majorCode = cell(sheet, r, codeCol).toUpperCase();
    const majorName = cell(sheet, r, nameCol);
    const version = hasCohort ? cell(sheet, r, cohortCol).toUpperCase() : '';
    const courseCode = hasCourse ? cell(sheet, r, courseCol).replace(/\s+/g, '') : '';
    if (!majorCode && !majorName && !version && !courseCode) continue;

    const rowNo = r + 1;
    const addErr = (message: string) => problems.push({ row: rowNo, message });

    let resolvedMajorName = majorName;
    let matchedExistingMajorId: string | undefined;

    if (mode === 'cohort_only') {
      const matches = majorsByCode.get(majorCode) ?? [];
      const match = majorName
        ? matches.find((m) => m.name.toLowerCase() === majorName.toLowerCase())
        : matches.length === 1 ? matches[0] : undefined;
      if (!match) {
        addErr(majorName
          ? `Major "${majorCode} — ${majorName}" does not exist.`
          : `Major "${majorCode}" not found or has multiple names; specify Major name.`);
      } else {
        resolvedMajorName = match.name;
        matchedExistingMajorId = match.id;
      }
    } else {
      if (!MAJOR_CODE_RE.test(majorCode)) addErr(`Major code "${majorCode}" must be 2–6 uppercase letters or digits starting with a letter (e.g. SE, EN, K1).`);
      if (!majorName) addErr('Major name is required.');
      const creditsRaw = cell(sheet, r, credCol);
      const totalCredits = creditsRaw === '' ? 140 : Number(creditsRaw);
      if (!Number.isInteger(totalCredits) || totalCredits <= 0) addErr(`Total credits must be a positive integer (found "${creditsRaw}").`);
      const durRaw = cell(sheet, r, durCol);
      const durationYears = durRaw === '' ? 4 : Number(durRaw);
      if (Number.isNaN(durationYears) || durationYears <= 0) addErr(`Duration must be a positive number (found "${durRaw}").`);
      const statusRaw = (cell(sheet, r, majorStatusCol) || 'ACTIVE').toUpperCase();
      if (!['ACTIVE', 'DRAFT', 'INACTIVE'].includes(statusRaw)) addErr(`Major status must be ACTIVE, DRAFT, or INACTIVE (found "${statusRaw}").`);
      const mKey = `${majorCode}::${majorName.toLowerCase()}`;
      if (majorCode && majorName && !majorsMap.has(mKey)) {
        majorsMap.set(mKey, { code: majorCode, name: majorName, description: '', totalCredits, durationYears, cohort: '', status: statusRaw as MajorStatus });
      }
    }

    if (hasCohort && version) {
      if (!COHORT_RE.test(version)) addErr(`Cohort "${version}" must be K followed by 01–99 (e.g. K19).`);
      const startCode = cell(sheet, r, startCol).toUpperCase();
      const endCode = cell(sheet, r, endCol).toUpperCase();
      const startSem = semByCode.get(startCode);
      const endSem = semByCode.get(endCode);
      if (!SEM_CODE_RE.test(startCode)) addErr(`Start semester "${startCode}" must be SP, SU, or FA + 4-digit year (e.g. FA2021).`);
      if (!SEM_CODE_RE.test(endCode)) addErr(`End semester "${endCode}" must be SP, SU, or FA + 4-digit year (e.g. FA2030).`);
      const sOrd = semesterOrdinal(startCode);
      const eOrd = semesterOrdinal(endCode);
      if (eOrd !== null && eOrd < nowOrd) addErr(`End semester "${endCode}" cannot be in the past.`);
      if (sOrd !== null && eOrd !== null && eOrd - sOrd < MIN_END_TERM_GAP) addErr(`End semester "${endCode}" must be at least ${MIN_END_TERM_GAP} terms after "${startCode}".`);
      const cStatus = (cell(sheet, r, cohortStatusCol) || 'ACTIVE').toUpperCase();
      if (!['ACTIVE', 'INACTIVE'].includes(cStatus)) addErr(`Cohort status must be ACTIVE or INACTIVE (found "${cStatus}").`);
      const curRaw = cell(sheet, r, currentCol).toUpperCase();
      const isCurrent = ['YES', 'TRUE', '1'].includes(curRaw);
      if (curRaw && !['YES', 'NO', 'TRUE', 'FALSE', '1', '0'].includes(curRaw)) addErr(`Is current must be YES or NO (found "${curRaw}").`);
      if (isCurrent && cStatus !== 'ACTIVE') addErr('Inactive cohort cannot be marked as current.');

      const cKey = `${majorCode}::${resolvedMajorName.toLowerCase()}::${version}`;
      if (SEM_CODE_RE.test(startCode) && SEM_CODE_RE.test(endCode) && resolvedMajorName && !cohortsMap.has(cKey)) {
        cohortsMap.set(cKey, {
          majorCode, majorName: resolvedMajorName, majorId: matchedExistingMajorId, version,
          effectiveFromSemesterId: startSem?.id, effectiveToSemesterId: endSem?.id,
          startSemesterCode: startCode, endSemesterCode: endCode, isCurrent, status: cStatus as CurriculumStatus,
        });
      }
    } else if (hasCohort && mode === 'cohort_only') addErr('Cohort is required.');

    if (hasCourse && courseCode) {
      const course = courseByCode.get(courseCode.toUpperCase());
      if (!course) addErr(`Course "${courseCode}" not found or inactive in Course pool.`);
      if (courseCreditsCol >= 0) {
        const ccRaw = cell(sheet, r, courseCreditsCol);
        const ccNum = Number(ccRaw);
        if (ccRaw === '' || !Number.isInteger(ccNum) || !isAllowedCredits(ccNum)) addErr(`Course credits: ${CREDIT_OPTIONS_MESSAGE} (found "${ccRaw}").`);
      }
      const termRaw = cell(sheet, r, termCol);
      const term = Number(termRaw);
      if (!/^\d+$/.test(termRaw) || term < 0 || term > 12) addErr(`Term must be an integer from 0 to 12 (found "${termRaw}").`);
      if (!version) addErr('Cohort is required when assigning a course to a curriculum.');
      if (course && version && resolvedMajorName && term >= 0 && term <= 12) {
        const lKey = `${majorCode}::${resolvedMajorName.toLowerCase()}::${version}::${course.id}`;
        if (!linkSeen.has(lKey)) { linkSeen.add(lKey); curriculumLinks.push({ majorCode, majorName: resolvedMajorName, version, courseId: course.id, term }); }
      }
    }
  }
  if (majorsMap.size === 0 && cohortsMap.size === 0 && flmGroups.length === 0 && problems.length === 0) {
    problems.push({ row: null, message: 'No data rows found below the header row.' });
  }
  return { mode, majors: Array.from(majorsMap.values()), cohorts: Array.from(cohortsMap.values()), curriculumLinks, flmGroups, problems };
}
