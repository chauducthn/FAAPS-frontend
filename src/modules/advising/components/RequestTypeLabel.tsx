// src/components/advising/RequestTypeLabel.tsx
// Nhãn tiếng Việt cho loại yêu cầu tư vấn — dùng chung cho Student Portal và Advisor Portal.

import type { AdvisingRequestType } from '@/modules/advising/types/advising';

export const REQUEST_TYPE_LABELS: Record<AdvisingRequestType, string> = {
  PLAN_REVIEW: 'Study plan review',
  COURSE_SELECTION: 'Course selection',
  ACADEMIC_GUIDANCE: 'Academic guidance',
  GRADUATION_CHECK: 'Graduation eligibility check',
  OTHER: 'Other',
};

export function RequestTypeLabel({
  requestType,
  className,
}: {
  requestType: AdvisingRequestType;
  className?: string;
}) {
  return (
    <span className={className}>{REQUEST_TYPE_LABELS[requestType] ?? REQUEST_TYPE_LABELS.OTHER}</span>
  );
}
