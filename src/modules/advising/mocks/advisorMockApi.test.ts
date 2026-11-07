// src/modules/advising/mocks/advisorMockApi.test.ts
// Kiểm chứng lớp mock in-memory của Advisor: mọi mutation phải ghi được vào
// store và đọc lại được đúng — đây là điều kiện để UI cập nhật ngay sau invalidate.

import { beforeEach, describe, expect, it } from 'vitest';
import {
  MOCK_ADVISING_REQUESTS,
  MOCK_ADVISING_MESSAGES,
  MOCK_APPOINTMENTS,
  MOCK_AVAILABILITY,
  MOCK_STUDY_PLANS,
  resetAdvisorMockData,
} from './advisorMockData';
import {
  mockConfigureAvailability,
  mockDecideStudyPlan,
  mockGetAdvisingRequests,
  mockGetConversationDetail,
  mockGetStudyPlanDetail,
  mockListStudyPlans,
  mockReplyToConversation,
  mockSetConversationStatus,
  mockUpdateAppointmentStatus,
  mockUpdateRequestStatus,
} from './advisorMockApi';

describe('advisor mock store', () => {
  beforeEach(() => {
    resetAdvisorMockData();
  });

  describe('advising requests', () => {
    it('accepts a request by moving it to RESOLVED', () => {
      const updated = mockUpdateRequestStatus('req-001', { status: 'RESOLVED' });
      expect(updated.status).toBe('RESOLVED');
      expect(updated.resolvedAt).not.toBeNull();
      expect(mockGetAdvisingRequests().find((r) => r.id === 'req-001')?.status).toBe('RESOLVED');
    });

    it('rejects a request only with a reason', () => {
      expect(() => mockUpdateRequestStatus('req-001', { status: 'CANCELLED' })).toThrow(/reason/i);
      const updated = mockUpdateRequestStatus('req-001', {
        status: 'CANCELLED',
        resolutionSummary: 'Em cần trao đổi trực tiếp với giảng viên trước.',
      });
      expect(updated.status).toBe('CANCELLED');
      expect(updated.resolutionSummary).toContain('trao đổi');
    });

    it('marks a request in progress', () => {
      const updated = mockUpdateRequestStatus('req-002', { status: 'IN_PROGRESS' });
      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.resolvedAt).toBeNull();
    });
  });

  describe('advising conversations', () => {
    it('appends a public reply to the thread', () => {
      const before = mockGetConversationDetail('req-001').messages.length;
      const detail = mockReplyToConversation('req-001', 'Anh duyệt kế hoạch nhé.');
      expect(detail.messages).toHaveLength(before + 1);
      expect(detail.messages.at(-1)?.content).toBe('Anh duyệt kế hoạch nhé.');
      expect(detail.messages.at(-1)?.internal).toBe(false);
    });

    it('appends an internal note without marking it public', () => {
      const detail = mockReplyToConversation('req-001', 'Ghi chú nội bộ', true);
      expect(detail.messages.at(-1)?.internal).toBe(true);
      expect(MOCK_ADVISING_MESSAGES['req-001']?.at(-1)?.internal).toBe(true);
    });

    it('requires a resolution summary to resolve', () => {
      expect(() => mockSetConversationStatus('req-001', 'RESOLVED')).toThrow(/summary/i);
      const detail = mockSetConversationStatus('req-001', 'RESOLVED', 'Đã duyệt 18 tín chỉ.');
      expect(detail.request.status).toBe('RESOLVED');
      expect(detail.request.resolutionSummary).toBe('Đã duyệt 18 tín chỉ.');
    });

    it('moves a pending request to in-progress after a public reply', () => {
      const detail = mockReplyToConversation('req-002', 'Chào em, anh đã nhận.');
      expect(detail.request.status).toBe('IN_PROGRESS');
    });
  });

  describe('appointments', () => {
    it('accepts, cancels and completes appointments with the right guards', () => {
      expect(() => mockUpdateAppointmentStatus('apt-001', { status: 'REJECTED' })).toThrow(/reason/i);
      expect(() => mockUpdateAppointmentStatus('apt-001', { status: 'COMPLETED' })).toThrow(/summary/i);

      mockUpdateAppointmentStatus('apt-001', { status: 'ACCEPTED' });
      expect(MOCK_APPOINTMENTS.find((a) => a.id === 'apt-001')?.status).toBe('ACCEPTED');

      mockUpdateAppointmentStatus('apt-002', { status: 'CANCELLED', reason: 'Sinh viên có việc đột xuất.' });
      expect(MOCK_APPOINTMENTS.find((a) => a.id === 'apt-002')?.decisionNote).toContain('đột xuất');

      mockUpdateAppointmentStatus('apt-004', { status: 'COMPLETED', consultationSummary: 'Đã tư vấn xong.' });
      expect(MOCK_APPOINTMENTS.find((a) => a.id === 'apt-004')?.consultationSummary).toBe('Đã tư vấn xong.');

      mockUpdateAppointmentStatus('apt-005', { status: 'NO_SHOW' });
      expect(MOCK_APPOINTMENTS.find((a) => a.id === 'apt-005')?.status).toBe('NO_SHOW');
    });
  });

  describe('availability', () => {
    it('adds, edits and removes slots in the weekly template', () => {
      mockConfigureAvailability([
        { dayOfWeek: 2, startTime: '13:00', endTime: '15:00' },
        { dayOfWeek: 1, startTime: '09:00', endTime: '11:00' },
      ]);
      expect(MOCK_AVAILABILITY).toHaveLength(2);
      // Đã sắp xếp theo thứ tự ngày.
      expect(MOCK_AVAILABILITY[0].dayOfWeek).toBe(1);

      mockConfigureAvailability([]);
      expect(MOCK_AVAILABILITY).toHaveLength(0);
    });

    it('rejects a slot that ends before it starts', () => {
      expect(() =>
        mockConfigureAvailability([{ dayOfWeek: 1, startTime: '11:00', endTime: '09:00' }]),
      ).toThrow(/end after it starts/i);
    });
  });

  describe('study plan reviews', () => {
    it('approves a plan', () => {
      const detail = mockDecideStudyPlan('plan-001', 'APPROVED', 'Cân bằng tải tín chỉ tốt.');
      expect(detail.plan.header.status).toBe('APPROVED');
      expect(detail.plan.header.reviewNotes).toBe('Cân bằng tải tín chỉ tốt.');
      expect(MOCK_STUDY_PLANS.find((p) => p.id === 'plan-001')?.status).toBe('APPROVED');
    });

    it('requires a comment to reject or request a revision', () => {
      expect(() => mockDecideStudyPlan('plan-001', 'REJECTED', '  ')).toThrow(/comment/i);
      expect(() => mockDecideStudyPlan('plan-001', 'NEEDS_REVISION', '')).toThrow(/comment/i);

      mockDecideStudyPlan('plan-002', 'NEEDS_REVISION', 'Hãy bỏ OJT401 rồi nộp lại.');
      expect(MOCK_STUDY_PLANS.find((p) => p.id === 'plan-002')?.status).toBe('NEEDS_REVISION');
    });

    it('filters the plan list by status', () => {
      const submitted = mockListStudyPlans('SUBMITTED');
      expect(submitted.items.length).toBeGreaterThan(0);
      expect(submitted.items.every((p) => p.status === 'SUBMITTED')).toBe(true);

      const all = mockListStudyPlans('ALL', 0, 100);
      expect(all.totalElements).toBe(MOCK_STUDY_PLANS.length);
    });

    it('exposes plan courses for the review modal', () => {
      const detail = mockGetStudyPlanDetail('plan-001');
      expect(detail.plan.courses.length).toBeGreaterThan(0);
      expect(detail.plan.header.totalCredits).toBeGreaterThan(0);
    });
  });
});
