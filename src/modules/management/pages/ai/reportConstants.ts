import type { AiReportStatus } from '../../types/admin';

export const REPORT_PAGE_SIZE = 10;

export const REPORT_TABS: { value: AiReportStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

/** Human-readable labels for AI report reason enum codes returned by the backend. */
export const REASON_LABEL: Record<string, string> = {
  HALLUCINATION: 'Hallucination',
  OUTDATED_CURRICULUM: 'Outdated curriculum',
  IRRELEVANT_ANSWER: 'Irrelevant answer',
  INCOMPLETE_INFORMATION: 'Incomplete information',
  WRONG_COURSE_CODE: 'Wrong course code',
  MISSING_SOURCE: 'Missing source',
  POLICY_MISREAD: 'Policy misread',
};
