import type { AiReportStatus } from '../../types/admin';

export const REPORT_PAGE_SIZE = 10;

export const REPORT_TABS: { value: AiReportStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

export const REPORT_TH_CLASS =
  'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

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
