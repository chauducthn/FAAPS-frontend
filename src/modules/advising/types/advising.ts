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
 * advising_requests.status — hệ thống TICKET (helpdesk) với mô hình SHARED
 * MULTI-ADVISOR: một ticket có thể có nhiều cố vấn cùng tham gia trả lời.
 *
 *   PENDING     : SV đã ném đơn vào hàng đợi, chưa có cố vấn nào nhận.
 *   IN_PROGRESS : đã có cố vấn nhận xử lý (advisor_id được set).
 *   RESOLVED    : cố vấn đã xử lý xong và đóng đơn.
 *   REJECTED    : cố vấn TỪ CHỐI yêu cầu (kèm resolution_summary bắt buộc).
 *   CANCELLED   : SV hủy đơn.
 */
export type AdvisingRequestStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CANCELLED';

/**
 * Trạng thái advisor được chuyển ticket sang.
 *
 * IN_PROGRESS = "Nhận xử lý" (claim) · RESOLVED = "Đóng yêu cầu" ·
 * REJECTED = "Từ chối yêu cầu" (bắt buộc có resolutionSummary).
 */
export type AdvisingRequestDecision = 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CANCELLED';

/**
 * Phạm vi lọc danh sách ticket (BE: `GET /advisor/advising-requests?scope=`).
 *
 *   ALL  : toàn bộ ticket trong hàng đợi chung (mọi cố vấn đều thấy).
 *   MINE : chỉ ticket mà cố vấn đang đăng nhập đang phụ trách HOẶC từng tham gia
 *          (đã từng gửi tin nhắn trong thread đó).
 */
export type AdvisingRequestScope = 'ALL' | 'MINE';

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
  /** majors.code — mã ngành của sinh viên. */
  studentMajorCode?: string | null;
  /** majors.name — tên ngành của sinh viên. */
  studentMajorName?: string | null;
  /** major_groups.id — nhóm ngành của sinh viên. */
  studentMajorGroupId?: string | null;
  /** major_groups.code — MÃ NHÓM NGÀNH của sinh viên (vd "BIT", "BBA"). */
  studentMajorGroupCode?: string | null;
  /** major_groups.name — tên nhóm ngành của sinh viên. */
  studentMajorGroupName?: string | null;
  /**
   * BE tính sẵn: sinh viên có cùng nhóm ngành với cố vấn đang đăng nhập hay không.
   * Dùng để hiển thị badge "Same Major Group" trong danh sách ticket.
   */
  sameMajorGroup?: boolean;
  /**
   * Cố vấn đang đăng nhập có đang phụ trách / từng tham gia ticket này hay không.
   * BE suy ra từ `advisor_id` + các message do cố vấn đó gửi trong thread.
   */
  participatedByMe?: boolean;
  /** study_plans.id — plan mà request nói về (nullable) */
  studyPlanId: string | null;
  /**
   * advising_sessions.id — lịch hẹn đã được tạo TỪ ticket này (nullable).
   *
   * BE tự suy ra bằng:
   *   (SELECT ses.id FROM advising_sessions ses
   *     WHERE ses.advising_request_id = r.id ORDER BY ses.created_at DESC LIMIT 1)
   *
   * Có giá trị ⇒ ticket đã được nối với 1 lịch hẹn ⇒ hiển thị card
   * "Appointment booked" thay vì nút "Book Appointment".
   */
  linkedAppointmentId?: string | null;
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
  /**
   * IN_PROGRESS = "Claim request" · RESOLVED = "Resolve request" ·
   * REJECTED = "Reject request" (từ chối — BẮT BUỘC kèm resolutionSummary).
   */
  status: AdvisingRequestDecision;
  /**
   * advising_requests.resolution_summary — text.
   *
   * BẮT BUỘC khi status = 'RESOLVED' hoặc status = 'REJECTED' — BE trả 400
   * nếu thiếu. Claim (IN_PROGRESS) tuyệt đối không gửi field này.
   */
  resolutionSummary?: string;
}
