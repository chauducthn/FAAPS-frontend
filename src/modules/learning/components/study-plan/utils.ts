// src/modules/learning/components/study-plan/utils.ts
// Small helpers shared by the study-plan board components.
import type { PlanItem } from '../../services/studentStudyPlanService';

/** Sum of the credits of the given courses. */
export function creditsOf(items: Pick<PlanItem, 'credits'>[]) {
  return items.reduce((sum, c) => sum + c.credits, 0);
}
