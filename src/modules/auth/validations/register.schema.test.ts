import { describe, expect, it } from 'vitest';
import { registerSchema, phoneSchema, studentCodeSchema } from './register.schema';
import { isValidOptionalPhone, isValidStudentCode } from '../../../shared/validation/identity';

describe('identity input formats', () => {
  it('accepts current student IDs consistently', () => {
    expect(studentCodeSchema.parse(' se233333 ')).toBe('SE233333');
    expect(isValidStudentCode('ia173012')).toBe(true);
    expect(isValidStudentCode('SE12345')).toBe(false);
  });

  it('requires 8 to 15 phone digits even when formatting characters are present', () => {
    expect(phoneSchema.safeParse('').success).toBe(true);
    expect(phoneSchema.safeParse('+84 901 234 567').success).toBe(true);
    expect(phoneSchema.safeParse('........').success).toBe(false);
    expect(phoneSchema.safeParse('1234').success).toBe(false);
    expect(isValidOptionalPhone('0901234567')).toBe(true);
  });

  it('validates the registration password without restricting letters to ASCII', () => {
    const valid = {
      fullName: 'Pham Minh Nhat',
      studentCode: 'SE233333',
      dateOfBirth: '2005-03-14',
      email: 'student@fpt.edu.vn',
      phone: '',
      curriculumVersionId: 'curriculum-id',
      password: 'MậtKhẩu123',
      confirmPassword: 'MậtKhẩu123',
    };
    expect(registerSchema.safeParse(valid).success).toBe(true);
    expect(registerSchema.safeParse({ ...valid, password: 'abcdefgh', confirmPassword: 'abcdefgh' }).success).toBe(false);
  });
});
