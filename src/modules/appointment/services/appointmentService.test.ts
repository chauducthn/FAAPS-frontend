import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../shared/lib/apiClient';
import { appointmentService } from './appointmentService';

vi.mock('../../../shared/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));
vi.mock('../../../shared/lib/csrf', () => ({
  getCsrfHeaders: vi.fn().mockResolvedValue({}),
}));

describe('appointmentService — ticket ↔ appointment linking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 'appt-1' } });
  });

  it('sends advisingRequestId when the student books from a ticket', async () => {
    await appointmentService.bookAppointment({
      startTime: '2026-11-28T09:00:00',
      reason: 'Course selection review',
      advisingRequestId: 'ticket-1',
    });

    const [url, body] = vi.mocked(apiClient.post).mock.calls[0];
    expect(url).toBe('/student/appointments');
    expect(body).toEqual({
      startTime: '2026-11-28T09:00:00',
      reason: 'Course selection review',
      advisingRequestId: 'ticket-1',
    });
  });

  it('omits advisingRequestId for a standalone booking', async () => {
    await appointmentService.bookAppointment({
      startTime: '2026-11-28T09:00:00',
      reason: 'General question',
    });

    const [, body] = vi.mocked(apiClient.post).mock.calls[0];
    expect(body).not.toHaveProperty('advisingRequestId');
  });

  it('posts the advisor scheduling payload with the ticket id', async () => {
    await appointmentService.scheduleAppointmentForStudent({
      studentId: 'student-1',
      startTime: '2026-11-28T09:00:00',
      reason: 'Plan review',
      advisingRequestId: 'ticket-7',
    });

    const [url, body] = vi.mocked(apiClient.post).mock.calls[0];
    expect(url).toBe('/advisor/appointments');
    expect(body).toEqual({
      studentId: 'student-1',
      startTime: '2026-11-28T09:00:00',
      reason: 'Plan review',
      advisingRequestId: 'ticket-7',
    });
  });

  it('sends the chosen advisorId when the student books', async () => {
    await appointmentService.bookAppointment({
      advisorId: 'advisor-3',
      startTime: '2026-11-28T09:00:00',
      reason: 'Credit transfer review',
    });

    const [, body] = vi.mocked(apiClient.post).mock.calls[0];
    expect(body).toHaveProperty('advisorId', 'advisor-3');
  });

  it('fetches the list of bookable advisors', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [
        { id: 'a1', fullName: 'Advisor One', email: 'a1@fpt.vn', sameMajorGroup: true },
        { id: 'a2', fullName: 'Advisor Two', email: 'a2@fpt.vn' },
      ],
    } as never);

    const advisors = await appointmentService.getBookableAdvisors();

    expect(vi.mocked(apiClient.get).mock.calls[0][0]).toBe('/student/appointments/advisors');
    expect(advisors).toHaveLength(2);
    expect(advisors[0].sameMajorGroup).toBe(true);
  });

  it('unwraps a { data: [...] } advisor payload', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: [{ id: 'a1', fullName: 'Advisor One', email: null }] },
    } as never);

    const advisors = await appointmentService.getBookableAdvisors();

    expect(advisors).toHaveLength(1);
    expect(advisors[0].id).toBe('a1');
  });
});
