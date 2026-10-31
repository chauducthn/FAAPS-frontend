/**
 * Dữ liệu giả cho Advisor Portal — dùng khi `IS_MOCK_MODE` bật.
 *
 * Mọi dữ liệu ở đây nhất quán với các type trong:
 *   - `src/modules/advising/types/advising.ts`      (AdvisingRequest, AdviseeStudent, StudentNotification)
 *   - `src/modules/advising/services/advisorService.ts` (AdvisorProfile, AdvisorStudentDetail)
 *   - `src/modules/advising/types/study-plan.ts`     (StudyPlanSummary, AdvisorStudyPlanDetail)
 *   - `src/modules/appointment/types/appointment.ts`    (AdvisorAppointment, AvailabilitySlot)
 *   - `src/modules/academic/services/studentAcademicService.ts` (AcademicAdvisingDetail, Progress, TranscriptRow)
 */

import type {
  AdviseeStudent,
  AdvisingRequest,
  StudentNotification,
} from '@/modules/advising/types/advising';
import type {
  AdvisorStudyPlanDetail,
  StudyPlanPage,
  StudyPlanSummary,
} from '@/modules/advising/types/study-plan';
import type {
  AcademicAdvisingDetail,
  AcademicAdvisingRequest,
  AcademicStudentProfile,
  Progress,
  TranscriptRow,
} from '@/modules/academic/services/studentAcademicService';
import type {
  AdvisorAppointment,
  AvailabilitySlot,
} from '@/modules/appointment/types/appointment';
import type { AdvisorProfile, AdvisorStudentDetail } from '@/modules/advising/services/advisorService';
import { MOCK_NETWORK_DELAY_MS } from '@/config/mockConfig';

/** Giả lập độ trễ mạng để UI hiện skeleton/loading giống thật. */
export const mockDelay = (ms: number = MOCK_NETWORK_DELAY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Ngày trong tuần hiện tại (Thứ 2 = 0). Dùng để lịch hẹn mock nằm trong tuần đang xem. */
const dayInCurrentWeek = (weekdayIndex: number, hour: number, minute = 0): string => {
  const now = new Date();
  const monday = new Date(now);
  const offset = (now.getDay() + 6) % 7; // Chuyển Chủ nhật (0) → 7 thành Thứ 2 (1) → 0
  monday.setDate(now.getDate() - offset);
  monday.setHours(hour, minute, 0, 0);
  monday.setDate(monday.getDate() + weekdayIndex);
  return monday.toISOString();
};

/** ISO timestamp cách đây `days` ngày. */
const daysAgo = (days: number, hour = 9): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 30, 0, 0);
  return date.toISOString();
};

// ---------------------------------------------------------------------------
// 1. Yêu cầu tư vấn — 15 phần tử, đủ PENDING / IN_PROGRESS / RESOLVED / CANCELLED
// ---------------------------------------------------------------------------

export const mockAdvisingRequests: AdvisingRequest[] = [
  {
    id: 'req-001',
    studentId: 'stu-001',
    studentName: 'Nguyễn Thị Hoa',
    studentCode: 'SE2021001',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'COURSE_SELECTION',
    title: 'Xin tư vấn chọn môn học kỳ 9',
    description:
      'Em không biết nên chọn 2 môn điện tử hay 2 môn kinh tế để đủ chuyên ngành. Mong thầy tư vấn giúp em ưu tiên môn nào.',
    status: 'PENDING',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(1, 8),
    updatedAt: daysAgo(1, 8),
  },
  {
    id: 'req-002',
    studentId: 'stu-002',
    studentName: 'Lê Văn Minh',
    studentCode: 'SE2021002',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: 'plan-002',
    requestType: 'PLAN_REVIEW',
    title: 'Duyệt kế hoạch học tập học kỳ 9',
    description: 'Em gửi kế hoạch học tập kỳ 9, tổng 18 tín chỉ, nhờ thầy duyệt giúp em.',
    status: 'PENDING',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(1, 14),
    updatedAt: daysAgo(1, 14),
  },
  {
    id: 'req-003',
    studentId: 'stu-003',
    studentName: 'Phạm Thu Hà',
    studentCode: 'SE2021003',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'GRADUATION_CHECK',
    title: 'Hỏi điều kiện tốt nghiệp',
    description:
      'Em đã học đủ 120 tín chỉ nhưng chưa biết đã đủ điều kiện tốt nghiệp chưa, còn thiếu môn OJT không ạ?',
    status: 'PENDING',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(2, 10),
    updatedAt: daysAgo(2, 10),
  },
  {
    id: 'req-004',
    studentId: 'stu-004',
    studentName: 'Võ Thành Long',
    studentCode: 'SE2021004',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'ACADEMIC_GUIDANCE',
    title: 'Học kỳ 8 em bị trễ 2 môn',
    description: 'Em thi trượt 2 môn học kỳ 8, cần thầy hướng dẫn kỳ học kỳ 9 như thế nào.',
    status: 'PENDING',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(3, 16),
    updatedAt: daysAgo(3, 16),
  },
  {
    id: 'req-005',
    studentId: 'stu-005',
    studentName: 'Đặng Kim Ngân',
    studentCode: 'SE2021005',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: 'plan-005',
    requestType: 'PLAN_REVIEW',
    title: 'Kế hoạch học tập có môn thiếu tiên quết',
    description: 'Em vừa đổi môn điện tử 3, kế hoạch cũ không còn hợp lệ. Nhờ thầy xem giúp em.',
    status: 'IN_PROGRESS',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(4, 9),
    updatedAt: daysAgo(1, 11),
  },
  {
    id: 'req-006',
    studentId: 'stu-006',
    studentName: 'Hoàng Gia Bảo',
    studentCode: 'SE2021006',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'ACADEMIC_GUIDANCE',
    title: 'Xin nghỉ học 1 kỳ để đi làm',
    description: 'Em có cơ hội đi thực tập 6 tháng, xin thầy tư vấn thủ tục nghỉ học và bảo vệ đồ án.',
    status: 'IN_PROGRESS',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(5, 13),
    updatedAt: daysAgo(2, 15),
  },
  {
    id: 'req-007',
    studentId: 'stu-007',
    studentName: 'Bùi Thị Mai',
    studentCode: 'SE2021007',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'COURSE_SELECTION',
    title: 'Chọn môn quản trị kinh doanh',
    description: 'Em muốn lấy môn quản trị kinh doanh thay cho môn kinh tế vi mô.',
    status: 'IN_PROGRESS',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(6, 10),
    updatedAt: daysAgo(3, 9),
  },
  {
    id: 'req-008',
    studentId: 'stu-008',
    studentName: 'Đỗ Trung Kiên',
    studentCode: 'SE2021008',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'GRADUATION_CHECK',
    title: 'Điều kiện thực tập OJT',
    description: 'Em cần biết quy trình đăng ký OJT và thời hạn nộp báo cáo thực tập.',
    status: 'RESOLVED',
    resolvedAt: daysAgo(2, 11),
    resolutionSummary:
      'Đã hướng dẫn quy trình đăng ký OJT qua hệ thống và hạn nộp báo cáo trước 15/12. Sinh viên tự tạo hồ sơ OJT trong mục Kế hoạch học tập.',
    createdAt: daysAgo(9, 9),
    updatedAt: daysAgo(2, 11),
  },
  {
    id: 'req-009',
    studentId: 'stu-009',
    studentName: 'Trương Thanh Hà',
    studentCode: 'SE2021009',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: 'plan-009',
    requestType: 'PLAN_REVIEW',
    title: 'Duyệt lại kế hoạch học tập kỳ 8',
    description: 'Kế hoạch học tập kỳ 8 của em đã bị thầy yêu cầu sửa, em gửi lại bản mới.',
    status: 'RESOLVED',
    resolvedAt: daysAgo(4, 15),
    resolutionSummary: 'Đã duyệt kế hoạch học tập kỳ 8 sau khi sinh viên bổ sung môn tiên quết.',
    createdAt: daysAgo(12, 14),
    updatedAt: daysAgo(4, 15),
  },
  {
    id: 'req-010',
    studentId: 'stu-010',
    studentName: 'Lý Quốc Dũng',
    studentCode: 'SE2021010',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'ACADEMIC_GUIDANCE',
    title: 'Học kèm môn Cấu trúc dữ liệu',
    description: 'Em cảm thấy khó theo kịp môn Cấu trúc dữ liệu, xin thầy tư vấn cách học hiệu quả.',
    status: 'RESOLVED',
    resolvedAt: daysAgo(6, 10),
    resolutionSummary:
      'Đã tư vấn lịch học 4 buổi/tuần, chia nhóm ôn tập với các bạn cùng lớp và làm bài tập từ giáo trình.',
    createdAt: daysAgo(15, 10),
    updatedAt: daysAgo(6, 10),
  },
  {
    id: 'req-011',
    studentId: 'stu-011',
    studentName: 'Vũ Khánh Linh',
    studentCode: 'SE2021011',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'OTHER',
    title: 'Thủ tục chứng nhận tốt nghiệp',
    description: 'Em cần hỏi thủ tục xin chứng nhận tốt nghiệp tạm thời.',
    status: 'RESOLVED',
    resolvedAt: daysAgo(8, 16),
    resolutionSummary: 'Hướng dẫn nộp hồ sơ tại phòng Đào tạo, thời gian xử lý 3 ngày làm việc.',
    createdAt: daysAgo(18, 9),
    updatedAt: daysAgo(8, 16),
  },
  {
    id: 'req-012',
    studentId: 'stu-012',
    studentName: 'Đỗ Trâm Thanh',
    studentCode: 'SE2021012',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'COURSE_SELECTION',
    title: 'Môn tự chọn nhóm 3',
    description: 'Nhóm 3 có 4 môn, em phân vân giữa marketing và quản trị vận hành.',
    status: 'CANCELLED',
    resolvedAt: null,
    resolutionSummary: 'Sinh viên đã tự chọn môn và không cần tư vấn thêm.',
    createdAt: daysAgo(20, 11),
    updatedAt: daysAgo(19, 9),
  },
  {
    id: 'req-013',
    studentId: 'stu-013',
    studentName: 'Ngô Hoài An',
    studentCode: 'SE2021013',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'GRADUATION_CHECK',
    title: 'Đủ điều kiện tốt nghiệp chưa',
    description: 'Em tích lũy đủ 130 tín chỉ, xin thầy xác nhận.',
    status: 'RESOLVED',
    resolvedAt: daysAgo(10, 15),
    resolutionSummary: 'Đã xác nhận đủ điều kiện tốt nghiệp, sinh viên có thể đăng ký bảo vệ đồ án.',
    createdAt: daysAgo(22, 15),
    updatedAt: daysAgo(10, 15),
  },
  {
    id: 'req-014',
    studentId: 'stu-014',
    studentName: 'Phan Xuân Vinh',
    studentCode: 'SE2021014',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: 'plan-014',
    requestType: 'PLAN_REVIEW',
    title: 'Duyệt kế hoạch học tập kỳ 10',
    description: 'Kế hoạch kỳ 10 của em chỉ còn 12 tín chỉ, có được phép không ạ?',
    status: 'PENDING',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(0, 9),
    updatedAt: daysAgo(0, 9),
  },
  {
    id: 'req-015',
    studentId: 'stu-015',
    studentName: 'Đinh Mỹ Duyên',
    studentCode: 'SE2021015',
    advisorId: 'adv-001',
    advisorName: 'Trần Minh Khoa',
    studyPlanId: null,
    requestType: 'ACADEMIC_GUIDANCE',
    title: 'Chuyển hướng chuyên ngành',
    description: 'Em muốn chuyển từ ngành SE sang ngành An toàn thông tin, thủ tục thế nào?',
    status: 'IN_PROGRESS',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: daysAgo(1, 17),
    updatedAt: daysAgo(0, 10),
  },
];

// ---------------------------------------------------------------------------
// 2. Chi tiết yêu cầu + thread trò chuyện
// ---------------------------------------------------------------------------

/** Map request -> danh sách message, dùng cho `mockRequestDetail`. */
const mockMessages: Record<string, AcademicAdvisingDetail['messages']> = {
  'req-005': [
    {
      id: 'msg-005-1',
      senderId: 'stu-005',
      senderName: 'Đặng Kim Ngân',
      content: 'Chào thầy, em gửi lại kế hoạch học tập kỳ 9 ạ. Em đã đổi môn CSDL3 sang môn khác.',
      internal: false,
      createdAt: daysAgo(4, 9),
    },
    {
      id: 'msg-005-2',
      senderId: 'adv-001',
      senderName: 'Trần Minh Khoa',
      content: 'Cảm ơn em. Thầy đã xem, thầy sẽ kiểm tra lại tiên quết và phản hồi trong hôm nay.',
      internal: false,
      createdAt: daysAgo(3, 10),
    },
    {
      id: 'msg-005-3',
      senderId: 'adv-001',
      senderName: 'Trần Minh Khoa',
      content: 'Ghi chú nội bộ: cần đối chiếu lại danh sách môn điện tử với kế hoạch của các khóa trước.',
      internal: true,
      createdAt: daysAgo(3, 10),
    },
    {
      id: 'msg-005-4',
      senderId: 'stu-005',
      senderName: 'Đặng Kim Ngân',
      content: 'Dạ, em chờ thầy ạ. Em có thể gửi thêm bản chụp mục tiên quết nếu thầy cần.',
      internal: false,
      createdAt: daysAgo(1, 11),
    },
  ],
  'req-015': [
    {
      id: 'msg-015-1',
      senderId: 'stu-015',
      senderName: 'Đinh Mỹ Duyên',
      content: 'Chào thầy, em muốn chuyển sang chuyên ngành An toàn thông tin từ học kỳ 10.',
      internal: false,
      createdAt: daysAgo(1, 17),
    },
    {
      id: 'msg-015-2',
      senderId: 'adv-001',
      senderName: 'Trần Minh Khoa',
      content: 'Chào em, thầy cần xác nhận thêm về kết quả học kỳ 9 và môn tiên quết trước khi tư vấn cụ thể.',
      internal: false,
      createdAt: daysAgo(0, 10),
    },
  ],
};

/**
 * Trả về chi tiết một yêu cầu kèm thread trò chuyện.
 * Nếu id không có trong dữ liệu mock, sinh thread mặc định từ thông tin của request đó.
 */
export const mockRequestDetail = (id: string): AcademicAdvisingDetail => {
  const request =
    mockAdvisingRequests.find((item) => item.id === id) ?? mockAdvisingRequests[0];

  const requestDto: AcademicAdvisingRequest = {
    id: request.id,
    studentId: request.studentId,
    studentName: request.studentName,
    advisorId: request.advisorId,
    advisorName: request.advisorName,
    title: request.title,
    description: request.description ?? '',
    requestType: request.requestType,
    status: request.status,
    resolutionSummary: request.resolutionSummary,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };

  const messages =
    mockMessages[request.id] ??
    [
      {
        id: `msg-${request.id}-1`,
        senderId: request.studentId,
        senderName: request.studentName,
        content: request.description ?? '',
        internal: false,
        createdAt: request.createdAt,
      },
      {
        id: `msg-${request.id}-2`,
        senderId: 'adv-001',
        senderName: 'Trần Minh Khoa',
        content: 'Cảm ơn em, thầy đã nhận được yêu cầu và sẽ phản hồi sớm.',
        internal: false,
        createdAt: request.updatedAt,
      },
    ];

  return { request: requestDto, messages };
};

// ---------------------------------------------------------------------------
// 3. Lịch hẹn của advisor — 10 phần tử, đủ ACCEPTED / REJECTED / PENDING
// ---------------------------------------------------------------------------

export const mockAdvisorAppointments: AdvisorAppointment[] = [
  {
    id: 'apt-001',
    studentId: 'stu-001',
    studentName: 'Nguyễn Thị Hoa',
    studentCode: 'SE2021001',
    startTime: dayInCurrentWeek(0, 9),
    endTime: dayInCurrentWeek(0, 9, 30),
    reason: 'Em muốn hỏi về việc chọn môn điện tử và quản trị cho kỳ tới.',
    status: 'ACCEPTED',
    decisionNote: null,
    createdAt: daysAgo(2, 10),
  },
  {
    id: 'apt-002',
    studentId: 'stu-002',
    studentName: 'Lê Văn Minh',
    studentCode: 'SE2021002',
    startTime: dayInCurrentWeek(0, 10),
    endTime: dayInCurrentWeek(0, 10, 30),
    reason: 'Duyệt kế hoạch học tập kỳ 9 ạ.',
    status: 'ACCEPTED',
    decisionNote: null,
    createdAt: daysAgo(2, 11),
  },
  {
    id: 'apt-003',
    studentId: 'stu-003',
    studentName: 'Phạm Thu Hà',
    studentCode: 'SE2021003',
    startTime: dayInCurrentWeek(0, 14),
    endTime: dayInCurrentWeek(0, 14, 30),
    reason: 'Hỏi về điều kiện tốt nghiệp và môn OJT.',
    status: 'PENDING',
    decisionNote: null,
    createdAt: daysAgo(1, 15),
  },
  {
    id: 'apt-004',
    studentId: 'stu-004',
    studentName: 'Võ Thành Long',
    studentCode: 'SE2021004',
    startTime: dayInCurrentWeek(1, 9),
    endTime: dayInCurrentWeek(1, 9, 30),
    reason: 'Em bị trễ 2 môn kỳ 8, cần thầy tư vấn cách khắc phục.',
    status: 'ACCEPTED',
    decisionNote: null,
    createdAt: daysAgo(3, 9),
  },
  {
    id: 'apt-005',
    studentId: 'stu-005',
    studentName: 'Đặng Kim Ngân',
    studentCode: 'SE2021005',
    startTime: dayInCurrentWeek(1, 11),
    endTime: dayInCurrentWeek(1, 11, 30),
    reason: 'Thảo luận kế hoạch học tập sau khi đổi môn.',
    status: 'ACCEPTED',
    decisionNote: null,
    createdAt: daysAgo(3, 13),
  },
  {
    id: 'apt-006',
    studentId: 'stu-006',
    studentName: 'Hoàng Gia Bảo',
    studentCode: 'SE2021006',
    startTime: dayInCurrentWeek(2, 9),
    endTime: dayInCurrentWeek(2, 9, 30),
    reason: 'Tư vấn nghỉ học 1 kỳ để đi thực tập.',
    status: 'REJECTED',
    decisionNote:
      'Rất tiếc thầy không thể nhận lịch 9h sáng thứ 3 vì thầy đã có lịch họp khoa. Em vui lòng đặt lịch khác nhé.',
    createdAt: daysAgo(4, 10),
  },
  {
    id: 'apt-007',
    studentId: 'stu-007',
    studentName: 'Bùi Thị Mai',
    studentCode: 'SE2021007',
    startTime: dayInCurrentWeek(2, 13),
    endTime: dayInCurrentWeek(2, 13, 30),
    reason: 'Hỏi về môn quản trị kinh doanh trong nhóm tự chọn.',
    status: 'ACCEPTED',
    decisionNote: null,
    createdAt: daysAgo(4, 14),
  },
  {
    id: 'apt-008',
    studentId: 'stu-008',
    studentName: 'Đỗ Trung Kiên',
    studentCode: 'SE2021008',
    startTime: dayInCurrentWeek(3, 10),
    endTime: dayInCurrentWeek(3, 10, 30),
    reason: 'Hướng dẫn thủ tục đăng ký OJT.',
    status: 'ACCEPTED',
    decisionNote: null,
    createdAt: daysAgo(5, 9),
  },
  {
    id: 'apt-009',
    studentId: 'stu-009',
    studentName: 'Trương Thanh Hà',
    studentCode: 'SE2021009',
    startTime: dayInCurrentWeek(4, 15),
    endTime: dayInCurrentWeek(4, 15, 30),
    reason: 'Xin lịch tư vấn kế hoạch học tập kỳ 8.',
    status: 'REJECTED',
    decisionNote: 'Khung giờ này thầy đã dành cho buổi họp khoa. Em đặt lịch vào chiều thứ 5 được không?',
    createdAt: daysAgo(6, 11),
  },
  {
    id: 'apt-010',
    studentId: 'stu-010',
    studentName: 'Lý Quốc Dũng',
    studentCode: 'SE2021010',
    startTime: dayInCurrentWeek(4, 16),
    endTime: dayInCurrentWeek(4, 16, 30),
    reason: 'Hỏi cách học môn Cấu trúc dữ liệu.',
    status: 'PENDING',
    decisionNote: null,
    createdAt: daysAgo(1, 17),
  },
];

/** Slot rảnh tuần của advisor (mẫu cho AvailabilityEditor). */
export const mockAvailability: AvailabilitySlot[] = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
  { dayOfWeek: 2, startTime: '14:00', endTime: '17:00' },
  { dayOfWeek: 4, startTime: '09:00', endTime: '11:30' },
  { dayOfWeek: 5, startTime: '13:30', endTime: '17:00' },
];

// ---------------------------------------------------------------------------
// 4. Sinh viên được phân công
// ---------------------------------------------------------------------------

export const mockStudents: AdviseeStudent[] = [
  {
    id: 'stu-001',
    studentCode: 'SE2021001',
    fullName: 'Nguyễn Thị Hoa',
    email: 'hoa.nt2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 8.42,
    totalCreditsEarned: 96,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 1',
    isPrimary: true,
  },
  {
    id: 'stu-002',
    studentCode: 'SE2021002',
    fullName: 'Lê Văn Minh',
    email: 'minh.lv2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 7.85,
    totalCreditsEarned: 92,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 1',
    isPrimary: true,
  },
  {
    id: 'stu-003',
    studentCode: 'SE2021003',
    fullName: 'Phạm Thu Hà',
    email: 'ha.pt2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 6.94,
    totalCreditsEarned: 88,
    academicStatus: 'PROBATION',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 1',
    isPrimary: true,
  },
  {
    id: 'stu-004',
    studentCode: 'SE2021004',
    fullName: 'Võ Thành Long',
    email: 'long.vt2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 8,
    currentGpa: 5.61,
    totalCreditsEarned: 76,
    academicStatus: 'PROBATION',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 2',
    isPrimary: true,
  },
  {
    id: 'stu-005',
    studentCode: 'SE2021005',
    fullName: 'Đặng Kim Ngân',
    email: 'ngan.dk2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 8.1,
    totalCreditsEarned: 94,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 2',
    isPrimary: true,
  },
  {
    id: 'stu-006',
    studentCode: 'SE2021006',
    fullName: 'Hoàng Gia Bảo',
    email: 'bao.hg2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 7.25,
    totalCreditsEarned: 90,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 2',
    isPrimary: true,
  },
  {
    id: 'stu-007',
    studentCode: 'SE2021007',
    fullName: 'Bùi Thị Mai',
    email: 'mai.bt2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 8.88,
    totalCreditsEarned: 98,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 3',
    isPrimary: true,
  },
  {
    id: 'stu-008',
    studentCode: 'SE2021008',
    fullName: 'Đỗ Trung Kiên',
    email: 'kien.dt2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 8,
    currentGpa: 6.5,
    totalCreditsEarned: 84,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 3',
    isPrimary: true,
  },
  {
    id: 'stu-009',
    studentCode: 'SE2021009',
    fullName: 'Trương Thanh Hà',
    email: 'ha.tt2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 7.72,
    totalCreditsEarned: 91,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 3',
    isPrimary: true,
  },
  {
    id: 'stu-010',
    studentCode: 'SE2021010',
    fullName: 'Lý Quốc Dũng',
    email: 'dung.lq2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 8,
    currentGpa: 4.88,
    totalCreditsEarned: 68,
    academicStatus: 'SUSPENDED',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 4',
    isPrimary: true,
  },
  {
    id: 'stu-011',
    studentCode: 'SE2021011',
    fullName: 'Vũ Khánh Linh',
    email: 'linh.vk2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 8.33,
    totalCreditsEarned: 95,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 4',
    isPrimary: true,
  },
  {
    id: 'stu-012',
    studentCode: 'SE2021012',
    fullName: 'Đỗ Trâm Thanh',
    email: 'thanh.dt2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 7.05,
    totalCreditsEarned: 89,
    academicStatus: 'LEAVE_OF_ABSENCE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 4',
    isPrimary: true,
  },
  {
    id: 'stu-013',
    studentCode: 'SE2021013',
    fullName: 'Ngô Hoài An',
    email: 'an.nh2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 10,
    currentGpa: 9.12,
    totalCreditsEarned: 118,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 5',
    isPrimary: true,
  },
  {
    id: 'stu-014',
    studentCode: 'SE2021014',
    fullName: 'Phan Xuân Vinh',
    email: 'vinh.px2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 6.72,
    totalCreditsEarned: 87,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 5',
    isPrimary: true,
  },
  {
    id: 'stu-015',
    studentCode: 'SE2021015',
    fullName: 'Đinh Mỹ Duyên',
    email: 'duyen.dm2021@student.fpt.edu.vn',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    curriculumVersion: 'K19',
    currentSemester: 9,
    currentGpa: 8.56,
    totalCreditsEarned: 97,
    academicStatus: 'ACTIVE',
    enrollmentSemesterCode: 'K19-S1',
    assignedDate: '2024-09-01',
    groupName: 'Nhóm 5',
    isPrimary: true,
  },
];

/** Chi tiết học vụ của một sinh viên (profile + progress + transcript). */
export const mockStudentDetail = (studentId: string): AdvisorStudentDetail => {
  const student = mockStudents.find((item) => item.id === studentId) ?? mockStudents[0];

  const profile: AcademicStudentProfile = {
    id: student.id,
    fullName: student.fullName,
    email: student.email,
    phone: '09' + String(10000000 + Number(student.studentCode.slice(-3))).slice(0, 8),
    accountStatus: 'ACTIVE',
    studentCode: student.studentCode,
    majorCode: student.majorCode,
    majorName: student.majorName,
    curriculumVersionId: 'curr-k19-se',
    cohort: student.curriculumVersion,
    currentSemester: student.currentSemester,
    currentGpa: student.currentGpa,
    totalCreditsEarned: student.totalCreditsEarned,
    academicStatus: student.academicStatus,
    dateOfBirth: '2003-05-12',
  };

  const progress: Progress = {
    requiredCredits: 132,
    earnedCredits: student.totalCreditsEarned,
    curriculumCourses: 46,
    completedCourses: Math.min(46, Math.round((student.totalCreditsEarned / 132) * 46)),
    currentGpa: student.currentGpa,
    semesters: [
      {
        code: 'K19-S6',
        name: 'Semester 6',
        creditsEnrolled: 18,
        creditsEarned: 17,
        semesterGpa: 7.9,
        cumulativeGpa: 7.62,
        standing: 'Good',
      },
      {
        code: 'K19-S7',
        name: 'Semester 7',
        creditsEnrolled: 19,
        creditsEarned: 18,
        semesterGpa: 8.15,
        cumulativeGpa: 7.74,
        standing: 'Good',
      },
      {
        code: 'K19-S8',
        name: 'Semester 8',
        creditsEnrolled: 18,
        creditsEarned: 15,
        semesterGpa: 7.2,
        cumulativeGpa: 7.65,
        standing: 'Average',
      },
    ],
  };

  const transcript: TranscriptRow[] = [
    {
      id: `${student.id}-t1`,
      courseCode: 'SE101',
      courseName: 'Introduction to Programming',
      credits: 3,
      semesterCode: 'K19-S1',
      semesterName: 'Semester 1',
      finalScore: 8.5,
      status: 'COMPLETED',
      attemptNumber: 1,
      creditsEarned: 3,
    },
    {
      id: `${student.id}-t2`,
      courseCode: 'SE104',
      courseName: 'Data Structures and Algorithms',
      credits: 4,
      semesterCode: 'K19-S2',
      semesterName: 'Semester 2',
      finalScore: 7.8,
      status: 'COMPLETED',
      attemptNumber: 1,
      creditsEarned: 4,
    },
    {
      id: `${student.id}-t3`,
      courseCode: 'SE203',
      courseName: 'Database Systems',
      credits: 3,
      semesterCode: 'K19-S4',
      semesterName: 'Semester 4',
      finalScore: 8.9,
      status: 'COMPLETED',
      attemptNumber: 1,
      creditsEarned: 3,
    },
    {
      id: `${student.id}-t4`,
      courseCode: 'SE301',
      courseName: 'Software Engineering',
      credits: 3,
      semesterCode: 'K19-S6',
      semesterName: 'Semester 6',
      finalScore: 7.2,
      status: 'COMPLETED',
      attemptNumber: 1,
      creditsEarned: 3,
    },
    {
      id: `${student.id}-t5`,
      courseCode: 'OJT401',
      courseName: 'On-Job Training',
      credits: 4,
      semesterCode: 'K19-S8',
      semesterName: 'Semester 8',
      finalScore: null,
      status: 'IN_PROGRESS',
      attemptNumber: 1,
      creditsEarned: 0,
    },
  ];

  return { profile, progress, transcript };
};

// ---------------------------------------------------------------------------
// 5. Hồ sơ advisor + thông báo
// ---------------------------------------------------------------------------

export const mockAdvisorProfile: AdvisorProfile = {
  id: 'adv-001',
  fullName: 'Trần Minh Khoa',
  email: 'khoa.tm@fpt.edu.vn',
  maxAdvisees: 30,
  activeAdvisees: mockStudents.length,
  status: 'ACTIVE',
  assignmentStartDate: '2024-09-01',
};

export const mockNotifications: StudentNotification[] = [
  {
    id: 'ntf-001',
    recipientUserId: 'adv-001',
    notificationType: 'ADVISOR_REQUEST',
    title: 'New advising request',
    message: 'Nguyễn Thị Hoa submitted a course selection request.',
    actionUrl: '/advisor/advising-requests',
    relatedStudentId: 'stu-001',
    resolvedAt: null,
    isRead: false,
    readAt: null,
    createdAt: daysAgo(1, 8),
  },
  {
    id: 'ntf-002',
    recipientUserId: 'adv-001',
    notificationType: 'MESSAGE',
    title: 'New reply from Đặng Kim Ngân',
    message: '"Em có thể gửi thêm bản chụp mục tiên quết nếu thầy cần."',
    actionUrl: '/advisor/conversations',
    relatedStudentId: 'stu-005',
    resolvedAt: null,
    isRead: false,
    readAt: null,
    createdAt: daysAgo(1, 11),
  },
  {
    id: 'ntf-003',
    recipientUserId: 'adv-001',
    notificationType: 'REMINDER',
    title: 'Appointment request',
    message: 'Lý Quốc Dũng requested a slot on Thursday at 16:00.',
    actionUrl: '/advisor/appointments',
    relatedStudentId: 'stu-010',
    resolvedAt: null,
    isRead: true,
    readAt: daysAgo(0, 9),
    createdAt: daysAgo(1, 17),
  },
  {
    id: 'ntf-004',
    recipientUserId: 'adv-001',
    notificationType: 'PLAN_STATUS',
    title: 'Study plan submitted',
    message: 'Phan Xuân Vinh submitted a study plan for semester 10.',
    actionUrl: '/advisor/study-plans',
    relatedStudentId: 'stu-014',
    resolvedAt: null,
    isRead: true,
    readAt: daysAgo(0, 10),
    createdAt: daysAgo(0, 9),
  },
  {
    id: 'ntf-005',
    recipientUserId: 'adv-001',
    notificationType: 'INFO',
    title: 'Reminder: probation students',
    message: '2 students in your cohort are on academic probation.',
    actionUrl: '/advisor',
    relatedStudentId: null,
    resolvedAt: null,
    isRead: true,
    readAt: daysAgo(2, 9),
    createdAt: daysAgo(3, 9),
  },
];

// ---------------------------------------------------------------------------
// 6. Kế hoạch học tập (Study Plan Reviews)
// ---------------------------------------------------------------------------

export const mockStudyPlans: StudyPlanSummary[] = [
  {
    id: 'plan-002',
    studentId: 'stu-002',
    studentCode: 'SE2021002',
    studentName: 'Lê Văn Minh',
    semesterCode: 'K19-S9',
    version: 1,
    totalCredits: 18,
    status: 'SUBMITTED',
    submittedAt: daysAgo(1, 14),
  },
  {
    id: 'plan-005',
    studentId: 'stu-005',
    studentCode: 'SE2021005',
    studentName: 'Đặng Kim Ngân',
    semesterCode: 'K19-S9',
    version: 2,
    totalCredits: 17,
    status: 'SUBMITTED',
    submittedAt: daysAgo(4, 9),
  },
  {
    id: 'plan-009',
    studentId: 'stu-009',
    studentCode: 'SE2021009',
    studentName: 'Trương Thanh Hà',
    semesterCode: 'K19-S8',
    version: 2,
    totalCredits: 18,
    status: 'APPROVED',
    submittedAt: daysAgo(12, 14),
  },
  {
    id: 'plan-014',
    studentId: 'stu-014',
    studentCode: 'SE2021014',
    studentName: 'Phan Xuân Vinh',
    semesterCode: 'K19-S10',
    version: 1,
    totalCredits: 12,
    status: 'SUBMITTED',
    submittedAt: daysAgo(0, 9),
  },
  {
    id: 'plan-015',
    studentId: 'stu-015',
    studentCode: 'SE2021015',
    studentName: 'Đinh Mỹ Duyên',
    semesterCode: 'K19-S10',
    version: 1,
    totalCredits: 16,
    status: 'NEEDS_REVISION',
    submittedAt: daysAgo(6, 11),
  },
  {
    id: 'plan-016',
    studentId: 'stu-003',
    studentCode: 'SE2021003',
    studentName: 'Phạm Thu Hà',
    semesterCode: 'K19-S9',
    version: 1,
    totalCredits: 15,
    status: 'REJECTED',
    submittedAt: daysAgo(8, 10),
  },
];

/** Chi tiết một kế hoạch học tập (dùng cho modal review). */
export const mockStudyPlanDetail = (id: string): AdvisorStudyPlanDetail => {
  const summary = mockStudyPlans.find((plan) => plan.id === id) ?? mockStudyPlans[0];

  return {
    studentId: summary.studentId,
    studentCode: summary.studentCode,
    studentName: summary.studentName,
    plan: {
      header: {
        id: summary.id,
        semesterId: `sem-${summary.semesterCode}`,
        semesterCode: summary.semesterCode,
        version: summary.version,
        status: summary.status,
        planType: 'SEMESTER',
        totalCredits: summary.totalCredits,
        previousPlanId: null,
        submittedAt: summary.submittedAt,
        reviewedByUserId: 'adv-001',
        reviewedAt: null,
        reviewNotes: null,
        createdAt: summary.submittedAt ?? daysAgo(10, 9),
      },
      courses: [
        { id: `${summary.id}-c1`, code: 'SE401', name: 'Software Architecture', credits: 3 },
        { id: `${summary.id}-c2`, code: 'SE402', name: 'Distributed Systems', credits: 3 },
        { id: `${summary.id}-c3`, code: 'SE403', name: 'Machine Learning', credits: 3 },
        { id: `${summary.id}-c4`, code: 'SE405', name: 'Cloud Computing', credits: 3 },
        { id: `${summary.id}-c5`, code: 'OJT401', name: 'On-Job Training', credits: 4 },
      ],
      issues:
        summary.status === 'NEEDS_REVISION'
          ? ['Total credits (16) is below the required minimum of 18 for this semester.']
          : [],
    },
  };
};

/** Trả về trang kế hoạch học tập đã lọc theo status. */
export const mockStudyPlanPage = (status: string, page = 0, size = 20): StudyPlanPage => {
  const filtered =
    !status || status === 'ALL'
      ? mockStudyPlans
      : mockStudyPlans.filter((plan) => plan.status === status);
  const start = page * size;
  return {
    items: filtered.slice(start, start + size),
    page,
    size,
    totalElements: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / size)),
  };
};
