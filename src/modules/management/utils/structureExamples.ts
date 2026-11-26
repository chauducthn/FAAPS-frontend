import { buildXlsx, type XlsxRow } from '../../learning/utils/studyPlanXlsx';

export function majorExample(): Blob {
  const rows: XlsxRow[] = [
    ['Major code', 'Major name', 'Total credits', 'Duration (years)', 'Status'],
    ['SE', 'Software Engineering', 145, 4, 'ACTIVE'],
    ['SS', 'Digital Marketing', 140, 4, 'ACTIVE'],
    ['AI', 'Artificial Intelligence', 145, 4, 'DRAFT'],
  ];
  return buildXlsx(rows, { sheetName: 'Majors', widths: [14, 30, 15, 18, 12] });
}

export function majorCohortExample(): Blob {
  const rows: XlsxRow[] = [
    [
      'Major code', 'Major name', 'Total credits', 'Duration (years)', 'Major status',
      'Cohort', 'Start semester', 'End semester', 'Cohort status', 'Is current',
    ],
    ['SE', 'Software Engineering', 145, 4, 'ACTIVE', 'K21', 'FA2025', 'FA2030', 'ACTIVE', 'NO'],
    ['SE', 'Software Engineering', 145, 4, 'ACTIVE', 'K22', 'FA2026', 'FA2031', 'ACTIVE', 'YES'],
    ['AI', 'Artificial Intelligence', 145, 4, 'ACTIVE', 'K21', 'FA2025', 'FA2030', 'ACTIVE', 'YES'],
  ];
  return buildXlsx(rows, {
    sheetName: 'Majors_Cohorts',
    widths: [14, 28, 14, 16, 14, 10, 16, 16, 14, 12],
  });
}

export function cohortExample(): Blob {
  const rows: XlsxRow[] = [
    ['Major code', 'Major name', 'Cohort', 'Start semester', 'End semester', 'Status', 'Is current'],
    ['SE', 'Software Engineering', 'K21', 'FA2025', 'FA2030', 'ACTIVE', 'NO'],
    ['AI', 'Artificial Intelligence', 'K21', 'FA2025', 'FA2030', 'ACTIVE', 'YES'],
  ];
  return buildXlsx(rows, { sheetName: 'Cohorts', widths: [14, 28, 10, 16, 16, 12, 12] });
}

export function cohortCurriculumExample(): Blob {
  const rows: XlsxRow[] = [
    [
      'Major code', 'Major name', 'Total credits', 'Duration (years)', 'Major status',
      'Cohort', 'Start semester', 'End semester', 'Cohort status', 'Is current',
      'Course code', 'Course credits', 'Term',
    ],
    ['SE', 'Software Engineering', 145, 4, 'ACTIVE', 'K21', 'FA2025', 'FA2030', 'ACTIVE', 'YES', 'PRF192', 3, 1],
    ['SE', 'Software Engineering', 145, 4, 'ACTIVE', 'K21', 'FA2025', 'FA2030', 'ACTIVE', 'YES', 'CSD201', 3, 3],
    ['SE', 'Software Engineering', 145, 4, 'ACTIVE', 'K21', 'FA2025', 'FA2030', 'ACTIVE', 'YES', 'SSL101c', 3, 1],
  ];
  return buildXlsx(rows, {
    sheetName: 'Cohorts_Curriculum',
    widths: [14, 28, 14, 16, 14, 10, 16, 16, 14, 12, 14, 15, 8],
  });
}
