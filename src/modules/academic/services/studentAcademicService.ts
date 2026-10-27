import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';

export type AcademicStudentProfile = {
  id: string; fullName: string; email: string; phone: string | null; accountStatus: string;
  studentCode: string | null; majorCode: string | null; majorName: string | null;
  curriculumVersionId: string | null; cohort: string | null; currentSemester: number | null;
  currentGpa: number | null; totalCreditsEarned: number | null; academicStatus: string | null;
};
export type TranscriptRow = { id: string; courseCode: string; courseName: string; credits: number;
  semesterCode: string; semesterName: string; finalScore: number | null; status: string;
  attemptNumber: number; creditsEarned: number };
export type Progress = { requiredCredits: number; earnedCredits: number; curriculumCourses: number;
  completedCourses: number; currentGpa: number | null;
  semesters: { code: string; name: string; creditsEnrolled: number; creditsEarned: number;
    semesterGpa: number; cumulativeGpa: number; standing: string }[] };
export type Course = { id: string; code: string; name: string; credits: number; category: string;
  description: string | null; objectives: string | null; learningOutcomes: string | null };
export type CourseDetail = { course: Course; prerequisites: { id: string; courseCode: string;
  courseName: string; groupNo: number; type: string; minimumScore: number | null }[] };
export type Curriculum = { id: string; version: string; name: string; description: string | null;
  majorCode: string; majorName: string };
export type CurriculumCourse = { courseId: string; code: string; name: string; credits: number;
  semesterNumber: number; mandatory: boolean; groupName: string | null };
export type ImportRow = { rowNumber: number; courseCode: string; semesterCode: string;
  finalScore: number | null; status: string; attemptNumber: number; error: string | null };
export type ImportPreview = { importId: string; rowCount: number; errorCount: number; rows: ImportRow[] };
export type ImportHistory = { id: string; fileName: string; status: string; rowCount: number;
  errorCount: number; createdAt: string; confirmedAt: string | null };
export type Semester = { id: string; code: string; name: string; startDate: string; endDate: string };
export type CurriculumPlan = { header: { id: string; semesterId: string; semesterCode: string;
  version: number; status: string; planType: string; totalCredits: number; previousPlanId: string | null;
  submittedAt: string | null; reviewedByUserId: string | null; reviewedAt: string | null;
  reviewNotes: string | null; createdAt: string }; courses: { id: string; code: string; name: string; credits: number }[]; issues: string[] };
export type LearningTask = { title: string; description: string | null; dueDate: string | null;
  resourceUrl: string | null };
export type CoursePlan = { header: { id: string; courseId: string; courseCode: string;
  courseName: string; learningGoal: string | null; version: number; createdAt: string };
  tasks: (LearningTask & { id: string; sortOrder: number; completed: boolean; completedAt: string | null })[] };
export type AssignmentStatus = { advisorId: string | null; pendingRequestId: string | null;
  canRequestAdvisor: boolean; canRequestAdvising: boolean };
export type AcademicAdvisingRequest = { id: string; studentId: string; studentName: string;
  advisorId: string | null; advisorName: string | null; title: string; description: string;
  requestType: string; status: string; resolutionSummary: string | null; createdAt: string; updatedAt: string };
export type AcademicAdvisingDetail = { request: AcademicAdvisingRequest; messages: { id: string; senderId: string;
  senderName: string; content: string; internal: boolean; createdAt: string }[] };

const get = async <T>(path: string, params?: object): Promise<T> =>
  (await apiClient.get<T>(`/student${path}`, { params })).data;
const post = async <T>(path: string, body?: object): Promise<T> =>
  (await apiClient.post<T>(`/student${path}`, body ?? null, { headers: await getCsrfHeaders() })).data;

/** API backed by the current academic-learning backend endpoints. */
export const studentAcademicService = {
  profile: () => get<AcademicStudentProfile>('/profile'),
  updateProfile: async (body: { fullName: string; phone: string }) =>
    (await apiClient.put<AcademicStudentProfile>('/student/profile', body, { headers: await getCsrfHeaders() })).data,
  transcript: () => get<TranscriptRow[]>('/transcript'),
  progress: () => get<Progress>('/progress'),
  courses: (search = '', page = 0) => get<Course[]>('/courses', { search, page, size: 20 }),
  course: (id: string) => get<CourseDetail>(`/courses/${id}`),
  curriculum: () => get<Curriculum>('/curriculum'),
  curriculumCourses: () => get<CurriculumCourse[]>('/curriculum/courses'),
  importPreview: async (file: File) => {
    const body = new FormData(); body.append('file', file);
    return (await apiClient.post<ImportPreview>('/student/transcript/imports/preview', body,
      { headers: { ...(await getCsrfHeaders()), 'Content-Type': 'multipart/form-data' } })).data;
  },
  confirmImport: (id: string) => post<{ importId: string; importedCount: number; status: string }>(`/transcript/imports/${id}/confirm`),
  importHistory: () => get<ImportHistory[]>('/transcript/imports'),
  importDetail: (id: string) => get<ImportPreview>(`/transcript/imports/${id}`),
  downloadImportErrors: async (id: string): Promise<Blob> =>
    (await apiClient.get(`/student/transcript/imports/${id}/errors.xlsx`, { responseType: 'blob' })).data as Blob,
  semesters: () => get<Semester[]>('/semesters'),
  studyPlans: () => get<CurriculumPlan[]>('/study-plans'),
  studyPlan: (id: string) => get<CurriculumPlan>(`/study-plans/${id}`),
  studyPlanVersions: (id: string) => get<CurriculumPlan[]>(`/study-plans/${id}/versions`),
  validateStudyPlan: (id: string) => get<string[]>(`/study-plans/${id}/validate`),
  saveStudyPlan: (body: { semesterId: string; planType: string; courseIds: string[] }) => post<CurriculumPlan>('/study-plans', body),
  submitStudyPlan: (id: string) => post<CurriculumPlan>(`/study-plans/${id}/submit`),
  coursePlans: () => get<CoursePlan[]>('/course-learning-plans'),
  coursePlan: (id: string) => get<CoursePlan>(`/course-learning-plans/${id}`),
  coursePlanVersions: (id: string) => get<CoursePlan[]>(`/course-learning-plans/${id}/versions`),
  saveCoursePlan: (body: { courseId: string; learningGoal: string; tasks: LearningTask[] }) => post<CoursePlan>('/course-learning-plans', body),
  updateTask: async (planId: string, taskId: string, completed: boolean) =>
    (await apiClient.patch<CoursePlan>(`/student/course-learning-plans/${planId}/tasks/${taskId}`,
      { completed }, { headers: await getCsrfHeaders() })).data,
  assignment: () => get<AssignmentStatus>('/advisor-assignment'),
  requestAdvisor: () => post<{ id: string; status: string }>('/advisor-assignment-requests'),
  advisingRequests: () => get<AcademicAdvisingRequest[]>('/advising-requests'),
  advisingDetail: (id: string) => get<AcademicAdvisingDetail>(`/advising-requests/${id}`),
  createAdvising: (body: { title: string; description: string }) => post<{ id: string; status: string }>('/advising-requests', body),
  reply: (id: string, content: string) => post<AcademicAdvisingDetail>(`/advising-requests/${id}/messages`, { content }),
  cancel: async (id: string) =>
    (await apiClient.patch<AcademicAdvisingDetail>(`/student/advising-requests/${id}/cancel`, null,
      { headers: await getCsrfHeaders() })).data,
};
