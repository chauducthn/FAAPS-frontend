// Types cho widget "Sinh viên có nguy cơ" (Advisor Dashboard — Flow 3 Passive warning).
// Shape bám theo contract API `GET /advisor/at-risk-students` (xem ghi chú endpoint ở service).

/** Mức độ nguy cơ của sinh viên — BE quyết định dựa trên GPA / vắng học / nợ môn. */
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Lý do sinh viên bị cảnh báo.
 * LOW_GPA = GPA thấp, HIGH_ABSENCE = vắng nhiều, FAILED_COURSES = nợ môn.
 */
export type RiskReason = 'LOW_GPA' | 'HIGH_ABSENCE' | 'FAILED_COURSES';

/** Một sinh viên bị cảnh báo học vụ trong danh sách của advisor. */
export interface AtRiskStudent {
  /** students.user_id — dùng để mở Student 360 Modal. */
  id: string;
  /** students.student_code — MSSV. */
  studentCode: string;
  /** users.full_name. */
  fullName: string | null;
  /** majors.code. */
  majorCode: string | null;
  /** majors.name — chuyên ngành. */
  majorName: string | null;
  /** students.current_semester. */
  currentSemester: number | null;
  /** students.current_gpa — thang 10.00. */
  currentGpa: number | null;
  /** Mức độ nguy cơ do BE chấm. */
  riskLevel: RiskLevel;
  /** Danh sách lý do bị cảnh báo. */
  reasons: RiskReason[];
  /** Chi tiết lý do (vd: "GPA 4.2 < 5.0", "Vắng 12 buổi"). */
  reasonDetails: string | null;
  /** students.total_credits_earned. */
  totalCreditsEarned: number;
  /** Thời điểm BE chấm cảnh báo — ISO-8601. */
  detectedAt: string | null;
  /**
   * SV đang có 1 lịch hẹn còn mở (PENDING / ACCEPTED / SCHEDULED / IN_PROGRESS).
   *
   * BE trả cờ này để FE hiển thị badge "Appointment scheduled" (Đã đặt lịch).
   */
  hasOpenAppointment?: boolean;
  /**
   * SV đang có 1 yêu cầu tư vấn còn mở (PENDING / IN_PROGRESS).
   *
   * BE trả cờ này để FE hiển thị badge "In advising" (Đang tư vấn).
   */
  hasOpenRequest?: boolean;
}

/** Response của `GET /advisor/at-risk-students`. */
export interface AtRiskStudentResponse {
  data: AtRiskStudent[];
  total: number;
}

/**
 * Số lượng sinh viên bị cảnh báo theo mức độ.
 * Response của `GET /advisor/at-risk-students/counts`.
 */
export interface AtRiskCounts {
  /** Mức nguy cơ cao — cần ưu tiên xử lý. */
  high: number;
  /** Mức nguy cơ trung bình. */
  medium: number;
  /** Mức nguy cơ thấp. */
  low: number;
  /** Tổng số sinh viên bị cảnh báo. */
  total: number;
}
