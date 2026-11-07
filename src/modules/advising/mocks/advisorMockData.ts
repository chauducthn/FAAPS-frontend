// src/modules/advising/mocks/advisorMockData.ts
// Dữ liệu giả cho toàn bộ khu vực Advisor (tư vấn, hội thoại, lịch hẹn, kế hoạch học tập).
//
// Store là MUTABLE in-memory: mọi mutation ghi thẳng vào các mảng bên dưới,
// nên UI cập nhật ngay sau khi React Query invalidate — test được trọn vẹn
// luồng accept/reject/gửi tin/đổi trạng thái lịch/sửa lịch rảnh/duyệt kế hoạch.
//
// Dữ liệu bám đúng contract backend:
//   GET /advisor/advising-requests        -> AdvisingRequest[]
//   GET /advisor/advising-requests/{id}   -> { request, messages[] }
//   GET /advisor/appointments             -> AdvisorAppointment[]
//   GET /advisor/availability             -> AvailabilitySlot[]
//   GET /advisor/study-plans              -> Page<StudyPlanSummary>

import type { AdvisingRequest, AdvisingRequestStatus, AdviseeStudent } from '../types/advising';
import type { AvailabilitySlot, AdvisorAppointment, BookingStatus } from '../../appointment/types/appointment';
import type { AcademicAdvisingDetail, AcademicAdvisingRequest, CurriculumPlan } from '../../academic/services/studentAcademicService';

export const MOCK_ADVISOR_ID = 'adv-001';
export const MOCK_ADVISOR_NAME = 'Trần Minh Khoa';

/* ------------------------------------------------------------------ */
/* Sinh viên được phân công                                             */
/* ------------------------------------------------------------------ */

export interface MockAdvisee extends AdviseeStudent {
  phone: string | null;
  dateOfBirth: string | null;
}

const STUDENT_SEEDS: Omit<MockAdvisee, 'assignedDate'>[] = [
  {
    id: 'stu-001', studentCode: 'SE120001', fullName: 'Nguyễn Hoàng An', email: 'anh.nh120001@fpt.edu.vn',
    majorCode: 'SE', majorName: 'Software Engineering', curriculumVersion: 'K22',
    currentSemester: 7, currentGpa: 8.42, totalCreditsEarned: 96, academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2022', groupName: 'SE-K22-A', isPrimary: true,
    phone: '0901234567', dateOfBirth: '2003-04-12',
  },
  {
    id: 'stu-002', studentCode: 'SE120002', fullName: 'Trần Thị Bình', email: 'binh.tt120002@fpt.edu.vn',
    majorCode: 'SE', majorName: 'Software Engineering', curriculumVersion: 'K22',
    currentSemester: 7, currentGpa: 6.15, totalCreditsEarned: 84, academicStatus: 'PROBATION',
    enrollmentSemesterCode: 'FA2022', groupName: 'SE-K22-A', isPrimary: true,
    phone: '0912345678', dateOfBirth: '2003-09-30',
  },
  {
    id: 'stu-003', studentCode: 'SE120003', fullName: 'Lê Quốc Cường', email: 'cuong.lq120003@fpt.edu.vn',
    majorCode: 'SE', majorName: 'Software Engineering', curriculumVersion: 'K22',
    currentSemester: 8, currentGpa: 9.1, totalCreditsEarned: 108, academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2022', groupName: 'SE-K22-B', isPrimary: true,
    phone: '0922345678', dateOfBirth: '2002-12-01',
  },
  {
    id: 'stu-004', studentCode: 'SE120004', fullName: 'Phạm Thuỳ Dung', email: 'dung.pt120004@fpt.edu.vn',
    majorCode: 'SE', majorName: 'Software Engineering', curriculumVersion: 'K22',
    currentSemester: 8, currentGpa: 4.8, totalCreditsEarned: 72, academicStatus: 'SUSPENDED',
    enrollmentSemesterCode: 'FA2022', groupName: 'SE-K22-B', isPrimary: true,
    phone: '0932345678', dateOfBirth: '2003-02-18',
  },
  {
    id: 'stu-005', studentCode: 'IT120005', fullName: 'Vũ Đức Duy', email: 'duy.vd120005@fpt.edu.vn',
    majorCode: 'IT', majorName: 'Information Technology', curriculumVersion: 'K21',
    currentSemester: 8, currentGpa: 7.25, totalCreditsEarned: 99, academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2021', groupName: 'IT-K21-A', isPrimary: true,
    phone: '0942345678', dateOfBirth: '2002-08-22',
  },
  {
    id: 'stu-006', studentCode: 'IT120006', fullName: 'Đặng Thu Hà', email: 'ha.dt120006@fpt.edu.vn',
    majorCode: 'IT', majorName: 'Information Technology', curriculumVersion: 'K21',
    currentSemester: 9, currentGpa: 8.05, totalCreditsEarned: 116, academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2021', groupName: 'IT-K21-A', isPrimary: true,
    phone: '0952345678', dateOfBirth: '2002-05-05',
  },
  {
    id: 'stu-007', studentCode: 'SE120007', fullName: 'Hoàng Minh Huy', email: 'huy.hm120007@fpt.edu.vn',
    majorCode: 'SE', majorName: 'Software Engineering', curriculumVersion: 'K22',
    currentSemester: 6, currentGpa: 6.8, totalCreditsEarned: 66, academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2022', groupName: 'SE-K22-C', isPrimary: true,
    phone: '0962345678', dateOfBirth: '2003-06-11',
  },
  {
    id: 'stu-008', studentCode: 'SE120008', fullName: 'Bùi Ngọc Khánh', email: 'khanh.bn120008@fpt.edu.vn',
    majorCode: 'SE', majorName: 'Software Engineering', curriculumVersion: 'K22',
    currentSemester: 6, currentGpa: 7.95, totalCreditsEarned: 63, academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2022', groupName: 'SE-K22-C', isPrimary: true,
    phone: '0972345678', dateOfBirth: '2003-07-19',
  },
  {
    id: 'stu-009', studentCode: 'IT120009', fullName: 'Đỗ Thanh Lam', email: 'lam.dt120009@fpt.edu.vn',
    majorCode: 'IT', majorName: 'Information Technology', curriculumVersion: 'K21',
    currentSemester: 9, currentGpa: 5.4, totalCreditsEarned: 102, academicStatus: 'PROBATION',
    enrollmentSemesterCode: 'FA2021', groupName: 'IT-K21-B', isPrimary: true,
    phone: '0982345678', dateOfBirth: '2002-03-27',
  },
  {
    id: 'stu-010', studentCode: 'IT120010', fullName: 'Ngô Quang Minh', email: 'minh.nq120010@fpt.edu.vn',
    majorCode: 'IT', majorName: 'Information Technology', curriculumVersion: 'K21',
    currentSemester: 10, currentGpa: 8.8, totalCreditsEarned: 128, academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2021', groupName: 'IT-K21-B', isPrimary: true,
    phone: '0903456789', dateOfBirth: '2002-01-14',
  },
  {
    id: 'stu-011', studentCode: 'SE120011', fullName: 'Phan Thị Nga', email: 'nga.pt120011@fpt.edu.vn',
    majorCode: 'SE', majorName: 'Software Engineering', curriculumVersion: 'K22',
    currentSemester: 5, currentGpa: 6.0, totalCreditsEarned: 45, academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'FA2022', groupName: 'SE-K22-D', isPrimary: true,
    phone: '0913456789', dateOfBirth: '2003-11-02',
  },
  {
    id: 'stu-012', studentCode: 'SE120012', fullName: 'Trịnh Thanh Phong', email: 'phong.tt120012@fpt.edu.vn',
    majorCode: 'SE', majorName: 'Software Engineering', curriculumVersion: 'K22',
    currentSemester: 5, currentGpa: 3.9, totalCreditsEarned: 33, academicStatus: 'PROBATION',
    enrollmentSemesterCode: 'FA2022', groupName: 'SE-K22-D', isPrimary: true,
    phone: '0923456789', dateOfBirth: '2003-10-08',
  },
];

const ASSIGNED_DATE = '2026-08-15';

export const MOCK_ADVISEE_STUDENTS: MockAdvisee[] = STUDENT_SEEDS.map((s) => ({
  ...s,
  assignedDate: ASSIGNED_DATE,
}));

/* ------------------------------------------------------------------ */
/* Yêu cầu tư vấn + hội thoại                                           */
/* ------------------------------------------------------------------ */

export interface MockAdvisingMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  internal: boolean;
  createdAt: string;
}

interface RequestSeed {
  id: string;
  studentId: string;
  requestType: AdvisingRequest['requestType'];
  title: string;
  description: string;
  status: AdvisingRequestStatus;
  resolutionSummary?: string;
  createdAt: string;
  messages: { from: 'student' | 'advisor'; content: string; internal?: boolean; at: string }[];
}

const REQUEST_SEEDS: RequestSeed[] = [
  {
    id: 'req-001', studentId: 'stu-001', requestType: 'COURSE_SELECTION',
    title: 'Đăng ký 20 tín chỉ kỳ 9 có nên kèm OJT401?',
    description:
      'Em đang cân nhắc đăng ký 20 tín chỉ ở kỳ 9 gồm 4 môn chuyên ngành Node.js và OJT401. Em đã đủ 96 tín chỉ. Anh cho em xin lời khuyên với ạ.',
    status: 'PENDING',
    createdAt: '2026-11-04T02:10:00Z',
    messages: [
      { from: 'student', content: 'Advisor ơi, em chào anh. Em muốn hỏi về kế hoạch đăng ký kỳ 9 ạ.', at: '2026-11-04T02:10:00Z' },
      { from: 'student', content: 'Em đủ 96 tín chỉ rồi nên có thể đăng OJT401. Em nên đăng kèm OJT luôn hay để kỳ sau anh?', at: '2026-11-04T02:12:00Z' },
    ],
  },
  {
    id: 'req-002', studentId: 'stu-002', requestType: 'ACADEMIC_GUIDANCE',
    title: 'GPA 6.15 — em có nên cải thiện học kỳ này?',
    description:
      'Em đang bị cảnh báo học vụ. Em muốn biết em nên học bao nhiêu tín chỉ và tập trung môn nào để thoát probation.',
    status: 'PENDING',
    createdAt: '2026-11-05T08:40:00Z',
    messages: [
      { from: 'student', content: 'Chào anh/chị, em vừa nhận được cảnh báo học vụ. Em nên làm gì để cải thiện ạ?', at: '2026-11-05T08:40:00Z' },
    ],
  },
  {
    id: 'req-003', studentId: 'stu-003', requestType: 'PLAN_REVIEW',
    title: 'Duyệt kế hoạch học tập kỳ 9 — học sâu Game Development',
    description: 'Em gửi kế hoạch học tập kỳ 9 gồm 5 môn chuyên ngành Game Development. Nhờ anh duyệt giúp em ạ.',
    status: 'IN_PROGRESS',
    createdAt: '2026-11-02T03:25:00Z',
    messages: [
      { from: 'student', content: 'Anh ơi, em đã gửi kế hoạch kỳ 9 trên hệ thống. Anh xem giúp em với ạ.', at: '2026-11-02T03:25:00Z' },
      { from: 'advisor', content: 'Anh đã nhận kế hoạch. Anh kiểm tra tiên quyết cho các môn chuyên ngành rồi, khoảng 1 ngày nữa anh sẽ phản hồi.', at: '2026-11-02T06:00:00Z' },
      { from: 'advisor', content: 'Lưu ý nội bộ: cần đối chiếu mức điểm SE301 trước khi duyệt.', internal: true, at: '2026-11-02T06:02:00Z' },
    ],
  },
  {
    id: 'req-004', studentId: 'stu-004', requestType: 'OTHER',
    title: 'Xin gia hạn học kỳ do đình chỉ học vụ',
    description: 'Em đã bị đình chỉ học vụ một kỳ. Em xin hỏi thủ tục gia hạn và điều kiện trở lại là gì ạ?',
    status: 'PENDING',
    createdAt: '2026-11-06T01:05:00Z',
    messages: [
      { from: 'student', content: 'Chào anh, em bị đình chỉ học vụ kỳ trước. Em cần hướng dẫn thủ tục xin gia hạn ạ.', at: '2026-11-06T01:05:00Z' },
    ],
  },
  {
    id: 'req-005', studentId: 'stu-005', requestType: 'GRADUATION_CHECK',
    title: 'Kiểm tra điều kiện tốt nghiệp — còn thiếu OJT',
    description: 'Em đã tích lũy 99 tín chỉ. Em còn thiếu OJT401 và CAP401, anh cho em hỏi lộ trình tốt nghiệp ạ.',
    status: 'RESOLVED',
    resolutionSummary: 'Duyệt đăng ký OJT401 kỳ 9 và CAP401 kỳ 10. Hoàn tất hồ sơ OJT trước 15/12.',
    createdAt: '2026-10-20T02:30:00Z',
    messages: [
      { from: 'student', content: 'Anh ơi, em còn thiếu mấy môn để tốt nghiệp ạ?', at: '2026-10-20T02:30:00Z' },
      { from: 'advisor', content: 'Chào em, anh đã kiểm tra. Em còn thiếu OJT401 (2 tín chỉ) và CAP401 (3 tín chỉ).', at: '2026-10-20T07:10:00Z' },
      { from: 'advisor', content: 'Anh duyệt đăng ký OJT401 kỳ 9 và CAP401 kỳ 10. Em hoàn tất hồ sơ OJT trước 15/12 nhé.', at: '2026-10-20T07:12:00Z' },
    ],
  },
  {
    id: 'req-006', studentId: 'stu-006', requestType: 'PLAN_REVIEW',
    title: 'Kế hoạch kỳ 9 — 18 tín chỉ có OJT',
    description: 'Em gửi kế hoạch 18 tín chỉ kỳ 9 gồm 3 môn chuyên ngành và OJT401.',
    status: 'RESOLVED',
    resolutionSummary: 'Duyệt kế hoạch kỳ 9 — 18 tín chỉ gồm 3 môn chuyên ngành và OJT401. Tiến độ tích lũy 116/132 tín chỉ.',
    createdAt: '2026-10-28T07:00:00Z',
    messages: [{ from: 'student', content: 'Anh duyệt giúp em kế hoạch kỳ 9 với ạ.', at: '2026-10-28T07:00:00Z' }],
  },
  {
    id: 'req-007', studentId: 'stu-009', requestType: 'ACADEMIC_GUIDANCE',
    title: 'Nên học lại môn nào để cải thiện GPA?',
    description: 'GPA em 5.40. Em muốn biết nên học lại môn nào để kéo GPA lên trên 6.0.',
    status: 'IN_PROGRESS',
    createdAt: '2026-11-03T09:15:00Z',
    messages: [
      { from: 'student', content: 'Chào anh, em muốn học lại môn để cải thiện GPA ạ.', at: '2026-11-03T09:15:00Z' },
      { from: 'advisor', content: 'Anh sẽ xem lại bảng điểm và gợi ý môn học lại cho em trong hôm nay.', at: '2026-11-03T10:00:00Z' },
    ],
  },
  {
    id: 'req-008', studentId: 'stu-011', requestType: 'COURSE_SELECTION',
    title: 'Em có nên đăng ký môn đồ án kỳ 5 không?',
    description: 'Em mới kỳ 5. Em nghe nói kỳ 5 có môn đồ án, em nên đăng ký môn đó không ạ?',
    status: 'RESOLVED',
    resolutionSummary: 'Nên đăng ký CAP403 đồ án cuối kỳ. Ưu tiên 2 môn chuyên ngành + 1 môn đồ án để giữ tải 16 tín chỉ.',
    createdAt: '2026-10-11T03:00:00Z',
    messages: [
      { from: 'student', content: 'Em nên đăng ký đồ án kỳ 5 không anh?', at: '2026-10-11T03:00:00Z' },
      { from: 'advisor', content: 'Nên đăng ký CAP403 đồ án cuối kỳ. Ưu tiên 2 môn chuyên ngành + 1 môn đồ án, tổng 16 tín chỉ.', at: '2026-10-11T04:20:00Z' },
    ],
  },
  {
    id: 'req-009', studentId: 'stu-007', requestType: 'OTHER',
    title: 'Chuyển nhóm học thuật sang nhóm khác',
    description: 'Em muốn chuyển từ nhóm SE-K22-C sang nhóm SE-K22-A. Em cần làm gì ạ?',
    status: 'CANCELLED',
    resolutionSummary: 'Nhóm SE-K22-A đã đóng, không thể chuyển. Em giữ nguyên nhóm C và tiếp tục học theo lộ trình K22.',
    createdAt: '2026-09-30T06:45:00Z',
    messages: [
      { from: 'student', content: 'Em muốn chuyển nhóm học ạ.', at: '2026-09-30T06:45:00Z' },
      { from: 'advisor', content: 'Nhóm SE-K22-A đã đóng nên không thể chuyển. Em giữ nguyên nhóm C nhé.', at: '2026-09-30T08:00:00Z' },
    ],
  },
];

const studentNameOf = (studentId: string): string =>
  MOCK_ADVISEE_STUDENTS.find((s) => s.id === studentId)?.fullName ?? 'Sinh viên';

const studentCodeOf = (studentId: string): string =>
  MOCK_ADVISEE_STUDENTS.find((s) => s.id === studentId)?.studentCode ?? '—';

const buildRequests = (): AdvisingRequest[] =>
  REQUEST_SEEDS.map((seed) => ({
    id: seed.id,
    studentId: seed.studentId,
    studentName: studentNameOf(seed.studentId),
    studentCode: studentCodeOf(seed.studentId),
    advisorId: MOCK_ADVISOR_ID,
    advisorName: MOCK_ADVISOR_NAME,
    studyPlanId: null,
    requestType: seed.requestType,
    title: seed.title,
    description: seed.description,
    status: seed.status,
    resolvedAt:
      seed.status === 'RESOLVED' || seed.status === 'CANCELLED' ? seed.createdAt : null,
    resolutionSummary: seed.resolutionSummary ?? null,
    createdAt: seed.createdAt,
    updatedAt: seed.createdAt,
  }));

const buildMessages = (): Record<string, MockAdvisingMessage[]> => {
  const map: Record<string, MockAdvisingMessage[]> = {};
  for (const seed of REQUEST_SEEDS) {
    map[seed.id] = seed.messages.map((m, index) => ({
      id: `${seed.id}-msg-${index + 1}`,
      senderId: m.from === 'advisor' ? MOCK_ADVISOR_ID : seed.studentId,
      senderName: m.from === 'advisor' ? MOCK_ADVISOR_NAME : studentNameOf(seed.studentId),
      content: m.content,
      internal: m.internal ?? false,
      createdAt: m.at,
    }));
  }
  return map;
};

/** Yêu cầu tư vấn — nguồn chuẩn cho cả bảng Request và hội thoại. */
export const MOCK_ADVISING_REQUESTS: AdvisingRequest[] = buildRequests();

/** Tin nhắn theo từng request (cả reply công khai lẫn internal note). */
export const MOCK_ADVISING_MESSAGES: Record<string, MockAdvisingMessage[]> = buildMessages();

/* ------------------------------------------------------------------ */
/* Lịch hẹn + lịch rảnh                                                */
/* ------------------------------------------------------------------ */

const iso = (dayOffset: number, hour: number, minute = 0): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

interface AppointmentSeed {
  id: string;
  studentId: string;
  dayOffset: number;
  hour: number;
  durationMin: number;
  reason: string;
  status: BookingStatus;
  decisionNote?: string;
  consultationSummary?: string;
}

const APPOINTMENT_SEEDS: AppointmentSeed[] = [
  { id: 'apt-001', studentId: 'stu-002', dayOffset: 1, hour: 9, durationMin: 30, reason: 'Tư vấn cải thiện học kỳ khi đang probation', status: 'PENDING' },
  { id: 'apt-002', studentId: 'stu-001', dayOffset: 1, hour: 11, durationMin: 30, reason: 'Chốt kế hoạch đăng ký kỳ 9 có OJT401', status: 'PENDING' },
  { id: 'apt-003', studentId: 'stu-004', dayOffset: 2, hour: 14, durationMin: 45, reason: 'Thủ tục gia hạn học kỳ do đình chỉ học vụ', status: 'PENDING' },
  { id: 'apt-004', studentId: 'stu-003', dayOffset: 3, hour: 10, durationMin: 30, reason: 'Hỏi về chuyên ngành Game Development', status: 'ACCEPTED' },
  { id: 'apt-005', studentId: 'stu-009', dayOffset: 4, hour: 15, durationMin: 30, reason: 'Học lại môn để kéo GPA', status: 'ACCEPTED' },
  { id: 'apt-006', studentId: 'stu-006', dayOffset: -2, hour: 9, durationMin: 30, reason: 'Duyệt kế hoạch học tập kỳ 9', status: 'COMPLETED', consultationSummary: 'Đã duyệt 18 tín chỉ kỳ 9 gồm 3 môn chuyên ngành và OJT401. Tiến độ tích lũy 116/132 tín chỉ.' },
  { id: 'apt-007', studentId: 'stu-005', dayOffset: -5, hour: 13, durationMin: 30, reason: 'Hỏi về lộ trình tốt nghiệp', status: 'COMPLETED', consultationSummary: 'Sinh viên còn thiếu OJT401 và CAP401. Đã hướng dẫn đăng ký OJT401 kỳ 9, CAP401 kỳ 10.' },
  { id: 'apt-008', studentId: 'stu-007', dayOffset: -1, hour: 16, durationMin: 30, reason: 'Đổi nhóm học thuật', status: 'REJECTED', decisionNote: 'Nhóm đích đã đóng, không thể chuyển. Bạn vui lòng giữ nguyên nhóm hiện tại.' },
  { id: 'apt-009', studentId: 'stu-011', dayOffset: -3, hour: 10, durationMin: 30, reason: 'Hỏi về môn đồ án kỳ 5', status: 'COMPLETED', consultationSummary: 'Tư vấn đăng ký CAP403 đồ án cuối kỳ cùng 2 môn chuyên ngành, tổng 16 tín chỉ.' },
  { id: 'apt-010', studentId: 'stu-012', dayOffset: 2, hour: 8, durationMin: 30, reason: 'Hỏi về cảnh báo học vụ lần 2', status: 'NO_SHOW' },
  { id: 'apt-011', studentId: 'stu-008', dayOffset: 5, hour: 11, durationMin: 30, reason: 'Trao đổi về chuyên ngành .NET', status: 'PENDING' },
  { id: 'apt-012', studentId: 'stu-010', dayOffset: -7, hour: 14, durationMin: 30, reason: 'Xác nhận đủ điều kiện tốt nghiệp', status: 'CANCELLED', decisionNote: 'Sinh viên đã đủ điều kiện tốt nghiệp, không cần buổi tư vấn này.' },
];

const buildAppointments = (): AdvisorAppointment[] =>
  APPOINTMENT_SEEDS.map((seed) => {
    const start = new Date(iso(seed.dayOffset, seed.hour));
    const end = new Date(start.getTime() + seed.durationMin * 60_000);
    return {
      id: seed.id,
      studentId: seed.studentId,
      studentName: studentNameOf(seed.studentId),
      studentCode: studentCodeOf(seed.studentId),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      reason: seed.reason,
      status: seed.status,
      decisionNote: seed.decisionNote ?? null,
      consultationSummary: seed.consultationSummary ?? null,
      createdAt: iso(seed.dayOffset - 3, 10),
    };
  });

/** Lịch hẹn của advisor. */
export const MOCK_APPOINTMENTS: AdvisorAppointment[] = buildAppointments();

/** Lịch rảnh tuần của advisor (POST /advisor/availability). */
export const MOCK_AVAILABILITY: AvailabilitySlot[] = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '11:30' },
  { dayOfWeek: 1, startTime: '14:00', endTime: '16:00' },
  { dayOfWeek: 2, startTime: '09:00', endTime: '11:30' },
  { dayOfWeek: 3, startTime: '09:00', endTime: '11:30' },
  { dayOfWeek: 3, startTime: '14:00', endTime: '16:00' },
  { dayOfWeek: 4, startTime: '09:00', endTime: '11:30' },
  { dayOfWeek: 5, startTime: '09:00', endTime: '11:30' },
  { dayOfWeek: 5, startTime: '14:00', endTime: '16:00' },
];

/* ------------------------------------------------------------------ */
/* Kế hoạch học tập                                                    */
/* ------------------------------------------------------------------ */

export interface MockStudyPlan {
  id: string;
  studentId: string;
  semesterCode: string;
  version: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  totalCredits: number;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  previousPlanId: string | null;
  courses: { code: string; name: string; credits: number }[];
  issues: string[];
}

const PLAN_COURSES: Record<string, { code: string; name: string; credits: number }[]> = {
  heavy: [
    { code: 'SE201', name: 'Node.js Development', credits: 4 },
    { code: 'SE202', name: '.NET Development', credits: 4 },
    { code: 'SE203', name: 'Game Development', credits: 4 },
    { code: 'SE204', name: 'Advanced Java Programming', credits: 4 },
    { code: 'EL101', name: 'Professional English 1', credits: 3 },
  ],
  normal: [
    { code: 'SE201', name: 'Node.js Development', credits: 4 },
    { code: 'SE202', name: '.NET Development', credits: 4 },
    { code: 'EL101', name: 'Professional English 1', credits: 3 },
    { code: 'OJT401', name: 'Internship 1', credits: 2 },
  ],
  light: [
    { code: 'SE101', name: 'Database Systems', credits: 4 },
    { code: 'SE104', name: 'Operating Systems', credits: 4 },
    { code: 'MA005', name: 'Probability and Statistics', credits: 3 },
  ],
  ojt: [
    { code: 'SE204', name: 'Advanced Java Programming', credits: 4 },
    { code: 'EL101', name: 'Professional English 1', credits: 3 },
    { code: 'OJT401', name: 'Internship 1', credits: 2 },
    { code: 'CAP401', name: 'Graduation Project 1', credits: 3 },
  ],
};

interface PlanSeed {
  id: string;
  studentId: string;
  semesterCode: string;
  version: number;
  status: MockStudyPlan['status'];
  set: keyof typeof PLAN_COURSES;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  issues?: string[];
}

const PLAN_SEEDS: PlanSeed[] = [
  {
    id: 'plan-001', studentId: 'stu-001', semesterCode: 'FA2026', version: 2,
    status: 'SUBMITTED', set: 'heavy', submittedAt: '2026-11-03T08:00:00Z',
    issues: ['Tải tín chỉ cao: 19 tín chỉ vượt ngưỡng khuyến nghị 18.', 'OJT401 chưa được đưa vào kế hoạch dù đã đủ 96 tín chỉ.'],
  },
  {
    id: 'plan-002', studentId: 'stu-003', semesterCode: 'FA2026', version: 1,
    status: 'SUBMITTED', set: 'normal', submittedAt: '2026-11-02T03:00:00Z',
  },
  {
    id: 'plan-003', studentId: 'stu-002', semesterCode: 'FA2026', version: 1,
    status: 'SUBMITTED', set: 'light', submittedAt: '2026-11-05T09:30:00Z',
    issues: ['Tải tín chỉ thấp: 11 tín chỉ — dưới mức tối thiểu học kỳ.'],
  },
  {
    id: 'plan-004', studentId: 'stu-006', semesterCode: 'FA2026', version: 3,
    status: 'APPROVED', set: 'normal', submittedAt: '2026-10-25T02:00:00Z',
    reviewedAt: '2026-10-26T07:20:00Z',
    reviewNotes: 'Cân bằng tải tín chỉ tốt, có OJT đúng kỳ. Đã duyệt.',
  },
  {
    id: 'plan-005', studentId: 'stu-009', semesterCode: 'FA2026', version: 1,
    status: 'NEEDS_REVISION', set: 'ojt', submittedAt: '2026-10-30T06:00:00Z',
    reviewedAt: '2026-10-31T02:40:00Z',
    reviewNotes: 'Chưa đủ tín chỉ tích lũy để đăng OJT401. Hãy bỏ OJT401 và nộp lại kế hoạch.',
  },
  {
    id: 'plan-006', studentId: 'stu-005', semesterCode: 'FA2026', version: 2,
    status: 'REJECTED', set: 'heavy', submittedAt: '2026-10-12T04:00:00Z',
    reviewedAt: '2026-10-13T08:00:00Z',
    reviewNotes: '5 môn chuyên ngành cùng lúc không đúng lộ trình. Vui lòng chọn 2 học phần và nộp lại.',
  },
];

const buildPlans = (): MockStudyPlan[] =>
  PLAN_SEEDS.map((seed) => {
    const courses = PLAN_COURSES[seed.set];
    return {
      id: seed.id,
      studentId: seed.studentId,
      semesterCode: seed.semesterCode,
      version: seed.version,
      status: seed.status,
      totalCredits: courses.reduce((sum, c) => sum + c.credits, 0),
      submittedAt: seed.submittedAt,
      reviewedAt: seed.reviewedAt ?? null,
      reviewNotes: seed.reviewNotes ?? null,
      previousPlanId: seed.version > 1 ? `${seed.id}-v${seed.version - 1}` : null,
      courses,
      issues: seed.issues ?? [],
    };
  });

/** Kế hoạch học tập chờ/đã xử lý. */
export const MOCK_STUDY_PLANS: MockStudyPlan[] = buildPlans();

/* ------------------------------------------------------------------ */
/* Hồ sơ advisor + thông báo                                           */
/* ------------------------------------------------------------------ */

export const MOCK_ADVISOR_PROFILE = {
  id: MOCK_ADVISOR_ID,
  fullName: MOCK_ADVISOR_NAME,
  email: 'khoa.tm@fpt.edu.vn',
  maxAdvisees: 25,
  activeAdvisees: MOCK_ADVISEE_STUDENTS.length,
  status: 'ACTIVE',
  assignmentStartDate: '2024-09-01',
};

export const MOCK_ADVISOR_NOTIFICATIONS = [
  {
    id: 'ntf-001', recipientUserId: MOCK_ADVISOR_ID, notificationType: 'ADVISOR_REQUEST' as const,
    title: 'New advising request', message: 'Nguyễn Hoàng An asked about registering 20 credits with OJT401.',
    actionUrl: '/advisor/advising-requests', relatedStudentId: 'stu-001', resolvedAt: null, isRead: false, readAt: null,
    createdAt: '2026-11-04T02:10:00Z',
  },
  {
    id: 'ntf-002', recipientUserId: MOCK_ADVISOR_ID, notificationType: 'ADVISOR_REQUEST' as const,
    title: 'New advising request', message: 'Trần Thị Bình asked for guidance on probation recovery.',
    actionUrl: '/advisor/advising-requests', relatedStudentId: 'stu-002', resolvedAt: null, isRead: false, readAt: null,
    createdAt: '2026-11-05T08:40:00Z',
  },
  {
    id: 'ntf-003', recipientUserId: MOCK_ADVISOR_ID, notificationType: 'MESSAGE' as const,
    title: 'Student replied', message: 'Đỗ Thanh Lam replied to your advising conversation.',
    actionUrl: '/advisor/conversations', relatedStudentId: 'stu-009', resolvedAt: null, isRead: true, readAt: '2026-11-03T09:30:00Z',
    createdAt: '2026-11-03T09:15:00Z',
  },
  {
    id: 'ntf-004', recipientUserId: MOCK_ADVISOR_ID, notificationType: 'PLAN_STATUS' as const,
    title: 'Study plan awaiting review', message: 'Hoàng Minh Huy submitted a study plan for semester FA2026.',
    actionUrl: '/advisor/study-plans', relatedStudentId: 'stu-007', resolvedAt: null, isRead: false, readAt: null,
    createdAt: '2026-11-03T08:00:00Z',
  },
  {
    id: 'ntf-005', recipientUserId: MOCK_ADVISOR_ID, notificationType: 'REMINDER' as const,
    title: 'Appointment reminder', message: '2 pending appointment requests need your response.',
    actionUrl: '/advisor/appointments', relatedStudentId: null, resolvedAt: null, isRead: true, readAt: '2026-11-02T02:00:00Z',
    createdAt: '2026-11-02T01:30:00Z',
  },
];

/* ------------------------------------------------------------------ */
/* Bảng điểm / tiến độ (dùng cho Student 360 + review kế hoạch)        */
/* ------------------------------------------------------------------ */

export interface MockTranscriptRow {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  semesterCode: string;
  semesterName: string;
  finalScore: number | null;
  status: string;
  attemptNumber: number;
  creditsEarned: number;
}

const TRANSCRIPT_BY_STUDENT: Record<string, { code: string; name: string; credits: number; score: number | null }[]> = {
  'stu-001': [
    { code: 'IT001', name: 'Introduction to Programming', credits: 4, score: 8.5 },
    { code: 'MA003', name: 'Calculus 1', credits: 4, score: 7.8 },
    { code: 'GE001', name: 'English 1', credits: 3, score: 7.2 },
    { code: 'IT002', name: 'Object Oriented Programming', credits: 4, score: 8.9 },
    { code: 'IT003', name: 'Data Structures and Algorithms', credits: 4, score: 8.1 },
    { code: 'SE101', name: 'Database Systems', credits: 4, score: 8.7 },
    { code: 'SE104', name: 'Operating Systems', credits: 4, score: 7.6 },
    { code: 'SE105', name: 'Computer Networks', credits: 4, score: 8.0 },
    { code: 'SE201', name: 'Node.js Development', credits: 4, score: 9.1 },
    { code: 'SE202', name: '.NET Development', credits: 4, score: 8.3 },
    { code: 'EL101', name: 'Professional English 1', credits: 3, score: 7.4 },
  ],
  'stu-002': [
    { code: 'IT001', name: 'Introduction to Programming', credits: 4, score: 6.2 },
    { code: 'MA003', name: 'Calculus 1', credits: 4, score: 5.4 },
    { code: 'GE001', name: 'English 1', credits: 3, score: 6.0 },
    { code: 'IT002', name: 'Object Oriented Programming', credits: 4, score: 6.8 },
    { code: 'IT003', name: 'Data Structures and Algorithms', credits: 4, score: 5.1 },
    { code: 'SE101', name: 'Database Systems', credits: 4, score: 6.4 },
    { code: 'SE104', name: 'Operating Systems', credits: 4, score: 4.8 },
  ],
  'stu-003': [
    { code: 'IT001', name: 'Introduction to Programming', credits: 4, score: 9.4 },
    { code: 'IT002', name: 'Object Oriented Programming', credits: 4, score: 9.1 },
    { code: 'IT003', name: 'Data Structures and Algorithms', credits: 4, score: 9.6 },
    { code: 'SE101', name: 'Database Systems', credits: 4, score: 8.9 },
    { code: 'SE103', name: 'Software Engineering', credits: 4, score: 8.7 },
    { code: 'SE201', name: 'Node.js Development', credits: 4, score: 9.0 },
    { code: 'SE203', name: 'Game Development', credits: 4, score: 8.8 },
    { code: 'EL101', name: 'Professional English 1', credits: 3, score: 8.1 },
  ],
  'stu-004': [
    { code: 'IT001', name: 'Introduction to Programming', credits: 4, score: 5.2 },
    { code: 'IT002', name: 'Object Oriented Programming', credits: 4, score: 4.6 },
    { code: 'IT003', name: 'Data Structures and Algorithms', credits: 4, score: 3.9 },
    { code: 'SE101', name: 'Database Systems', credits: 4, score: 5.5 },
  ],
};

const GENERIC_TRANSCRIPT: { code: string; name: string; credits: number; score: number | null }[] = [
  { code: 'IT001', name: 'Introduction to Programming', credits: 4, score: 7.6 },
  { code: 'MA003', name: 'Calculus 1', credits: 4, score: 6.9 },
  { code: 'GE001', name: 'English 1', credits: 3, score: 7.1 },
  { code: 'IT002', name: 'Object Oriented Programming', credits: 4, score: 7.9 },
  { code: 'IT003', name: 'Data Structures and Algorithms', credits: 4, score: 7.4 },
  { code: 'SE101', name: 'Database Systems', credits: 4, score: 7.7 },
];

export const buildMockTranscript = (studentId: string): MockTranscriptRow[] => {
  const rows = TRANSCRIPT_BY_STUDENT[studentId] ?? GENERIC_TRANSCRIPT;
  return rows.map((row, index) => ({
    id: `${studentId}-tr-${index + 1}`,
    courseCode: row.code,
    courseName: row.name,
    credits: row.credits,
    semesterCode: index < 4 ? 'FA2022' : 'SP2023',
    semesterName: index < 4 ? 'Fall 2022' : 'Spring 2023',
    finalScore: row.score,
    status: row.score != null && row.score >= 5 ? 'COMPLETED' : 'FAILED',
    attemptNumber: 1,
    creditsEarned: row.score != null && row.score >= 5 ? row.credits : 0,
  }));
};

/* ------------------------------------------------------------------ */
/* Reset store (dùng cho test / nút reset trong dev)                    */
/* ------------------------------------------------------------------ */

export const resetAdvisorMockData = (): void => {
  const freshRequests = buildRequests();
  const freshMessages = buildMessages();
  const freshAppointments = buildAppointments();
  const freshPlans = buildPlans();

  MOCK_ADVISING_REQUESTS.splice(0, MOCK_ADVISING_REQUESTS.length, ...freshRequests);
  for (const key of Object.keys(MOCK_ADVISING_MESSAGES)) delete MOCK_ADVISING_MESSAGES[key];
  Object.assign(MOCK_ADVISING_MESSAGES, freshMessages);
  MOCK_APPOINTMENTS.splice(0, MOCK_APPOINTMENTS.length, ...freshAppointments);
  MOCK_STUDY_PLANS.splice(0, MOCK_STUDY_PLANS.length, ...freshPlans);
  MOCK_AVAILABILITY.splice(
    0,
    MOCK_AVAILABILITY.length,
    { dayOfWeek: 1, startTime: '09:00', endTime: '11:30' },
    { dayOfWeek: 1, startTime: '14:00', endTime: '16:00' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '11:30' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '11:30' },
    { dayOfWeek: 3, startTime: '14:00', endTime: '16:00' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '11:30' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '11:30' },
    { dayOfWeek: 5, startTime: '14:00', endTime: '16:00' },
  );
};

/** Bản quyển hội thoại dùng chung shape với AcademicAdvisingDetail. */
export type MockConversationDetail = AcademicAdvisingDetail;

/** Bản quyển request dùng chung shape với AcademicAdvisingRequest. */
export type MockConversationRequest = AcademicAdvisingRequest;

/** Bản quyển curriculum plan dùng chung shape với CurriculumPlan. */
export type MockCurriculumPlan = CurriculumPlan;
