import { describe, expect, it } from 'vitest';
import { addSemesters, currentSemesterCode, estimateGraduation } from './expectedGraduation';

const semesters = [
  { id: 's1', code: 'SP2026', startDate: '2026-01-05' },
  { id: 's2', code: 'SU2026', startDate: '2026-05-04' },
  { id: 's3', code: 'FA2026', startDate: '2026-09-07' },
  { id: 's4', code: 'FA2028', startDate: '2028-09-04' },
];

describe('addSemesters', () => {
  it('walks Spring, Summer, Fall and rolls over the year', () => {
    expect(addSemesters('FA2026', 1)).toBe('SP2027');
    expect(addSemesters('SP2026', 2)).toBe('FA2026');
    expect(addSemesters('FA2026', 0)).toBe('FA2026');
    expect(addSemesters('FA2026', 6)).toBe('FA2028');
  });

  it('rejects a code that is not a semester', () => {
    expect(addSemesters('K19', 1)).toBeNull();
  });
});

describe('estimateGraduation', () => {
  it('puts a first-semester student a full curriculum away, never next summer', () => {
    const result = estimateGraduation({
      enrollmentCode: 'FA2026',
      currentCode: 'FA2026',
      currentSemester: 1,
      curriculumSemesters: 9,
      semesters,
    });
    expect(result).toEqual({ code: 'SU2029', semesterId: null, delaySemesters: 0 });
  });

  it('returns the catalogue semester when it already exists', () => {
    const result = estimateGraduation({
      enrollmentCode: 'FA2026',
      currentCode: 'FA2026',
      currentSemester: 1,
      curriculumSemesters: 7,
      semesters,
    });
    expect(result).toEqual({ code: 'FA2028', semesterId: 's4', delaySemesters: 0 });
  });

  it('moves the graduation back for a student who is behind the normal pace', () => {
    // Enrolled in SP2026, now FA2026 (3rd semester since enrollment) but only in semester 1: two terms late.
    const result = estimateGraduation({
      enrollmentCode: 'SP2026',
      currentCode: 'FA2026',
      currentSemester: 1,
      curriculumSemesters: 9,
      semesters,
    });
    expect(result?.delaySemesters).toBe(2);
    expect(result?.code).toBe(addSemesters('SP2026', 8 + 2));
  });

  it('does not run early for a student who is ahead', () => {
    const result = estimateGraduation({
      enrollmentCode: 'SP2026',
      currentCode: 'SU2026',
      currentSemester: 5,
      curriculumSemesters: 9,
      semesters,
    });
    expect(result?.delaySemesters).toBe(0);
  });

  it('is unknown while the curriculum or the enrollment semester is missing', () => {
    expect(
      estimateGraduation({ enrollmentCode: undefined, currentCode: 'FA2026', currentSemester: 1, curriculumSemesters: 9, semesters }),
    ).toBeNull();
    expect(
      estimateGraduation({ enrollmentCode: 'FA2026', currentCode: 'FA2026', currentSemester: 1, curriculumSemesters: 0, semesters }),
    ).toBeNull();
  });
});

describe('currentSemesterCode', () => {
  it('is the last semester that has already started', () => {
    expect(currentSemesterCode(semesters, new Date('2026-06-01'))).toBe('SU2026');
    expect(currentSemesterCode(semesters, new Date('2026-09-10'))).toBe('FA2026');
  });
});
