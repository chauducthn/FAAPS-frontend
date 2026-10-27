import { describe, expect, it } from 'vitest';
import { fromDateKey, slotDurationMinutes, startOfWeek, toDateKey, toIsoLocal, weekDateKeys } from './appointmentDate';

describe('appointment date helpers', () => {
  it('round-trips local date keys', () => {
    expect(toDateKey(fromDateKey('2026-10-27'))).toBe('2026-10-27');
  });

  it('builds a Monday-to-Sunday week', () => {
    const date = fromDateKey('2026-10-29');
    expect(toDateKey(startOfWeek(date))).toBe('2026-10-26');
    expect(weekDateKeys(date)).toEqual([
      '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29',
      '2026-10-30', '2026-10-31', '2026-11-01',
    ]);
  });

  it('formats backend local date-time and rejects invalid durations', () => {
    const date = new Date(2026, 9, 27, 9, 30);
    expect(toIsoLocal(date)).toBe('2026-10-27T09:30:00');
    expect(slotDurationMinutes('2026-10-27T09:00:00', '2026-10-27T09:30:00')).toBe(30);
    expect(slotDurationMinutes('2026-10-27T10:00:00', '2026-10-27T09:30:00')).toBeNull();
  });
});
