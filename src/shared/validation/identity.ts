/** Identity field rules shared by registration, Admin, and profile forms. */
export const STUDENT_CODE_PATTERN = /^[A-Z]{2}[0-9]{6}$/;
export const PHONE_PATTERN = /^(?=(?:\D*\d){8,15}\D*$)\+?[0-9 .()-]{8,20}$/;

export const normalizeStudentCode = (value: string) => value.trim().toUpperCase();
export const isValidStudentCode = (value: string) =>
  STUDENT_CODE_PATTERN.test(normalizeStudentCode(value));
export const isValidOptionalPhone = (value: string) =>
  value.trim() === '' || PHONE_PATTERN.test(value.trim());
