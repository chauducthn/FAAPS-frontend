import type { CurriculumChoice } from '../services/onboardingService';

export interface CurriculumMatch {
  /** The curriculums to offer: those of the major in the Student ID, or all of them when none match. */
  options: CurriculumChoice[];
  /** True when the Student ID prefix identified a major. */
  matched: boolean;
  /** The curriculum of the student's own cohort (SE19xxxx -> K19) when exactly one fits. */
  preferredId: string | null;
}

/** Student IDs look like SE190001: major code (SE), cohort (19), running number. */
export function matchCurriculums(studentCode: string, choices: CurriculumChoice[]): CurriculumMatch {
  const code = studentCode.trim().toUpperCase();
  const prefix = /^[A-Z]{2}/.exec(code)?.[0];
  const byMajor = prefix ? choices.filter((item) => item.majorCode.toUpperCase() === prefix) : [];
  if (byMajor.length === 0) return { options: choices, matched: false, preferredId: null };

  const cohort = /^[A-Z]{2}(\d{2})/.exec(code)?.[1];
  const sameCohort = cohort ? byMajor.filter((item) => item.version.toUpperCase() === `K${Number(cohort)}`) : [];
  return { options: byMajor, matched: true, preferredId: sameCohort.length === 1 ? sameCohort[0].id : null };
}
