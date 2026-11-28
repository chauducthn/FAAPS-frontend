export type AdminUserRole = 'STUDENT' | 'ADVISOR';
export type AdminUserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface AdminUserSummary {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  /**
   * Whether the account has a local password. Google-only accounts
   * (`password_hash IS NULL`) cannot be reset — they sign in through Google.
   *
   * Optional on purpose: the current backend does not send this field on
   * `GET /admin/users`, so it must not be treated as "false" when missing.
   * See `canResetPassword` in `../utils/passwordReset`.
   */
  hasPassword?: boolean;
  /** Students only. */
  majorCode?: string | null;
  cohort?: string | null;
  avatarUrl?: string | null;
  /** Advisors only: the Major Group they are responsible for. */
  majorGroupId?: string | null;
}

export interface AdminUserDetail {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
  majorId: string | null;
  majorCode?: string | null;
  majorName: string | null;
  curriculumVersionId: string | null;
  curriculumCode: string | null;
  curriculumName?: string | null;
  enrollmentSemesterId: string | null;
  enrollmentSemesterCode?: string | null;
  expectedGraduationSemesterId?: string | null;
  expectedGraduationSemesterCode?: string | null;
  currentSemester: number | null;
  academicStatus: string | null;
  avatarUrl?: string | null;
}

export type UserSort =
  | 'createdAt,desc'
  | 'createdAt,asc'
  | 'fullName,asc'
  | 'fullName,desc'
  | 'userId,asc'
  | 'userId,desc'
  | 'email,asc'
  | 'email,desc'
  | 'role,asc'
  | 'role,desc'
  | 'major,asc'
  | 'major,desc'
  | 'cohort,asc'
  | 'cohort,desc'
  | 'status,asc'
  | 'status,desc';

/**
 * Outcome of one account inside a password reset.
 *
 * - `SUCCESS` — a new random password was issued and is returned once.
 * - `SKIPPED` — the account was left alone (no local password, so there is
 *   nothing to reset).
 * - `FAILED` — the reset did not go through for this account.
 */
export type PasswordResetStatus = 'SUCCESS' | 'SKIPPED' | 'FAILED';

/** One row of the reset result: which account, what happened, and its new password. */
export interface PasswordResetEntry {
  userId: string;
  email: string;
  fullName?: string;
  status: PasswordResetStatus;
  /** Only present for `SUCCESS`. Never persisted, never logged. */
  newPassword?: string | null;
  /** Why the account was skipped or failed. */
  reason?: string | null;
}

/** The body of a password reset response. */
export interface PasswordResetResponse {
  resetResults: PasswordResetEntry[];
}

/** Body of POST /admin/users. */
export interface CreateUserBody {
  role: AdminUserRole;
  email: string;
  fullName: string;
  phone?: string;
  studentCode?: string;
  advisorCode?: string;
  curriculumVersionId?: string;
  enrollmentSemesterId?: string;
  expectedGraduationSemesterId?: string;
  currentSemester?: number;
  maxAdvisees?: number;
  /** Advisors: the Major Group they are responsible for. */
  majorGroupId?: string;
}

/** Body of PATCH /admin/users/{id}/role. */
export interface ChangeUserRoleBody {
  role: AdminUserRole;
  email?: string;
  studentCode?: string;
  curriculumVersionId?: string;
  enrollmentSemesterId?: string;
  maxAdvisees?: number;
  /** Advisors: the Major Group they are responsible for. */
  majorGroupId?: string;
}
