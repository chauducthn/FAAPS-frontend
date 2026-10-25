// src/components/advising/RequestTypeLabel.tsx
// Nhãn tiếng Việt cho loại yêu cầu tư vấn — dùng chung cho Student Portal và Advisor Portal.

import type { AdvisingRequestType } from '@/types/advising';

export const REQUEST_TYPE_LABELS: Record<AdvisingRequestType, string> = {
  PLAN_REVIEW: 'Duyệt kế hoạch học tập',
  COURSE_SELECTION: 'Chọn môn học',
  ACADEMIC_GUIDANCE: 'Hướng dẫn học thuật',
  GRADUATION_CHECK: 'Kiểm tra điều kiện tốt nghiệp',
  OTHER: 'Khác',
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
