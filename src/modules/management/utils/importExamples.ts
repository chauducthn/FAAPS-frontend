import { buildXlsx, type XlsxRow } from '../../learning/utils/studyPlanXlsx';
import type { CourseCategory } from '../../academic/types/course';

const exampleCategory = (categories: CourseCategory[]) => categories[0]?.code ?? 'SE';

export function courseTableExample(categories: CourseCategory[]): Blob {
  const cat = exampleCategory(categories);
  const rows: XlsxRow[] = [
    ['Course code', 'Course name', 'Credits', 'Category', 'Prerequisites'],
    ['ABC101', 'Introduction to Programming', 3, cat, ''],
    ['ABC102', 'Object-Oriented Programming', 3, cat, 'ABC101'],
  ];
  return buildXlsx(rows, { sheetName: 'Courses', widths: [14, 36, 10, 14, 22] });
}

export function courseSyllabusExample(categories: CourseCategory[]): Blob {
  const cat = exampleCategory(categories);
  const rows: XlsxRow[] = [
    ['Subject Code:', 'ABC101'],
    ['Syllabus Name:', 'Introduction to Programming'],
    ['NoCredit:', 3],
    ['Category:', cat],
    ['Pre-Requisite:', ''],
    [],
    ['Subject Code:', 'ABC102'],
    ['Syllabus Name:', 'Object-Oriented Programming'],
    ['NoCredit:', 3],
    ['Category:', cat],
    ['Pre-Requisite:', 'ABC101'],
  ];
  return buildXlsx(rows, { sheetName: 'Syllabus', widths: [18, 40], header: false });
}

export function curriculumExample(): Blob {
  const rows: XlsxRow[] = [
    ['Course code', 'Semester', 'Mandatory', 'Group'],
    ['PRF192', 1, 'YES', ''],
    ['CSD201', 3, 'YES', ''],
    ['SWD392', 7, 'NO', 'Elective 1'],
  ];
  return buildXlsx(rows, { sheetName: 'Curriculum', widths: [14, 10, 12, 18] });
}
