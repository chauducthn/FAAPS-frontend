// Types cho trang Academic Search của Advisor.
// Shape bám theo contract API read-only của advisor (xem ghi chú endpoint ở service).

/** Một điều kiện tiên quyết của môn học. */
export interface LookupPrerequisite {
  courseCode: string;
  courseName: string;
  /** Các môn cùng group là lựa chọn thay thế (chỉ cần 1); khác group phải hoàn thành tất cả. */
  groupNo: number;
  /** Điểm tối thiểu (thang 10) — null nếu không yêu cầu điểm. */
  minimumScore: number | null;
}

/** Một tuần học trong giáo trình. */
export interface SyllabusWeek {
  week: number;
  topic: string;
  content: string;
}

/** Một môn học trong danh mục. */
export interface LookupCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  category: string;
  description: string;
  objectives: string;
  learningOutcomes: string;
  prerequisites: LookupPrerequisite[];
  /** Backend chưa có dữ liệu tuần học — có thể rỗng. */
  syllabus: SyllabusWeek[];
}

/** Một học phần trong chương trình đào tạo. */
export interface LookupSemester {
  semesterNumber: number;
  /** Mã môn học. */
  courses: string[];
}

/** Một phiên bản chương trình đào tạo. */
export interface LookupCurriculum {
  id: string;
  majorCode: string;
  majorName: string;
  version: string;
  name: string;
  description: string | null;
  totalCredits: number;
  semesters: LookupSemester[];
}
