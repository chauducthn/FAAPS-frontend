import { describe, expect, it } from 'vitest';
import { isSameMajorGroup, type AdvisorOption } from './advisorOption';

const base: AdvisorOption = {
  id: 'a1',
  fullName: 'Advisor A',
  email: 'a@fpt.vn',
};

describe('isSameMajorGroup', () => {
  it('is true when the backend flags the advisor as the same major group', () => {
    expect(isSameMajorGroup({ ...base, sameMajorGroup: true })).toBe(true);
  });

  it('is false when the flag is absent', () => {
    expect(isSameMajorGroup(base)).toBe(false);
  });

  it('is false when the flag is explicitly false', () => {
    expect(isSameMajorGroup({ ...base, sameMajorGroup: false })).toBe(false);
  });

  it('accepts an alternative field name for the same flag', () => {
    expect(isSameMajorGroup({ ...base, sameMajorGroupCode: true } as AdvisorOption)).toBe(true);
  });

  it('never treats a truthy non-boolean value as a match', () => {
    expect(isSameMajorGroup({ ...base, sameMajorGroup: 'false' } as unknown as AdvisorOption)).toBe(false);
  });

  it('handles a missing advisor', () => {
    expect(isSameMajorGroup(null)).toBe(false);
    expect(isSameMajorGroup(undefined)).toBe(false);
  });
});
