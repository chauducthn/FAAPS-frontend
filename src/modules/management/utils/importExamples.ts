import { buildXlsx, type XlsxRow } from '../../learning/utils/studyPlanXlsx';
import type { CourseCategory } from '../../academic/types/course';

const exampleCategory = (categories: CourseCategory[]) => categories[0]?.code ?? 'CORE';

export function courseTableExample(categories: CourseCategory[]): Blob {
  const cat = exampleCategory(categories);
  const rows: XlsxRow[] = [
    ['Course code', 'Course name', 'Credits', 'Category', 'Status', 'Material link', 'Prerequisites'],
    ['PRF192', 'Programming Fundamentals', 3, cat, 'ACTIVE', 'https://flm.fpt.edu.vn/syllabus/PRF192', ''],
    ['CSD201', 'Data Structures and Algorithms', 3, cat, 'ACTIVE', '', 'PRF192'],
    ['SSL101c', 'Academic Skills for University Success', 3, cat, 'INACTIVE', '', ''],
  ];
  return buildXlsx(rows, { sheetName: 'Courses', widths: [14, 36, 10, 14, 12, 38, 22] });
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
