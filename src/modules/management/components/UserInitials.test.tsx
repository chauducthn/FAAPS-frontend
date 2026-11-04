import { describe, expect, it } from 'vitest';
import { initialsOf } from './UserInitials';

describe('initialsOf', () => {
  it('uses the first letter of the last two words', () => {
    expect(initialsOf('Hoang Minh Duc')).toBe('MD');
    expect(initialsOf('Minh Nhat')).toBe('MN');
  });

  it('ignores a bracketed suffix such as a cohort tag', () => {
    expect(initialsOf('Vo Kien Tuong (K18 HCM)')).toBe('KT');
  });

  it('keeps Vietnamese letters and falls back to ? when nothing is left', () => {
    expect(initialsOf('Nguyễn Minh Đức')).toBe('MĐ');
    expect(initialsOf('  ')).toBe('?');
    expect(initialsOf('(K18)')).toBe('?');
  });
});
