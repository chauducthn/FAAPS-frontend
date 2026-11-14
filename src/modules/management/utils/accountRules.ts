// Business rules for FAAPS accounts.
//
// The admin console is the only place where these formats are entered, so the
// rules live in one module: the create/edit modal, the role-change dialog and
// the mock data all read them from here. Changing a rule means changing it
// once.

import { STUDENT_CODE_PATTERN } from '../../auth/validations/register.schema';

export type AccountRole = 'STUDENT' | 'ADVISOR';

/**
 * `SE173012` — two letters for the major, the cohort (01 to 22) and four digits. The same rule as the registration
 * page and the backend, so an ID the form accepts is never refused when it is saved.
 */
export const STUDENT_ID_PATTERN = STUDENT_CODE_PATTERN;

/** `ADV001` — three digits after the `ADV` prefix. */
export const ADVISOR_CODE_PATTERN = /^ADV\d{3}$/;

/** Vietnamese mobile numbers: 10 digits, starting with 03, 05, 07, 08 or 09. */
export const PHONE_PATTERN = /^(0[35789])\d{8}$/;

/** The two FPT mail domains a FAAPS account may use. */
export const FPT_DOMAIN = 'fpt.edu.vn';
export const FE_DOMAIN = 'fe.edu.vn';
export const ALLOWED_EMAIL_DOMAINS = [FPT_DOMAIN, FE_DOMAIN] as const;

export const PHONE_ERROR_MESSAGE =
  'Please enter a valid phone number (10 digits, starting with 03, 05, 07, 08, or 09).';

export const STUDENT_ID_ERROR_MESSAGE =
  'Enter a valid Student ID: two letters for the major, the cohort from 01 to 22 and four digits (for example SE173012).';

export const ADVISOR_CODE_ERROR_MESSAGE =
  'Enter a valid Advisor Code: ADV followed by three digits (for example ADV001).';

export const STUDENT_ID_PLACEHOLDER = 'SE173012';
export const ADVISOR_CODE_PLACEHOLDER = 'ADV001';

/** The mail domain a role is expected to use. */
export const roleEmailDomain = (role: AccountRole): string =>
  role === 'STUDENT' ? FPT_DOMAIN : FE_DOMAIN;

/** True when the address sits on one of the two FPT domains. */
export const hasAllowedEmailDomain = (email: string): boolean => {
  const domain = email.trim().toLowerCase().split('@')[1] ?? '';
  return (ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(domain);
};

/** True when the address matches the domain the role requires. */
export const emailMatchesRole = (email: string, role: AccountRole): boolean =>
  email.trim().toLowerCase().endsWith(`@${roleEmailDomain(role)}`);

/** The message shown when the address does not fit the chosen role. */
export const emailRoleErrorMessage = (role: AccountRole): string =>
  role === 'STUDENT'
    ? `Student accounts must use an @${FPT_DOMAIN} email address.`
    : `Advisor accounts must use an @${FE_DOMAIN} email address.`;

/** The generic message shown when the address is not on an FPT domain at all. */
export const emailDomainErrorMessage =
  `Enter an email address on @${FPT_DOMAIN} or @${FE_DOMAIN}.`;

/**
 * The academic identity carried by a Student ID.
 *
 * `SE173012` belongs to major `SE` and to cohort `K17` — the two digits after
 * the major letters are the admission year (17 → K17).
 */
export interface StudentIdentity {
  code: string;
  majorCode: string;
  cohort: string;
}

/** Reads the major and cohort out of a Student ID, or returns null. */
export const parseStudentId = (raw: string): StudentIdentity | null => {
  const code = raw.trim().toUpperCase();
  if (!STUDENT_ID_PATTERN.test(code)) return null;
  // Curriculum versions are written without a leading zero (K7, K17), so "07" becomes K7.
  return { code, majorCode: code.slice(0, 2), cohort: `K${Number(code.slice(2, 4))}` };
};

/**
 * The semester a student is expected to graduate in, counted from the
 * semester they enrolled in.
 */
export const SEMESTERS_TO_GRADUATE = 8;

/** A semester of the catalogue, reduced to what the form needs. */
export interface SemesterLike {
  id: string;
  code: string;
  startDate: string | null;
}

/** Sorts the catalogue by start date so the order is the academic order. */
export const sortSemesters = <T extends SemesterLike>(semesters: readonly T[]): T[] =>
  [...semesters].sort((a, b) => {
    if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
    if (a.startDate) return -1;
    if (b.startDate) return 1;
    return a.code.localeCompare(b.code);
  });

/**
 * The semester that follows the enrollment semester by the number of
 * semesters a full programme lasts. Returns null when the catalogue is
 * shorter than that.
 */
export const suggestGraduationSemester = <T extends SemesterLike>(
  semesters: readonly T[],
  enrollmentSemesterId: string,
): T | null => {
  const ordered = sortSemesters(semesters);
  const index = ordered.findIndex((semester) => semester.id === enrollmentSemesterId);
  if (index < 0) return null;
  return ordered[index + SEMESTERS_TO_GRADUATE] ?? null;
};

/** True when `later` starts after `earlier`. Missing dates never conflict. */
export const isAfterSemester = (
  later: SemesterLike | undefined,
  earlier: SemesterLike | undefined,
): boolean => {
  if (!later || !earlier) return true;
  if (!later.startDate || !earlier.startDate) return true;
  return later.startDate > earlier.startDate;
};
