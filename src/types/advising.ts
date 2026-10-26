// src/types/advising.ts
// Types cho Student Portal / Advisor Portal.
// Mỗi field ánh xạ 1-1 với cột của schema MySQL (xem .md):
//   students, advisors, student_advisor_assignments, advising_requests, notifications.

/** advising_requests.request_type */
export type AdvisingRequestType =
  | 'PLAN_REVIEW'
  | 'COURSE_SELECTION'
  | 'ACADEMIC_GUIDANCE'
  | 'GRADUATION_CHECK'
  | 'OTHER';

/** advising_requests.status — DB không có ACCEPTED/REJECTED. */
export type AdvisingRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

/**
 * Các trạng thái advisor được chuyển request sang.
 * RESOLVED = Chấp nhận, CANCELLED = Từ chối, IN_PROGRESS = Tiếp nhận xử lý.
 */
export type AdvisingRequestDecision = 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

/** students.academic_status */
export type AcademicStatus =
  | 'ACTIVE'
  | 'PROBATION'
  | 'SUSPENDED'
  | 'GRADUATED'
  | 'WITHDRAWN'
  | 'LEAVE_OF_ABSENCE';

/** advisors.status */
export type AdvisorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

/** notifications.notification_type */
export type NotificationType =
  | 'INFO'
  | 'WARNING'
  | 'REMINDER'
  | 'PLAN_STATUS'
  | 'MESSAGE'
  | 'ADVISOR_REQUEST';

/** Hồ sơ học tập của sinh viên hiện tại. */
export interface StudentProfile {
  /** students.user_id */
  id: string;
  /** students.student_code */
  studentCode: string;
  /** users.full_name */
  fullName: string;
  /** users.email */
  email: string;
  /** users.phone */
  phone: string | null;
  /** majors.id */
  majorId: string | null;
  /** majors.code */
  majorCode: string | null;
  /** majors.name */
  majorName: string | null;
  /** curriculum_versions.id */
  curriculumVersionId: string | null;
  /** curriculum_versions.version — mã cohort, vd "K19" */
  curriculumVersion: string | null;
  /** semesters.code của students.enrollment_semester_id */
  enrollmentSemesterCode: string | null;
  /** students.current_semester */
  currentSemester: number;
  /** students.current_gpa — thang 10.00 (0.00 - 10.00), KHÔNG quy đổi sang 4.0 */
  currentGpa: number | null;
  /** students.total_credits_earned */
  totalCreditsEarned: number;
  /** students.academic_status */
  academicStatus: AcademicStatus;
}

/**
 * Cố vấn phụ trách của sinh viên hiện tại.
 * advisors + users + student_advisor_assignments (is_primary = true, status = 'ACTIVE').
 */
export interface AdvisorInfo {
  /** advisors.user_id */
  id: string;
  /** advisors.advisor_code */
  advisorCode: string;
  /** users.full_name */
  fullName: string;
  /** users.email */
  email: string;
  /** users.phone */
  phone: string | null;
  /** advisors.max_advisees */
  maxAdvisees: number;
  /** advisors.status */
  status: AdvisorStatus;
  /** advisors.assignment_start_date — yyyy-MM-dd */
  assignmentStartDate: string | null;
  /** student_advisor_assignments.assigned_date — yyyy-MM-dd */
  assignedDate: string | null;
  /** student_advisor_assignments.group_name */
  groupName: string | null;
  /** student_advisor_assignments.is_primary */
  isPrimary: boolean;
}

/** Sinh viên được phân công cho advisor hiện tại. */
export interface AdviseeStudent {
  /** students.user_id */
  id: string;
  /** students.student_code */
  studentCode: string;
  /** users.full_name */
  fullName: string;
  /** users.email */
  email: string;
  /** majors.code */
  majorCode: string;
  /** majors.name */
  majorName: string;
  /** curriculum_versions.version — mã cohort, vd "K19" */
  curriculumVersion: string;
  /** students.current_semester */
  currentSemester: number;
  /** students.current_gpa — thang 10.00 (0.00 - 10.00), KHÔNG quy đổi sang 4.0 */
  currentGpa: number | null;
  /** students.total_credits_earned */
  totalCreditsEarned: number;
  /** students.academic_status */
  academicStatus: AcademicStatus;
  /** semesters.code của students.enrollment_semester_id */
  enrollmentSemesterCode: string | null;
  /** student_advisor_assignments.assigned_date — yyyy-MM-dd */
  assignedDate: string | null;
  /** student_advisor_assignments.group_name */
  groupName: string | null;
  /** student_advisor_assignments.is_primary */
  isPrimary: boolean;
}

/** Một yêu cầu tư vấn (advising_requests + tên student/advisor). */
export interface AdvisingRequest {
  id: string;
  /** students.user_id */
  studentId: string;
  studentName: string;
  studentCode: string | null;
  /** advisors.user_id — NULL tới khi có advisor nhận request */
  advisorId: string | null;
  advisorName: string | null;
  /** study_plans.id — plan mà request nói về (nullable) */
  studyPlanId: string | null;
  requestType: AdvisingRequestType;
  title: string;
  description: string | null;
  status: AdvisingRequestStatus;
  resolvedAt: string | null;
  resolutionSummary: string | null;
  /** ISO-8601 */
  createdAt: string;
  updatedAt: string;
}

/** Một notification của user hiện tại (notifications). */
export interface StudentNotification {
  id: string;
  /** notifications.recipient_user_id */
  recipientUserId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  /** notifications.action_url — in-app path, vd "/student/advising-requests" */
  actionUrl: string | null;
  /** students.user_id */
  relatedStudentId: string | null;
  resolvedAt: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/** Body của POST /student/advising-requests */
export interface CreateAdvisingRequestDto {
  requestType: AdvisingRequestType;
  /** advising_requests.title — varchar(255), not null */
  title: string;
  /** advising_requests.description — text, nullable */
  description?: string;
  /** advising_requests.study_plan_id — nullable */
  studyPlanId?: string;
}

/** Body của PUT /advisor/advising-requests/{id}/status */
export interface UpdateAdvisingRequestStatusDto {
  /** RESOLVED = Chấp nhận, CANCELLED = Từ chối, IN_PROGRESS = Tiếp nhận xử lý. */
  status: AdvisingRequestDecision;
  /** advising_requests.resolution_summary — text, nullable. Bắt buộc khi Từ chối. */
  resolutionSummary?: string;
}
