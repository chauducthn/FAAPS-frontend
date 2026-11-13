import { describe, expect, it } from 'vitest';
import { dateOfBirthSchema, passwordContainsPersonalInfo, passwordSchema, phoneSchema, studentCodeSchema } from './register.schema';

describe('Student ID', () => {
  it.each(['SE190001', 'ss010293', 'AI220999', ' se170001 '])('accepts %s', (value) => {
    expect(studentCodeSchema.safeParse(value).success).toBe(true);
  });

  it.each(['SE000001', 'SE230001', 'SE99001', 'S1190001', 'SE19000', 'SEA90001', '12345678'])('rejects %s', (value) => {
    expect(studentCodeSchema.safeParse(value).success).toBe(false);
  });
});

describe('phone', () => {
  it.each(['0901234567', '0381234567', '0771234567', '0851234567', '0561234567'])('accepts %s', (value) => {
    expect(phoneSchema.safeParse(value).success).toBe(true);
  });

  it.each(['', '+84901234567', '0123456789', '090123456', '09012345678', '0901 234 567', 'abcdefghij'])('rejects %s', (value) => {
    expect(phoneSchema.safeParse(value).success).toBe(false);
  });
});

describe('date of birth', () => {
  const yearsAgo = (years: number) => `${new Date().getFullYear() - years}-01-01`;

  it('accepts a student who is old enough', () => {
    expect(dateOfBirthSchema.safeParse(yearsAgo(20)).success).toBe(true);
  });

  it('rejects someone born 14 years ago, impossible for a university student', () => {
    expect(dateOfBirthSchema.safeParse(yearsAgo(14)).success).toBe(false);
  });
});

describe('password', () => {
  it('needs lowercase, uppercase, digit, special character and 8 characters', () => {
    expect(passwordSchema.safeParse('Secret@123').success).toBe(true);
    for (const weak of ['secret@123', 'SECRET@123', 'Secret@abc', 'Secret123', 'Sec@1']) {
      expect(passwordSchema.safeParse(weak).success).toBe(false);
    }
  });

  const person = { studentCode: 'SE190001', fullName: 'Nguyễn Văn An', email: 'an.nguyen@fpt.edu.vn' };

  it('rejects passwords containing the Student ID, a name part or the email name', () => {
    expect(passwordContainsPersonalInfo('Xx@se190001', person)).toBe(true);
    expect(passwordContainsPersonalInfo('Xx@190001!', person)).toBe(true);
    expect(passwordContainsPersonalInfo('Nguyen@2024', person)).toBe(true);
    expect(passwordContainsPersonalInfo('Hello@NGUYỄN1', person)).toBe(true);
    expect(passwordContainsPersonalInfo('An.Nguyen#1', person)).toBe(true);
  });

  it('accepts passwords that share only a short fragment with the profile', () => {
    expect(passwordContainsPersonalInfo('Tr0ub@dor&3', person)).toBe(false);
    expect(passwordContainsPersonalInfo('Plan@2024x', person)).toBe(false);
  });
});
