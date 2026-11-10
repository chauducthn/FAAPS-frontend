// src/modules/learning/components/study-plan/types.ts
// Shared view-model types for the student's study-plan board.
import type { PlanItem } from '../../services/studentStudyPlanService';

/** A plan item enriched with the prerequisite-validation flag. */
export type ViewItem = PlanItem & { invalid: boolean };

/** One board column: the Course Pool (semester 0) or a semester 1..9. */
export interface StudyPlanColumn {
  number: number;
  courses: ViewItem[];
}
