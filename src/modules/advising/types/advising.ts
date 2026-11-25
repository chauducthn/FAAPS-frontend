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

/**
 * advising_requests.status — hệ thống TICKET (helpdesk), KHÔNG phải chat 1-1 được assign.
 *
 *   PENDING     : SV đã ném đơn vào hàng đợi, chưa có cố vấn nào nhận.
 *   IN_PROGRESS : đã có cố vấn nhận xử lý (advisor_id được set).
 *   RESOLVED    : cố vấn đã xử lý xong và đóng đơn.
 *   CANCELLED   : SV hủy đơn.
 */
export type AdvisingRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

/**
 * Trạng thái advisor được chuyển ticket sang.
 * IN_PROGRESS = "Nhận xử lý" (claim), RESOLVED = "Đóng yêu cầu", CANCELLED = từ chối.
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
  /** users.full_name — có thể null nếu API không trả tên */
  fullName: string | null;
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
  /** Cohort code ("K19"); the backend returns it as `cohort`. */
  cohort?: string | null;
  /** users.date_of_birth — yyyy-MM-dd */
  dateOfBirth?: string | null;
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
  /** users.full_name — có thể null nếu API không trả tên */
  fullName: string | null;
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
  /** users.full_name — có thể null nếu API không trả tên */
  fullName: string | null;
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

/** Một ticket yêu cầu tư vấn (advising_requests + tên student/advisor). */
export interface AdvisingRequest {
  id: string;
  /** students.user_id */
  studentId: string;
  studentName: string | null;
  studentCode: string | null;
  /**
   * advisors.user_id — NULL cho tới khi một cố vấn bấm "Nhận xử lý".
   * Đây là cố vấn ĐANG GIỮ ticket, KHÔNG phải cố vấn được phân công của SV.
   */
  advisorId: string | null;
  /** Tên cố vấn đang giữ ticket (null khi ticket còn PENDING). */
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

/** Một tin nhắn trong 1 ticket (`advising_messages`). */
export interface AdvisingMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  /** Ghi chú nội bộ của cố vấn — sinh viên không nhìn thấy. */
  internal: boolean;
  createdAt: string;
}

/** Chi tiết 1 ticket: request + toàn bộ tin nhắn. */
export interface AdvisingRequestDetail {
  request: AdvisingRequest;
  messages: AdvisingMessage[];
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

/** Body of PATCH /advisor/advising-requests/{id}/status */
export interface UpdateAdvisingRequestStatusDto {
  /** IN_PROGRESS = "Claim request", RESOLVED = "Resolve request". */
  status: AdvisingRequestDecision;
  /**
   * advising_requests.resolution_summary — text.
   *
   * ONLY sent when the request is being CLOSED (status = RESOLVED). A claim
   * (IN_PROGRESS) must send `{ status: 'IN_PROGRESS' }` and nothing else.
   */
  resolutionSummary?: string;
}
