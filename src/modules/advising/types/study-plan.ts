import type { CurriculumPlan } from '../../academic/services/studentAcademicService';

export type StudyPlanDecision = 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
export type StudyPlanSummary = {
  id: string; studentId: string; studentCode: string; studentName: string;
  semesterCode: string; version: number; totalCredits: number;
  status: string; submittedAt: string | null;
};
export type StudyPlanPage = {
  items: StudyPlanSummary[]; page: number; size: number;
  totalElements: number; totalPages: number;
};
export type AdvisorStudyPlanDetail = {
  studentId: string; studentCode: string; studentName: string; plan: CurriculumPlan;
};
