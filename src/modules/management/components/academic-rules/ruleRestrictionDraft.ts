import { parseNum, type CondDraft, type Num } from './ruleConditionDraft';

export interface RestrDraft {
  blockRegistration: boolean;
  blockFinalExam: boolean;
  notifyAdvisor: boolean;
  requireMeeting: boolean;
  requireDeanApproval: boolean;
  keepHighestScore: boolean;
  allowExtraCredits: boolean;
  warnOnly: boolean;
  maxCreditsNextSemester: Num;
  maxExtraCredits: Num;
}

export const BLANK_RESTR: RestrDraft = {
  blockRegistration: false,
  blockFinalExam: false,
  notifyAdvisor: false,
  requireMeeting: false,
  requireDeanApproval: false,
  keepHighestScore: false,
  allowExtraCredits: false,
  warnOnly: false,
  maxCreditsNextSemester: '',
  maxExtraCredits: '',
};

export function restrFromObject(r: Record<string, unknown>): RestrDraft {
  return {
    blockRegistration: r.block_registration === true,
    blockFinalExam: r.block_final_exam === true,
    notifyAdvisor: r.notify_advisor === true,
    requireMeeting: r.require_meeting === true,
    requireDeanApproval: r.require_dean_approval === true,
    keepHighestScore: r.keep_highest_score === true,
    allowExtraCredits: r.allow_extra_credits === true,
    warnOnly: r.warn_only === true,
    maxCreditsNextSemester: r.max_credits_next_semester !== undefined ? parseNum(r.max_credits_next_semester) : '',
    maxExtraCredits: r.max_extra_credits !== undefined ? parseNum(r.max_extra_credits) : '',
  };
}

export function buildRestriction(d: RestrDraft): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (d.blockRegistration) out.block_registration = true;
  if (d.blockFinalExam) out.block_final_exam = true;
  if (d.notifyAdvisor) out.notify_advisor = true;
  if (d.requireMeeting) out.require_meeting = true;
  if (d.requireDeanApproval) out.require_dean_approval = true;
  if (d.keepHighestScore) out.keep_highest_score = true;
  if (d.allowExtraCredits) out.allow_extra_credits = true;
  if (d.warnOnly) out.warn_only = true;
  if (d.maxCreditsNextSemester !== '') out.max_credits_next_semester = d.maxCreditsNextSemester;
  if (d.maxExtraCredits !== '') out.max_extra_credits = d.maxExtraCredits;
  return out;
}

function rangeError(v: Num, min: number, max: number, label: string, required = true): string | null {
  if (v === '') return required ? `${label} is required` : null;
  if (!Number.isFinite(v)) return `${label} must be a number`;
  if (v < min || v > max) return `${label} must be between ${min} and ${max}`;
  return null;
}

export function validateRuleDraft(
  policyType: string,
  cond: CondDraft,
  restr: RestrDraft,
): Partial<Record<string, string>> {
  const e: Partial<Record<string, string>> = {};
  const put = (k: string, err: string | null) => {
    if (err) e[k] = err;
  };
  switch (policyType) {
    case 'GPA_WARNING':
      put('minGpa', rangeError(cond.minGpa, 0, 10, 'Grade'));
      break;
    case 'ACADEMIC_PROBATION':
      put('minGpa', rangeError(cond.minGpa, 0, 10, 'Grade'));
      put('consecutiveSemesters', rangeError(cond.consecutiveSemesters, 1, 10, 'Consecutive semesters'));
      break;
    case 'MAX_CREDITS_PER_SEMESTER':
      put('maxCredits', rangeError(cond.maxCredits, 1, 60, 'Grade'));
      break;
    case 'MIN_CREDITS_PER_SEMESTER':
      put('minCredits', rangeError(cond.minCredits, 1, 60, 'Grade'));
      break;
    case 'COURSE_REPEAT_LIMIT':
      put('maxRepeats', rangeError(cond.maxRepeats, 1, 10, 'Grade'));
      break;
    case 'RETAKE':
      put('maxScoreForRetake', rangeError(cond.maxScoreForRetake, 0, 10, 'Grade'));
      put('maxAttempts', rangeError(cond.maxAttempts, 1, 10, 'Max attempts'));
      break;
    case 'ADVANCED_STUDY':
      put('minGpa', rangeError(cond.minGpa, 0, 10, 'Grade'));
      put('minCreditsEarned', rangeError(cond.minCreditsEarned, 1, 500, 'Credits earned'));
      break;
    default:
      if (cond.otherKind === 'attendance') {
        put('minAttendance', rangeError(cond.minAttendance, 1, 100, 'Grade'));
      } else {
        put('minCredits', rangeError(cond.minCredits, 1, 500, 'Grade'));
        put('minGpaOpt', rangeError(cond.minGpa, 0, 10, 'GPA threshold', false));
      }
      break;
  }
  if (restr.maxCreditsNextSemester !== '') {
    put('maxCreditsNextSemester', rangeError(restr.maxCreditsNextSemester, 1, 60, 'Credits next semester', false));
  }
  if (restr.maxExtraCredits !== '') {
    put('maxExtraCredits', rangeError(restr.maxExtraCredits, 1, 30, 'Extra credits', false));
  }
  return e;
}
