import type { SheetRows } from '../../../shared/lib/xlsxRead';

export interface PendingFlmGroupCourse {
  courseCode: string;
  courseName: string;
  term: number;
  note?: string;
}

export interface PendingFlmGroup {
  groupType: 'COMBO' | 'ELECTIVE';
  externalId?: string;
  groupCode: string;
  groupName: string;
  curriculumCodes?: string;
  courses: PendingFlmGroupCourse[];
}

const cell = (rows: SheetRows, r: number, c: number) => (c < 0 ? '' : (rows[r]?.[c] ?? '').trim());
const clean = (v: string) => v.trim().toLowerCase().replace(/[:：]+$/, '').trim();
const findCol = (header: string[], keys: string[]) => keys.map((k) => header.indexOf(k)).find((i) => i >= 0) ?? -1;

/** Detects whether a sheet is an FLM Combos or Electives sheet exported by FAAPS FLM Exporter. */
export function detectFlmGroupSheetType(sheet: SheetRows): 'COMBO' | 'ELECTIVE' | null {
  const header = (sheet[0] ?? []).map(clean);
  if (findCol(header, ['combo code']) >= 0 && findCol(header, ['subject code', 'course code']) >= 0) return 'COMBO';
  if (findCol(header, ['elective id', 'group code']) >= 0 && findCol(header, ['subject code', 'course code']) >= 0) return 'ELECTIVE';
  return null;
}

export function parseFlmGroupSheet(sheet: SheetRows, groupType: 'COMBO' | 'ELECTIVE'): PendingFlmGroup[] {
  const header = (sheet[0] ?? []).map(clean);
  const idCol = findCol(header, groupType === 'COMBO' ? ['combo id', 'id'] : ['elective id', 'id']);
  const codeCol = findCol(header, groupType === 'COMBO' ? ['combo code'] : ['group code', 'elective code']);
  const nameCol = findCol(header, groupType === 'COMBO' ? ['combo name'] : ['elective name', 'group name']);
  const curCol = findCol(header, ['curriculums', 'curriculum codes', 'curriculum']);
  const subCodeCol = findCol(header, ['subject code', 'course code']);
  const subNameCol = findCol(header, ['subject name', 'course name']);
  const termCol = findCol(header, ['term', 'semester']);
  const noteCol = findCol(header, ['note']);

  const map = new Map<string, PendingFlmGroup>();
  for (let r = 1; r < sheet.length; r++) {
    const groupCode = cell(sheet, r, codeCol);
    if (!groupCode) continue;
    const key = `${groupType}::${groupCode.toUpperCase()}`;
    let group = map.get(key);
    if (!group) {
      group = {
        groupType,
        externalId: cell(sheet, r, idCol) || undefined,
        groupCode,
        groupName: cell(sheet, r, nameCol) || groupCode,
        curriculumCodes: cell(sheet, r, curCol) || undefined,
        courses: [],
      };
      map.set(key, group);
    }
    const courseCode = cell(sheet, r, subCodeCol);
    if (courseCode && !group.courses.some((c) => c.courseCode.toUpperCase() === courseCode.toUpperCase())) {
      const termNum = Number(cell(sheet, r, termCol));
      group.courses.push({
        courseCode,
        courseName: cell(sheet, r, subNameCol) || courseCode,
        term: Number.isInteger(termNum) && termNum >= 0 && termNum <= 12 ? termNum : 0,
        note: cell(sheet, r, noteCol) || undefined,
      });
    }
  }
  return Array.from(map.values());
}
