// src/modules/advising/types/reports.ts
// Types cho trang "Reports & Analytics" của Advisor (Flow 5).
// Shape bám theo contract API `GET /advisor/reports/*` (BE: AdvisorReportController).

/**
 * KPI tổng quan của advisor — `GET /advisor/reports/overview`.
 * BE tính sẵn trên server; FE chỉ hiển thị, không tự suy ra lại.
 */
export interface AdvisorReportOverview {
  /** Tổng số sinh viên được phân công. */
  totalStudents: number;
  /** Số SV đang học bình thường. */
  activeStudents: number;
  /** Số SV đang bị cảnh báo học vụ. */
  atRiskStudents: number;
  /** Số SV đang ở trạng thái probation. */
  probationCount: number;
  /** Số SV đang bị đình chỉ học vụ. */
  suspendedCount: number;
  /** GPA trung bình của các SV phụ trách (thang 10.00). */
  avgGpa: number;
  /** Số yêu cầu tư vấn đang chờ xử lý. */
  pendingRequests: number;
  /** Số lịch hẹn còn mở. */
  openAppointments: number;
  /** Số lịch hẹn đã hoàn tất. */
  completedAppointments: number;
  /** Số lịch hẹn không đến. */
  noShowCount: number;
}

/**
 * Một điểm dữ liệu của đường xu hướng GPA — phần tử của `semesters`.
 * BE đã tính sẵn trung bình / min / max theo từng học kỳ.
 */
export interface SemesterGpaPoint {
  /** semesters.code — mã học kỳ (vd: "FA2026"). */
  code: string;
  /** semesters.name — tên học kỳ (vd: "Fall 2026"). */
  name: string;
  /** GPA trung bình của học kỳ (thang 10.00). */
  avgGpa: number;
  /** GPA thấp nhất trong học kỳ. */
  minGpa: number;
  /** GPA cao nhất trong học kỳ. */
  maxGpa: number;
  /** Số sinh viên có dữ liệu trong học kỳ. */
  studentCount: number;
}

/** Response của `GET /advisor/reports/gpa-trend`. */
export interface GpaTrendReport {
  /** Các học kỳ, đã được BE sắp xếp tăng dần theo ngày bắt đầu. */
  semesters: SemesterGpaPoint[];
}

/**
 * Phân bố trạng thái học vụ — `GET /advisor/reports/status-distribution`.
 * BE trả về một map `{ ACTIVE: 10, PROBATION: 2, ... }` với key là mã trạng thái.
 */
export type StatusDistribution = Partial<Record<string, number>>;

/** Một lát của biểu đồ tròn sau khi đã chuẩn hoá map của BE thành mảng. */
export interface StatusSlice {
  /** Mã trạng thái (ACTIVE, PROBATION...). */
  status: string;
  /** Nhãn hiển thị cho người dùng. */
  label: string;
  /** Số sinh viên. */
  count: number;
  /** Phần trăm trên tổng. */
  percent: number;
  /** Màu của lát. */
  color: string;
}
