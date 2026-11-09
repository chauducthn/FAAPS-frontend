import { describe, expect, it } from 'vitest';
import { nextAppointment } from './UpcomingAppointmentCard';
import type { BookedAppointment } from '../../appointment/types/appointment';

const make = (id: string, start: string, end: string, status: BookedAppointment['status']): BookedAppointment => ({
  id,
  studentId: 's',
  studentName: 'Student',
  studentCode: null,
  advisorId: 'a',
  advisorName: 'Advisor',
  startTime: start,
  endTime: end,
  reason: '',
  status,
  decisionNote: null,
  consultationSummary: null,
  createdAt: '2026-11-01T00:00:00',
});

describe('nextAppointment', () => {
  const now = new Date('2026-11-10T10:00:00').getTime();

  it('picks the earliest open appointment that is not over yet', () => {
    const items = [
      make('late', '2026-11-20T09:00:00', '2026-11-20T09:30:00', 'ACCEPTED'),
      make('soon', '2026-11-12T09:00:00', '2026-11-12T09:30:00', 'PENDING'),
    ];
    expect(nextAppointment(items, now)?.id).toBe('soon');
  });

  it('ignores past, cancelled, rejected and completed appointments', () => {
    const items = [
      make('past', '2026-11-01T09:00:00', '2026-11-01T09:30:00', 'ACCEPTED'),
      make('cancelled', '2026-11-12T09:00:00', '2026-11-12T09:30:00', 'CANCELLED'),
      make('rejected', '2026-11-13T09:00:00', '2026-11-13T09:30:00', 'REJECTED'),
      make('done', '2026-11-14T09:00:00', '2026-11-14T09:30:00', 'COMPLETED'),
    ];
    expect(nextAppointment(items, now)).toBeNull();
  });
});
