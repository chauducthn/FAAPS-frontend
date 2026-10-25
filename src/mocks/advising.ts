// src/mocks/advising.ts
// Fake data cho Student Portal / Advisor Portal (student, advisor, advising_requests, notifications).
// Bật/tắt bằng VITE_MOCK_PORTAL (mặc định bật) hoặc nút "Demo data" trên header — xem src/mocks/index.ts.
//
// State giữ trong module để các thao tác (gửi yêu cầu, chấp nhận / từ chối, đánh dấu đã đọc)
// có hiệu lực thật trong phiên trình duyệt, giống cách ai-config.service.ts giữ localConfigs.

import type {
  AdvisorInfo,
  AdviseeStudent,
  AdvisingRequest,
  AdvisingRequestStatus,
  AdvisingRequestType,
  StudentNotification,
  StudentProfile,
} from '../types/advising';
import type { Page } from '../types/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Ngày giờ cố định để dữ liệu demo ổn định giữa các lần render. */
const NOW = new Date('2026-10-26T09:00:00.000Z');

const daysAgo = (days: number, hours = 0) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

/** "yyyy-MM-dd" cách đây `days` ngày. */
const ymdDaysAgo = (days: number) => daysAgo(days).slice(0, 10);

const page = <T>(items: T[], pageIndex: number, size: number): Page<T> => ({
  items,
  page: pageIndex,
  size,
  totalElements: items.length,
  totalPages: Math.max(1, Math.ceil(items.length / size)),
});

/** Lọc + phân trang trên bộ dữ liệu local. */
const paginate = <T>(rows: T[], pageIndex: number, size: number): Page<T> => {
  const start = pageIndex * size;
  const items = rows.slice(start, start + size);
  return {
    items,
    page: pageIndex,
    size,
    totalElements: rows.length,
    totalPages: Math.max(1, Math.ceil(rows.length / size)),
  };
};

// ---------------------------------------------------------------------------
// Hồ sơ sinh viên demo
// ---------------------------------------------------------------------------

export const mockStudentProfile: StudentProfile = {
  id: 'stu-001',
  studentCode: 'SE2021001',
  fullName: 'Nguyễn Minh Khoa',
  email: 'khoa.nguyen@fpt.edu.vn',
  phone: '0901234567',
  majorId: 'maj-se',
  majorCode: 'SE',
  majorName: 'Software Engineering',
  curriculumVersionId: 'cv-se-k19',
  curriculumVersion: 'K19',
  enrollmentSemesterCode: 'FA2021',
  currentSemester: 6,
  currentGpa: 8.35,
  totalCreditsEarned: 96,
  academicStatus: 'ACTIVE',
};

// ---------------------------------------------------------------------------
// Cố vấn phụ trách
// ---------------------------------------------------------------------------

export const mockAdvisorInfo: AdvisorInfo = {
  id: 'adv-001',
  advisorCode: 'ADV-001',
  fullName: 'Trần Thị Hồng Nhung',
  email: 'nhung.tran@fpt.edu.vn',
  phone: '0987654321',
  specialization: 'Software Architecture & Data Engineering',
  maxAdvisees: 30,
  status: 'ACTIVE',
  workDays: '1,2,3,4,5',
  assignmentStartDate: '2024-09-01',
  assignedDate: '2024-09-01',
  groupName: 'K19 - SE',
  isPrimary: true,
};

// ---------------------------------------------------------------------------
// Sinh viên được phân công cho cố vấn
// ---------------------------------------------------------------------------

export const mockAdviseeStudents: AdviseeStudent[] = [
  {
    id: 'stu-001',
    studentCode: 'SE2021001',
    fullName: 'Nguyễn Minh Khoa',
    email: 'khoa.nguyen@fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 6,
    currentGpa: 8.35,
    totalCreditsEarned: 96,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2021',
    assignedDate: '2024-09-01',
    groupName: 'K19 - SE',
    isPrimary: true,
  },
  {
    id: 'stu-002',
    studentCode: 'SE2021002',
    fullName: 'Lê Thu Hà',
    email: 'ha.le@fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 6,
    currentGpa: 9.12,
    totalCreditsEarned: 102,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2021',
    assignedDate: '2024-09-01',
    groupName: 'K19 - SE',
    isPrimary: true,
  },
  {
    id: 'stu-003',
    studentCode: 'SE2022005',
    fullName: 'Phạm Quốc Bảo',
    email: 'bao.pham@fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K20',
    currentSemester: 4,
    currentGpa: 5.48,
    totalCreditsEarned: 58,
    academicStatus: 'PROBATION',
    enrollmentSemesterCode: 'FA2022',
    assignedDate: '2024-09-01',
    groupName: 'K20 - SE',
    isPrimary: true,
  },
  {
    id: 'stu-004',
    studentCode: 'SE2022010',
    fullName: 'Vũ Ngọc Anh',
    email: 'anh.vu@fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K20',
    currentSemester: 4,
    currentGpa: 3.21,
    totalCreditsEarned: 42,
    academicStatus: 'PROBATION',
    enrollmentSemesterCode: 'FA2022',
    assignedDate: '2024-09-01',
    groupName: 'K20 - SE',
    isPrimary: true,
  },
  {
    id: 'stu-005',
    studentCode: 'SE2022014',
    fullName: 'Đặng Thu Trang',
    email: 'trang.dang@fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K20',
    currentSemester: 4,
    currentGpa: 7.66,
    totalCreditsEarned: 61,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2022',
    assignedDate: '2024-09-01',
    groupName: 'K20 - SE',
    isPrimary: true,
  },
  {
    id: 'stu-006',
    studentCode: 'SE2023003',
    fullName: 'Hoàng Đức Long',
    email: 'long.hoang@fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K21',
    currentSemester: 2,
    currentGpa: 9.4,
    totalCreditsEarned: 28,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2023',
    assignedDate: '2024-09-01',
    groupName: 'K21 - SE',
    isPrimary: true,
  },
  {
    id: 'stu-007',
    studentCode: 'SE2023011',
    fullName: 'Bùi Kim Ngân',
    email: 'ngan.bui@fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K21',
    currentSemester: 2,
    currentGpa: 6.05,
    totalCreditsEarned: 24,
    academicStatus: 'LEAVE_OF_ABSENCE',
    enrollmentSemesterCode: 'FA2023',
    assignedDate: '2024-09-01',
    groupName: 'K21 - SE',
    isPrimary: true,
  },
];

// ---------------------------------------------------------------------------
// Yêu cầu tư vấn
// ---------------------------------------------------------------------------

const mockRequests: AdvisingRequest[] = [
  {
    id: 'req-001',
    studentId: 'stu-003',
    studentName: 'Phạm Quốc Bảo',
    studentCode: 'SE2022005',
    advisorId: 'adv-001',
    advisorName: 'Trần Thị Hồng Nhung',
    studyPlanId: null,
    requestType: 'PLAN_REVIEW',
    title: 'Duyệt kế hoạch học tập học kỳ 7',
    description:
      'Em đã chọn 4 môn trong kế hoạch học tập học kỳ 7 nhưng chưa chắc môn Data Mining có bắt buộc hay không. Nhờ cố vấn xem giúp em.',
    status: 'PENDING',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(0, 3),
    updatedAt: daysAgo(0, 3),
  },
  {
    id: 'req-002',
    studentId: 'stu-004',
    studentName: 'Vũ Ngọc Anh',
    studentCode: 'SE2022010',
    advisorId: null,
    advisorName: null,
    studyPlanId: null,
    requestType: 'COURSE_SELECTION',
    title: 'Tư vấn chọn môn học phần kiến trúc',
    description:
      'GPA học kỳ vừa rồi em đạt 3.21 nên em sợ không đủ điều kiện học môn nâng cao. Em nên học môn nào để cải thiện?',
    status: 'PENDING',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(1, 5),
    updatedAt: daysAgo(1, 5),
  },
  {
    id: 'req-003',
    studentId: 'stu-005',
    studentName: 'Đặng Thu Trang',
    studentCode: 'SE2022014',
    advisorId: 'adv-001',
    advisorName: 'Trần Thị Hồng Nhung',
    studyPlanId: null,
    requestType: 'ACADEMIC_GUIDANCE',
    title: 'Hướng dẫn làm đồ án tốt nghiệp',
    description: 'Em muốn biết thể loại đồ án phù hợp với điểm mạnh của em và deadline đăng ký.',
    status: 'IN_PROGRESS',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(3, 2),
    updatedAt: daysAgo(1, 8),
  },
  {
    id: 'req-004',
    studentId: 'stu-002',
    studentName: 'Lê Thu Hà',
    studentCode: 'SE2021002',
    advisorId: 'adv-001',
    advisorName: 'Trần Thị Hồng Nhung',
    studyPlanId: null,
    requestType: 'GRADUATION_CHECK',
    title: 'Kiểm tra điều kiện tốt nghiệp',
    description: 'Em đã tích lũy 102 tín chỉ, nhờ cố vấn kiểm tra giúp em còn thiếu môn điều kiện nào không.',
    status: 'RESOLVED',
    resolvedAt: daysAgo(2, 4),
    resolutionSummary: 'Em đã đủ 120 tín chỉ và hoàn thành đủ môn điều kiện. Chúc mừng bạn, chỉ còn chốt đồ án.',
    createdAt: daysAgo(4, 6),
    updatedAt: daysAgo(2, 4),
  },
  {
    id: 'req-005',
    studentId: 'stu-001',
    studentName: 'Nguyễn Minh Khoa',
    studentCode: 'SE2021001',
    advisorId: 'adv-001',
    advisorName: 'Trần Thị Hồng Nhung',
    studyPlanId: null,
    requestType: 'OTHER',
    title: 'Xin nghỉ học một kỳ',
    description: 'Em có việc gia đình cần về quê, xin hỏi thủ tục nghỉ học tạm thời như thế nào.',
    status: 'CANCELLED',
    resolvedAt: daysAgo(7, 1),
    resolutionSummary:
      'Bạn cần nộp đơn xin nghỉ học tại phòng Đào tạo trước khi kỳ đăng ký học phần bắt đầu. Trong học kỳ này vui lòng đi học đầy đủ.',
    createdAt: daysAgo(8, 3),
    updatedAt: daysAgo(7, 1),
  },
];

// ---------------------------------------------------------------------------
// Thông báo
// ---------------------------------------------------------------------------

const mockNotifications: StudentNotification[] = [
  {
    id: 'ntf-001',
    recipientUserId: 'stu-001',
    notificationType: 'ADVISOR_REQUEST',
    title: 'Đã tiếp nhận yêu cầu tư vấn',
    message: 'Cố vấn Trần Thị Hồng Nhung đã nhận yêu cầu "Xin nghỉ học một kỳ" của bạn.',
    actionUrl: '/student/advising-requests',
    relatedStudentId: 'stu-001',
    resolvedAt: null,
    isRead: false,
    readAt: null,
    createdAt: daysAgo(7, 2),
  },
  {
    id: 'ntf-002',
    recipientUserId: 'stu-001',
    notificationType: 'PLAN_STATUS',
    title: 'Kế hoạch học tập đã được duyệt',
    message: 'Kế hoạch học tập học kỳ 6 của bạn đã được cố vấn phê duyệt với 18 tín chỉ.',
    actionUrl: '/student',
    relatedStudentId: 'stu-001',
    resolvedAt: null,
    isRead: false,
    readAt: null,
    createdAt: daysAgo(5, 4),
  },
  {
    id: 'ntf-003',
    recipientUserId: 'stu-001',
    notificationType: 'REMINDER',
    title: 'Nhắc đăng ký học phần',
    message: 'Hạn chót đăng ký học phần học kỳ 7 là 12/11/2026. Bạn chưa đăng ký môn nào.',
    actionUrl: '/student',
    relatedStudentId: 'stu-001',
    resolvedAt: null,
    isRead: false,
    readAt: null,
    createdAt: daysAgo(2, 1),
  },
  {
    id: 'ntf-004',
    recipientUserId: 'stu-001',
    notificationType: 'WARNING',
    title: 'Cảnh báo học tập',
    message: 'Điểm trung bình học kỳ gần nhất của bạn đã giảm. Vui lòng gặp cố vấn để có phương án cải thiện.',
    actionUrl: '/student/advising-requests',
    relatedStudentId: 'stu-001',
    resolvedAt: null,
    isRead: true,
    readAt: daysAgo(1, 9),
    createdAt: daysAgo(3, 5),
  },
  {
    id: 'ntf-005',
    recipientUserId: 'stu-001',
    notificationType: 'MESSAGE',
    title: 'Cố vấn đã phản hồi',
    message: 'Cố vấn đã phản hồi yêu cầu tư vấn của bạn. Xem chi tiết ghi chú trong danh sách yêu cầu.',
    actionUrl: '/student/advising-requests',
    relatedStudentId: 'stu-001',
    resolvedAt: null,
    isRead: true,
    readAt: daysAgo(6, 2),
    createdAt: daysAgo(7, 1),
  },
  {
    id: 'ntf-006',
    recipientUserId: 'stu-001',
    notificationType: 'INFO',
    title: 'Lịch hẹn với cố vấn',
    message: 'Bạn có lịch hẹn với cố vấn vào 09:00 ngày 28/10/2026 tại phòng tư vấn A204.',
    actionUrl: '/student/appointments',
    relatedStudentId: 'stu-001',
    resolvedAt: null,
    isRead: true,
    readAt: daysAgo(4, 3),
    createdAt: daysAgo(5, 10),
  },
];

// ---------------------------------------------------------------------------
// API giả
// ---------------------------------------------------------------------------

export const mockGetMyProfile = (): StudentProfile => ({ ...mockStudentProfile });

export const mockGetMyAdvisor = (): AdvisorInfo | null => ({ ...mockAdvisorInfo });

export const mockGetNotifications = (params: {
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}): Page<StudentNotification> => {
  const size = params.size ?? 10;
  const rows = params.unreadOnly ? mockNotifications.filter((n) => !n.isRead) : [...mockNotifications];
  return paginate(rows, params.page ?? 0, size);
};

export const mockMarkNotificationRead = (id: string): { updated: boolean } => {
  const found = mockNotifications.find((n) => n.id === id);
  if (!found) return { updated: false };
  found.isRead = true;
  found.readAt = new Date().toISOString();
  return { updated: true };
};

export const mockMarkAllNotificationsRead = (): { updated: number } => {
  let updated = 0;
  mockNotifications.forEach((n) => {
    if (!n.isRead) {
      n.isRead = true;
      n.readAt = new Date().toISOString();
      updated += 1;
    }
  });
  return { updated };
};

export const mockGetMyAdvisingRequests = (): AdvisingRequest[] =>
  mockRequests.filter((r) => r.studentId === mockStudentProfile.id).map((r) => ({ ...r }));

export const mockCreateAdvisingRequest = (body: {
  requestType: AdvisingRequestType;
  title: string;
  description?: string;
  studyPlanId?: string;
}): AdvisingRequest => {
  const now = new Date().toISOString();
  const created: AdvisingRequest = {
    id: `req-local-${Date.now()}`,
    studentId: mockStudentProfile.id,
    studentName: mockStudentProfile.fullName,
    studentCode: mockStudentProfile.studentCode,
    // advisor_id NULL cho tới khi có cố vấn nhận request — đúng như DB.
    advisorId: null,
    advisorName: null,
    studyPlanId: body.studyPlanId || null,
    requestType: body.requestType,
    title: body.title,
    description: body.description ?? null,
    status: 'PENDING',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: now,
    updatedAt: now,
  };
  mockRequests.unshift(created);
  return { ...created };
};

export const mockGetAdviseeStudents = (params: {
  search?: string;
  page?: number;
  size?: number;
}): Page<AdviseeStudent> => {
  const size = params.size ?? 10;
  const term = params.search?.trim().toLowerCase();
  const rows = term
    ? mockAdviseeStudents.filter(
        (s) =>
          s.fullName.toLowerCase().includes(term) || s.studentCode.toLowerCase().includes(term),
      )
    : [...mockAdviseeStudents];
  return paginate(rows, params.page ?? 0, size);
};

export const mockGetAdvisorRequests = (params: {
  status?: AdvisingRequestStatus;
  search?: string;
  page?: number;
  size?: number;
}): Page<AdvisingRequest> => {
  const size = params.size ?? 10;
  let rows = [...mockRequests];

  if (params.status) rows = rows.filter((r) => r.status === params.status);

  const term = params.search?.trim().toLowerCase();
  if (term) {
    rows = rows.filter(
      (r) =>
        r.studentName.toLowerCase().includes(term) ||
        (r.studentCode ?? '').toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term),
    );
  }

  // Yêu cầu mới nhất lên đầu.
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paginate(rows, params.page ?? 0, size);
};

export const mockUpdateRequestStatus = (
  id: string,
  body: { status: 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED'; resolutionSummary?: string },
): AdvisingRequest => {
  const found = mockRequests.find((r) => r.id === id);
  if (!found) throw new Error('Không tìm thấy yêu cầu tư vấn');

  const now = new Date().toISOString();
  found.status = body.status;
  found.updatedAt = now;

  if (body.status === 'RESOLVED' || body.status === 'CANCELLED') {
    found.resolvedAt = now;
    found.resolutionSummary = body.resolutionSummary?.trim() || null;
  }

  // Advisor nhận request thì ghi advisor_id (DB cho phép NULL cho tới lúc này).
  found.advisorId = 'adv-001';
  found.advisorName = mockAdvisorInfo.fullName;

  return { ...found };
};

/** Bảng phân trang rỗng — dùng khi chưa có dữ liệu. */
export const emptyPage = <T>(size = 10): Page<T> => page<T>([], 0, size);
