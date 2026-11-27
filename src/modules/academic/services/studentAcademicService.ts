import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { PaginatedData } from '../../../shared/types/api';
import type {
  AcademicAdvisingDetail, AcademicAdvisingRequest, AcademicStudentProfile, AssignmentStatus,
  BlockPlacement, Course, CourseDetail, CoursePlan, Curriculum, CurriculumCourse, CurriculumPlan,
  FlmPreferencesView, ImportHistory, ImportPreview, LearningTask, Progress, Semester,
  StudyJourneyGoal, TranscriptRow,
} from './studentAcademicTypes';

export type {
  AcademicAdvisingDetail, AcademicAdvisingRequest, AcademicStudentProfile, AssignmentStatus,
  BlockPlacement, Course, CourseDetail, CoursePlan, Curriculum, CurriculumCourse, CurriculumPlan,
  FlmPreferencesView, ImportHistory, ImportPreview, ImportRow, LearningTask, Progress, Semester,
  StudyJourneyGoal, TranscriptRow,
} from './studentAcademicTypes';

const get = async <T>(path: string, params?: object): Promise<T> =>
  (await apiClient.get<T>(`/student${path}`, { params })).data;
const post = async <T>(path: string, body?: object): Promise<T> =>
  (await apiClient.post<T>(`/student${path}`, body ?? null, { headers: await getCsrfHeaders() })).data;

/** API backed by the current academic-learning backend endpoints. */
export const studentAcademicService = {
  profile: () => get<AcademicStudentProfile>('/profile'),
  /** Saves the major / curriculum the student follows (chosen in the Profile page). */
  changeCurriculum: async (curriculumVersionId: string) =>
    (
      await apiClient.put<AcademicStudentProfile>(
        '/student/profile/curriculum',
        { curriculumVersionId },
        { headers: await getCsrfHeaders() },
      )
    ).data,
  getFlmPreferences: () => get<FlmPreferencesView>('/profile/flm-preferences'),
  saveFlmPreferences: async (body: {
    comboCode?: string | null;
    englishPrep?: string | null;
    musicalInstrument?: string | null;
    physicalEducation?: string | null;
  }) =>
    (
      await apiClient.put<FlmPreferencesView>('/student/profile/flm-preferences', body, {
        headers: await getCsrfHeaders(),
      })
    ).data,
  transcript: () => get<TranscriptRow[]>('/transcript'),
  progress: () => get<Progress>('/progress'),
  /**
   * Paginated course list (GET /student/courses/paged).
   * The backend returns a raw Page shape (items/page/size/totalElements/totalPages),
   * normalized to PaginatedData (pageSize/totalItems) for consistent UI usage.
   */
  courses: async (search = '', page = 0, size = 20): Promise<PaginatedData<Course>> => {
    const data = await get<{
      items: Course[]; page: number; size: number; totalElements: number; totalPages: number;
    }>('/courses/paged', { search: search || undefined, page, size });
    return {
      items: data.items,
      page: data.page,
      pageSize: data.size,
      totalItems: data.totalElements,
      totalPages: data.totalPages,
    };
  },
  course: (id: string) => get<CourseDetail>(`/courses/${id}`),
  curriculum: () => get<Curriculum>('/curriculum'),
  curriculumCourses: () => get<CurriculumCourse[]>('/curriculum/courses'),
  blockPlacements: () => get<BlockPlacement[]>('/curriculum/block-plan'),
  curriculumPrerequisites: () => get<Record<string, string[]>>('/curriculum/block-plan/prerequisites'),
  curriculumEquivalents: () => get<Record<string, string[]>>('/curriculum/block-plan/equivalents'),
  saveBlockPlacement: async (body: {
    courseCode: string;
    semesterNumber: number;
    blockCode: string;
    planMode?: BlockPlacement['planMode'];
    note?: string | null;
  }) =>
    (await apiClient.put<BlockPlacement[]>('/student/curriculum/block-plan', body, { headers: await getCsrfHeaders() })).data,
  batchBlockPlacements: async (body: {
    upserts?: {
      courseCode: string;
      semesterNumber: number;
      blockCode: string;
      planMode?: BlockPlacement['planMode'];
      note?: string | null;
    }[];
    removeCodes?: string[];
  }) =>
    (await apiClient.put<BlockPlacement[]>('/student/curriculum/block-plan/batch', body, { headers: await getCsrfHeaders() })).data,
  removeBlockPlacement: async (courseCode: string) =>
    (await apiClient.delete<BlockPlacement[]>(`/student/curriculum/block-plan/${encodeURIComponent(courseCode)}`, {
      headers: await getCsrfHeaders(),
    })).data,
  resetBlockPlacements: async () =>
    (await apiClient.delete<BlockPlacement[]>('/student/curriculum/block-plan', { headers: await getCsrfHeaders() })).data,
  studyJourneyGoal: () => get<StudyJourneyGoal>('/study-journey'),
  saveStudyJourneyGoal: async (body: StudyJourneyGoal) =>
    (await apiClient.put<StudyJourneyGoal>('/student/study-journey', body, { headers: await getCsrfHeaders() })).data,
  importPreview: async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return (await apiClient.post<ImportPreview>('/student/transcript/imports/preview', body,
      { headers: { ...(await getCsrfHeaders()), 'Content-Type': 'multipart/form-data' } })).data;
  },
  importOcrPreview: async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return (await apiClient.post<ImportPreview>('/student/transcript/imports/ocr-preview', body,
      { headers: { ...(await getCsrfHeaders()), 'Content-Type': 'multipart/form-data' } })).data;
  },
  confirmImport: (id: string, skipErrors = false) =>
    post<{ importId: string; importedCount: number; status: string }>(
      `/transcript/imports/${id}/confirm${skipErrors ? '?skipErrors=true' : ''}`,
    ),
  activateImport: (id: string) =>
    post<{ importId: string; importedCount: number; status: string }>(`/transcript/imports/${id}/activate`),
  deleteImport: async (id: string) => {
    await apiClient.delete(`/student/transcript/imports/${encodeURIComponent(id)}`, {
      headers: await getCsrfHeaders(),
    });
  },
  importHistory: () => get<ImportHistory[]>('/transcript/imports'),
  importDetail: (id: string) => get<ImportPreview>(`/transcript/imports/${id}`),
  downloadImportTemplate: async (): Promise<Blob> =>
    (await apiClient.get('/student/transcript/imports/template.xlsx', { responseType: 'blob' })).data as Blob,
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
  saveCoursePlan: (body: { courseId: string; learningGoal: string; tasks: LearningTask[] }) =>
    post<CoursePlan>('/course-learning-plans', body),
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
