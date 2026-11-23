import { describe, expect, it } from 'vitest';
import { buildXlsx, type XlsxRow } from '../../learning/utils/studyPlanXlsx';
import { readFirstSheet } from '../../../shared/lib/xlsxRead';
import {
  checkCourseImport,
  checkCurriculumImport,
  courseSyllabusExample,
  courseTableExample,
  curriculumExample,
} from './importChecks';

const categories = [{ id: 'c1', code: 'SE', name: 'Software Engineering' }];
const xlsx = (rows: XlsxRow[], name = 'file.xlsx') => new File([buildXlsx(rows)], name);
const fromBlob = (blob: Blob, name: string) => new File([blob], name);

describe('readFirstSheet', () => {
  it('reads back the text and numbers of a generated workbook', async () => {
    const rows = await readFirstSheet(xlsx([['Code', 'Credits'], ['PRF192', 3], [], ['', 'x']]));
    expect(rows[0]).toEqual(['Code', 'Credits']);
    expect(rows[1]).toEqual(['PRF192', '3']);
    expect(rows[3]).toEqual(['', 'x']);
  });

  it('writes a well-formed styles part (the server cannot read the file otherwise)', async () => {
    // Entries are stored uncompressed, so the XML can be cut out of the raw bytes.
    const text = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsText(buildXlsx([['a']]));
    });
    const styles = text.slice(text.indexOf('<styleSheet'), text.indexOf('</styleSheet>') + '</styleSheet>'.length);
    const doc = new DOMParser().parseFromString(styles, 'application/xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.getElementsByTagName('borders')).toHaveLength(1);
  });

  it('rejects a file that is not a workbook', async () => {
    await expect(readFirstSheet(new File(['hello'], 'a.xlsx'))).rejects.toThrow(/not a valid \.xlsx/);
  });
});

describe('course import check', () => {
  it('accepts both example sheets', async () => {
    expect(await checkCourseImport(fromBlob(courseTableExample(categories), 'a.xlsx'), categories)).toEqual({ rowCount: 2, problems: [] });
    expect(await checkCourseImport(fromBlob(courseSyllabusExample(categories), 'b.xlsx'), categories)).toEqual({ rowCount: 2, problems: [] });
  });

  it('flags credits outside 0/2/3/10, duplicates, missing fields and unknown categories by row', async () => {
    const file = xlsx([
      ['Course code', 'Course name', 'Credits', 'Category'],
      ['ABC101', 'One', 4, 'SE'],
      ['ABC101', 'Again', 3, 'SE'],
      ['ABC103', '', 'x', 'NOPE'],
    ]);
    const { problems } = await checkCourseImport(file, categories);
    expect(problems).toEqual([
      { row: 2, message: 'Credits must be 0, 2, 3 or 10 (found 4).' },
      { row: 3, message: 'Course code ABC101 appears more than once in the file.' },
      { row: 4, message: 'Course name is required.' },
      { row: 4, message: 'Credits must be a number.' },
      { row: 4, message: 'Category "NOPE" does not exist.' },
    ]);
  });

  it('checks credits in the syllabus layout too', async () => {
    const file = xlsx([['Subject Code:', 'OJT202'], ['Syllabus Name:', 'On the job training'], ['NoCredit:', 5]]);
    const { problems } = await checkCourseImport(file, categories);
    expect(problems).toEqual([{ row: 1, message: 'Credits must be 0, 2, 3 or 10 (found 5).' }]);
  });

  it('refuses CSV files and empty sheets', async () => {
    expect((await checkCourseImport(new File(['a,b'], 'a.csv'), categories)).problems[0].message).toMatch(/Excel file/);
    expect((await checkCourseImport(xlsx([['Course code', 'Course name']]), categories)).problems[0].message).toMatch(/No courses found/);
  });

  it('accepts every allowed credit value, including 0 and 10', async () => {
    const file = xlsx([['Course code', 'Course name', 'Credits'], ['ZZA100', 'Zero', 0], ['ZZA102', 'Two', 2], ['ZZA103', 'Three', 3], ['ZZA110', 'Ten', 10]]);
    expect(await checkCourseImport(file, categories)).toEqual({ rowCount: 4, problems: [] });
  });

  it('leaves .xls files to the server', async () => {
    expect(await checkCourseImport(new File(['x'], 'old.xls'), categories)).toEqual({ rowCount: 0, problems: [] });
  });
});

describe('curriculum import check', () => {
  it('accepts the example sheet', async () => {
    expect(await checkCurriculumImport(fromBlob(curriculumExample(), 'c.xlsx'))).toEqual({ rowCount: 3, problems: [] });
  });

  it('needs a header row and valid semester and mandatory values', async () => {
    const file = xlsx([
      ['PRF192', 1, 'YES'],
      ['CSD201', 10, 'YES'],
      ['CSD201', 2, 'maybe'],
    ]);
    const { problems } = await checkCurriculumImport(file);
    expect(problems.map((p) => [p.row, p.message.split(' (')[0]])).toEqual([
      [1, 'Row 1 must be the header'],
      [2, 'Semester must be a whole number from 1 to 9'],
      [3, 'Course CSD201 appears more than once in the file.'],
      [3, 'Mandatory must be YES or NO'],
    ]);
  });
});
