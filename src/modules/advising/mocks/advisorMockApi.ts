// src/modules/advising/mocks/advisorMockApi.ts
// Lớp mock thực thi các thao tác của Advisor trên store in-memory.
//
// Mọi hàm ở đây MUTATE trực tiếp các mảng trong `advisorMockData.ts`:
//   - yêu cầu tư vấn: accept / reject / mark in-progress
//   - hội thoại: gửi reply công khai, gửi internal note, đổi trạng thái + resolution
//   - lịch hẹn: accept / reject / cancel / completed / no-show, cập nhật lịch rảnh
//   - kế hoạch học tập: approve / reject / needs revision
//
// Dùng chung store với `advisorService`, `advisorConversationService`,
// `advisorStudyPlanService` và `appointmentService` để UI invalidate là thấy ngay.

import type { AdvisingRequest, AdvisingRequestStatus } from '../types/advising';
import type {
  AcademicAdvisingDetail,
  AcademicAdvisingRequest,
  CurriculumPlan,
  Progress,
  TranscriptRow,
} from '../../academic/services/studentAcademicService';
import type {
  AdvisorAppointment,
  AvailabilitySlot,
  BookingStatus,
  UpdateAppointmentStatusDto,
} from '../../appointment/types/appointment';
import type { StudyPlanDecision, StudyPlanPage, StudyPlanSummary } from '../types/study-plan';
import type { AdvisorProfile, AdvisorStudentDetail } from '../services/advisorService';
import {
  MOCK_ADVISEE_STUDENTS,
  MOCK_ADVISING_MESSAGES,
  MOCK_ADVISING_REQUESTS,
  MOCK_ADVISOR_ID,
  MOCK_ADVISOR_NOTIFICATIONS,
  MOCK_ADVISOR_PROFILE,
  MOCK_APPOINTMENTS,
  MOCK_AVAILABILITY,
  MOCK_STUDY_PLANS,
  buildMockTranscript,
  type MockStudyPlan,
} from './advisorMockData';

const nowIso = (): string => new Date().toISOString();

/* ------------------------------------------------------------------ */
/* Yêu cầu tư vấn                                                      */
/* ------------------------------------------------------------------ */

export const mockGetAdvisingRequests = (): AdvisingRequest[] =>
  MOCK_ADVISING_REQUESTS.map((r) => ({ ...r }));

export const mockGetAdvisingRequest = (id: string): AdvisingRequest => {
  const found = MOCK_ADVISING_REQUESTS.find((r) => r.id === id);
  if (!found) throw new Error('Request not found');
  return found;
};

/** Chuyển trạng thái yêu cầu: RESOLVED = accept, CANCELLED = reject, IN_PROGRESS = đang xử lý. */
export const mockUpdateRequestStatus = (
  id: string,
  body: { status: 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED'; resolutionSummary?: string },
): AdvisingRequest => {
  const request = mockGetAdvisingRequest(id);
  const status: AdvisingRequestStatus = body.status;

  if (status === 'CANCELLED' && !body.resolutionSummary?.trim()) {
    throw new Error('A rejection reason is required.');
  }

  request.status = status;
  request.resolutionSummary = body.resolutionSummary?.trim() || request.resolutionSummary || null;
  request.resolvedAt = status === 'RESOLVED' || status === 'CANCELLED' ? nowIso() : null;
  request.updatedAt = nowIso();
  return request;
};

/* ------------------------------------------------------------------ */
/* Hội thoại tư vấn                                                     */
/* ------------------------------------------------------------------ */

/** Chuyển request sang shape của `AcademicAdvisingRequest` (contract hội thoại). */
export const toConversationRequest = (r: AdvisingRequest): AcademicAdvisingRequest => ({
  id: r.id,
  studentId: r.studentId,
  studentName: r.studentName,
  advisorId: r.advisorId,
  advisorName: r.advisorName,
  title: r.title,
  description: r.description ?? '',
  requestType: r.requestType,
  status: r.status,
  resolutionSummary: r.resolutionSummary,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

export const mockGetConversationRequests = (): AcademicAdvisingRequest[] =>
  MOCK_ADVISING_REQUESTS.map(toConversationRequest);

export const mockGetConversationDetail = (id: string): AcademicAdvisingDetail => {
  const request = mockGetAdvisingRequest(id);
  const messages = MOCK_ADVISING_MESSAGES[id] ?? [];
  return {
    request: toConversationRequest(request),
    messages: messages.map((m) => ({ ...m })),
  };
};

/** Gửi reply công khai hoặc internal note — ghi thẳng vào store. */
export const mockReplyToConversation = (
  id: string,
  content: string,
  internal = false,
): AcademicAdvisingDetail => {
  const request = mockGetAdvisingRequest(id);
  const text = content.trim();
  if (!text) throw new Error('Message cannot be empty.');

  const bucket = MOCK_ADVISING_MESSAGES[id] ?? (MOCK_ADVISING_MESSAGES[id] = []);
  bucket.push({
    id: `${id}-msg-${bucket.length + 1}`,
    senderId: MOCK_ADVISOR_ID,
    senderName: MOCK_ADVISOR_PROFILE.fullName,
    content: text,
    internal,
    createdAt: nowIso(),
  });

  request.updatedAt = nowIso();
  // Gửi tin nhắn lần đầu thì request chuyển sang "đang xử lý" nếu đang pending.
  if (!internal && request.status === 'PENDING') {
    request.status = 'IN_PROGRESS';
    request.updatedAt = nowIso();
  }

  return mockGetConversationDetail(id);
};

/** Đổi trạng thái hội thoại (IN_PROGRESS / RESOLVED) kèm resolution summary. */
export const mockSetConversationStatus = (
  id: string,
  status: 'IN_PROGRESS' | 'RESOLVED',
  resolutionSummary?: string,
): AcademicAdvisingDetail => {
  const request = mockGetAdvisingRequest(id);
  if (status === 'RESOLVED' && !resolutionSummary?.trim()) {
    throw new Error('A resolution summary is required.');
  }

  request.status = status;
  if (resolutionSummary?.trim()) request.resolutionSummary = resolutionSummary.trim();
  request.resolvedAt = status === 'RESOLVED' ? nowIso() : null;
  request.updatedAt = nowIso();
  return mockGetConversationDetail(id);
};

/* ------------------------------------------------------------------ */
/* Sinh viên + hồ sơ advisor                                           */
/* ------------------------------------------------------------------ */

export const mockGetAdviseeStudents = (params: {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
}): { items: typeof MOCK_ADVISEE_STUDENTS; page: number; size: number; totalElements: number; totalPages: number } => {
  const keyword = params.search?.trim().toLowerCase();
  const filtered = MOCK_ADVISEE_STUDENTS.filter((s) => {
    if (params.status && params.status !== 'ALL' && s.academicStatus !== params.status) return false;
    if (!keyword) return true;
    return (
      s.fullName.toLowerCase().includes(keyword) ||
      s.studentCode.toLowerCase().includes(keyword) ||
      s.email.toLowerCase().includes(keyword)
    );
  });

  const size = params.size && params.size > 0 ? params.size : 20;
  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size);
  const page = params.page ?? 0;
  const safePage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);

  return {
    items: filtered.slice(safePage * size, safePage * size + size),
    page: safePage,
    size,
    totalElements,
    totalPages,
  };
};

export const mockGetStudentDetail = (studentId: string): AdvisorStudentDetail => {
  const student = MOCK_ADVISEE_STUDENTS.find((s) => s.id === studentId);
  if (!student) throw new Error('Student not found');

  const transcript: TranscriptRow[] = buildMockTranscript(studentId);
  const earnedCredits = transcript.reduce((sum, row) => sum + row.creditsEarned, 0);
  const requiredCredits = 132;
  const scored = transcript.filter((row) => row.finalScore != null);
  const currentGpa = scored.length
    ? scored.reduce((sum, row) => sum + (row.finalScore ?? 0), 0) / scored.length
    : student.currentGpa;

  const semesters: Progress['semesters'] = [
    {
      code: 'FA2022', name: 'Fall 2022', creditsEnrolled: 15, creditsEarned: 15,
      semesterGpa: 7.9, cumulativeGpa: 7.9, standing: 'Good',
    },
    {
      code: 'SP2023', name: 'Spring 2023', creditsEnrolled: 18, creditsEarned: 15,
      semesterGpa: 7.1, cumulativeGpa: 7.5, standing: 'Good',
    },
    {
      code: 'FA2023', name: 'Fall 2023', creditsEnrolled: 16, creditsEarned: 16,
      semesterGpa: 8.0, cumulativeGpa: 7.7, standing: 'Good',
    },
  ];

  const progress: Progress = {
    requiredCredits,
    earnedCredits,
    curriculumCourses: 42,
    completedCourses: transcript.filter((row) => row.creditsEarned > 0).length,
    currentGpa,
    semesters,
  };

  return {
    profile: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      accountStatus: 'ACTIVE',
      studentCode: student.studentCode,
      majorCode: student.majorCode,
      majorName: student.majorName,
      curriculumVersionId: null,
      cohort: student.curriculumVersion,
      currentSemester: student.currentSemester,
      currentGpa: student.currentGpa,
      totalCreditsEarned: student.totalCreditsEarned,
      academicStatus: student.academicStatus,
      dateOfBirth: student.dateOfBirth,
    },
    progress,
    transcript,
  };
};

export const mockGetAdvisorProfile = (): AdvisorProfile => ({ ...MOCK_ADVISOR_PROFILE });

export const mockUpdateAdvisorProfile = (fullName: string): AdvisorProfile => {
  const name = fullName.trim();
  if (!name) throw new Error('Full name is required.');
  MOCK_ADVISOR_PROFILE.fullName = name;
  return mockGetAdvisorProfile();
};

/* ------------------------------------------------------------------ */
/* Thông báo                                                            */
/* ------------------------------------------------------------------ */

export const mockGetAdvisorNotifications = () => ({
  items: MOCK_ADVISOR_NOTIFICATIONS.map((n) => ({ ...n })),
  page: 0,
  size: 8,
  totalElements: MOCK_ADVISOR_NOTIFICATIONS.length,
  totalPages: 1,
});

export const mockGetUnreadNotificationCount = (): number =>
  MOCK_ADVISOR_NOTIFICATIONS.filter((n) => !n.isRead).length;

export const mockMarkNotificationRead = (id: string): { updated: boolean } => {
  const found = MOCK_ADVISOR_NOTIFICATIONS.find((n) => n.id === id);
  if (!found) return { updated: false };
  found.isRead = true;
  found.readAt = nowIso();
  return { updated: true };
};

export const mockMarkAllNotificationsRead = (): { updated: number } => {
  const unread = MOCK_ADVISOR_NOTIFICATIONS.filter((n) => !n.isRead);
  for (const n of unread) {
    n.isRead = true;
    n.readAt = nowIso();
  }
  return { updated: unread.length };
};

/* ------------------------------------------------------------------ */
/* Lịch hẹn                                                            */
/* ------------------------------------------------------------------ */

export const mockGetAppointments = (params?: { from?: string; to?: string }): AdvisorAppointment[] => {
  const list = MOCK_APPOINTMENTS.map((a) => ({ ...a }));
  if (!params?.from || !params?.to) return list;
  const from = new Date(`${params.from}T00:00:00`).getTime();
  const to = new Date(`${params.to}T23:59:59`).getTime();
  return list.filter((a) => {
    const t = new Date(a.startTime).getTime();
    return t >= from && t <= to;
  });
};

export const mockGetAppointment = (id: string): AdvisorAppointment => {
  const found = MOCK_APPOINTMENTS.find((a) => a.id === id);
  if (!found) throw new Error('Appointment not found');
  return found;
};

/** Chuyển trạng thái lịch hẹn + ghi chú quyết định / tóm tắt buổi tư vấn. */
export const mockUpdateAppointmentStatus = (
  id: string,
  body: UpdateAppointmentStatusDto,
): AdvisorAppointment => {
  const appointment = mockGetAppointment(id);
  const status: BookingStatus = body.status;

  if ((status === 'REJECTED' || status === 'CANCELLED') && !body.reason?.trim()) {
    throw new Error('A reason is required to reject or cancel an appointment.');
  }
  if (status === 'COMPLETED' && !body.consultationSummary?.trim()) {
    throw new Error('A consultation summary is required to complete an appointment.');
  }

  appointment.status = status;
  if (body.reason?.trim()) appointment.decisionNote = body.reason.trim();
  if (body.consultationSummary?.trim()) appointment.consultationSummary = body.consultationSummary.trim();
  return appointment;
};

/** Lịch rảnh tuần — có thể thêm/sửa/xóa slot. */
export const mockGetAvailability = (): AvailabilitySlot[] =>
  MOCK_AVAILABILITY.map((s) => ({ ...s }));

export const mockConfigureAvailability = (slots: AvailabilitySlot[]): void => {
  const normalized = slots
    .map((slot) => ({ ...slot }))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

  for (const slot of normalized) {
    if (slot.startTime >= slot.endTime) {
      throw new Error('A slot must end after it starts.');
    }
  }

  MOCK_AVAILABILITY.splice(0, MOCK_AVAILABILITY.length, ...normalized);
};

/* ------------------------------------------------------------------ */
/* Kế hoạch học tập                                                     */
/* ------------------------------------------------------------------ */

const toPlanSummary = (plan: MockStudyPlan): StudyPlanSummary => {
  const student = MOCK_ADVISEE_STUDENTS.find((s) => s.id === plan.studentId);
  return {
    id: plan.id,
    studentId: plan.studentId,
    studentCode: student?.studentCode ?? '—',
    studentName: student?.fullName ?? 'Sinh viên',
    semesterCode: plan.semesterCode,
    version: plan.version,
    totalCredits: plan.totalCredits,
    status: plan.status,
    submittedAt: plan.submittedAt,
  };
};

export const mockListStudyPlans = (
  status: string,
  page = 0,
  size = 20,
): StudyPlanPage => {
  const filtered =
    status && status !== 'ALL'
      ? MOCK_STUDY_PLANS.filter((p) => p.status === status)
      : MOCK_STUDY_PLANS;

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size);
  const safePage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);

  return {
    items: filtered.slice(safePage * size, safePage * size + size).map(toPlanSummary),
    page: safePage,
    size,
    totalElements,
    totalPages,
  };
};

export const mockGetStudyPlanDetail = (id: string) => {
  const plan = MOCK_STUDY_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error('Study plan not found');
  const student = MOCK_ADVISEE_STUDENTS.find((s) => s.id === plan.studentId);

  const curriculumPlan: CurriculumPlan = {
    header: {
      id: plan.id,
      semesterId: `sem-${plan.semesterCode.toLowerCase()}`,
      semesterCode: plan.semesterCode,
      version: plan.version,
      status: plan.status,
      planType: 'SEMESTER',
      totalCredits: plan.totalCredits,
      previousPlanId: plan.previousPlanId,
      submittedAt: plan.submittedAt,
      reviewedByUserId: plan.reviewedAt ? MOCK_ADVISOR_ID : null,
      reviewedAt: plan.reviewedAt,
      reviewNotes: plan.reviewNotes,
      createdAt: plan.submittedAt,
    },
    courses: plan.courses.map((course, index) => ({
      id: `${plan.id}-course-${index + 1}`,
      code: course.code,
      name: course.name,
      credits: course.credits,
    })),
    issues: [...plan.issues],
  };

  return {
    studentId: plan.studentId,
    studentCode: student?.studentCode ?? '—',
    studentName: student?.fullName ?? 'Sinh viên',
    plan: curriculumPlan,
  };
};

/** Quyết định duyệt kế hoạch: APPROVED / REJECTED / NEEDS_REVISION. */
export const mockDecideStudyPlan = (
  id: string,
  decision: StudyPlanDecision,
  comment: string,
) => {
  const plan = MOCK_STUDY_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error('Study plan not found');
  if (decision !== 'APPROVED' && !comment.trim()) {
    throw new Error('A comment is required for rejection or revision requests.');
  }

  plan.status = decision;
  plan.reviewedAt = nowIso();
  plan.reviewNotes = comment.trim() || null;
  return mockGetStudyPlanDetail(id);
};
