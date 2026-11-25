export type Num = number | '';

export interface CondDraft {
  scope: string;
  operator: string;
  minGpa: Num;
  maxCredits: Num;
  minCredits: Num;
  minAttendance: Num;
  consecutiveSemesters: Num;
  maxAttempts: Num;
  maxScoreForRetake: Num;
  maxRepeats: Num;
  minCreditsEarned: Num;
  courseCode: string;
  fullTimeOnly: boolean;
  otherKind: 'attendance' | 'milestone';
}

const BLANK_COND: CondDraft = {
  scope: 'semester_gpa',
  operator: '<',
  minGpa: '',
  maxCredits: '',
  minCredits: '',
  minAttendance: '',
  consecutiveSemesters: '',
  maxAttempts: '',
  maxScoreForRetake: '',
  maxRepeats: '',
  minCreditsEarned: '',
  courseCode: '',
  fullTimeOnly: false,
  otherKind: 'attendance',
};

export function parseNum(value: unknown): Num {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return '';
}

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

export function templateFor(policy: string): CondDraft {
  switch (policy) {
    case 'GPA_WARNING':
      return { ...BLANK_COND, scope: 'semester_gpa', operator: '<', minGpa: 5.0 };
    case 'ACADEMIC_PROBATION':
      return { ...BLANK_COND, operator: '<', minGpa: 4.5, consecutiveSemesters: 2 };
    case 'MAX_CREDITS_PER_SEMESTER':
      return { ...BLANK_COND, scope: 'semester_registration', maxCredits: 24 };
    case 'MIN_CREDITS_PER_SEMESTER':
      return { ...BLANK_COND, scope: 'semester_registration', minCredits: 12, fullTimeOnly: true };
    case 'COURSE_REPEAT_LIMIT':
      return { ...BLANK_COND, scope: 'single_course', maxRepeats: 2 };
    case 'RETAKE':
      return { ...BLANK_COND, operator: '<=', maxScoreForRetake: 5.0, maxAttempts: 3 };
    case 'ADVANCED_STUDY':
      return { ...BLANK_COND, scope: 'fast_track', minGpa: 8.0, minCreditsEarned: 60 };
    default:
      return { ...BLANK_COND, scope: 'course_attendance', operator: '<', minAttendance: 80, otherKind: 'attendance' };
  }
}

export function draftFromCondition(policy: string, cond: Record<string, unknown>): CondDraft {
  const base = templateFor(policy);
  return {
    ...base,
    scope: str(cond.scope) || base.scope,
    operator: str(cond.operator) || base.operator,
    minGpa: cond.min_gpa !== undefined ? parseNum(cond.min_gpa) : base.minGpa,
    maxCredits: cond.max_credits !== undefined ? parseNum(cond.max_credits) : base.maxCredits,
    minCredits: cond.min_credits !== undefined ? parseNum(cond.min_credits) : base.minCredits,
    minAttendance: cond.min_attendance_percent !== undefined ? parseNum(cond.min_attendance_percent) : base.minAttendance,
    consecutiveSemesters: cond.consecutive_semesters !== undefined ? parseNum(cond.consecutive_semesters) : base.consecutiveSemesters,
    maxAttempts: cond.max_attempts !== undefined ? parseNum(cond.max_attempts) : base.maxAttempts,
    maxScoreForRetake: cond.max_score_for_retake !== undefined ? parseNum(cond.max_score_for_retake) : base.maxScoreForRetake,
    maxRepeats: cond.max_repeats !== undefined ? parseNum(cond.max_repeats) : base.maxRepeats,
    minCreditsEarned: cond.min_credits_earned !== undefined ? parseNum(cond.min_credits_earned) : base.minCreditsEarned,
    courseCode: str(cond.course_code) || base.courseCode,
    fullTimeOnly: cond.full_time_only === true,
    otherKind: cond.min_attendance_percent !== undefined ? 'attendance' : 'milestone',
  };
}

export function buildCondition(policy: string, d: CondDraft): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const set = (key: string, v: Num | string) => {
    if (v !== '' && v !== undefined) out[key] = v;
  };
  switch (policy) {
    case 'GPA_WARNING':
      set('min_gpa', d.minGpa);
      out.operator = d.operator;
      out.scope = d.scope;
      break;
    case 'ACADEMIC_PROBATION':
      set('min_gpa', d.minGpa);
      set('consecutive_semesters', d.consecutiveSemesters);
      out.operator = d.operator;
      break;
    case 'MAX_CREDITS_PER_SEMESTER':
      set('max_credits', d.maxCredits);
      out.scope = 'semester_registration';
      break;
    case 'MIN_CREDITS_PER_SEMESTER':
      set('min_credits', d.minCredits);
      out.scope = 'semester_registration';
      if (d.fullTimeOnly) out.full_time_only = true;
      break;
    case 'COURSE_REPEAT_LIMIT':
      set('max_repeats', d.maxRepeats);
      out.scope = 'single_course';
      break;
    case 'RETAKE':
      set('max_score_for_retake', d.maxScoreForRetake);
      set('max_attempts', d.maxAttempts);
      out.operator = d.operator;
      break;
    case 'ADVANCED_STUDY':
      set('min_gpa', d.minGpa);
      set('min_credits_earned', d.minCreditsEarned);
      out.scope = 'fast_track';
      break;
    default:
      if (d.otherKind === 'attendance') {
        set('min_attendance_percent', d.minAttendance);
        out.operator = d.operator;
        out.scope = 'course_attendance';
      } else {
        set('min_credits', d.minCredits);
        if (d.minGpa !== '') out.min_gpa = d.minGpa;
        if (d.courseCode.trim() !== '') out.course_code = d.courseCode.trim().toUpperCase();
        out.scope = 'milestone';
      }
      break;
  }
  return out;
}

export function gradeFromCondition(policy: string, d: CondDraft): number | null {
  const candidate =
    policy === 'GPA_WARNING' || policy === 'ACADEMIC_PROBATION' || policy === 'ADVANCED_STUDY'
      ? d.minGpa
      : policy === 'MAX_CREDITS_PER_SEMESTER'
        ? d.maxCredits
        : policy === 'MIN_CREDITS_PER_SEMESTER'
          ? d.minCredits
          : policy === 'COURSE_REPEAT_LIMIT'
            ? d.maxRepeats
            : policy === 'RETAKE'
              ? d.maxScoreForRetake
              : d.otherKind === 'attendance'
                ? d.minAttendance
                : d.minCredits;
  return candidate === '' ? null : candidate;
}

export function describeCondition(policy: string, d: CondDraft): string {
  const val = (v: Num) => (v === '' ? '…' : String(v));
  switch (policy) {
    case 'GPA_WARNING':
      return `Warn when ${d.scope === 'cumulative_gpa' ? 'cumulative GPA' : 'semester GPA'} is ${d.operator === '<=' ? 'at or below' : 'below'} ${val(d.minGpa)}`;
    case 'ACADEMIC_PROBATION':
      return `Probation when GPA is below ${val(d.minGpa)} for ${val(d.consecutiveSemesters)} consecutive semester(s)`;
    case 'MAX_CREDITS_PER_SEMESTER':
      return `Students may register up to ${val(d.maxCredits)} credits per semester`;
    case 'MIN_CREDITS_PER_SEMESTER':
      return `Warn when registering below ${val(d.minCredits)} credits${d.fullTimeOnly ? ' (full-time students)' : ''}`;
    case 'COURSE_REPEAT_LIMIT':
      return `Each course may be repeated at most ${val(d.maxRepeats)} time(s)`;
    case 'RETAKE':
      return `Allow retake up to ${val(d.maxAttempts)} time(s) when the score is ${d.operator === '<=' ? 'at or below' : 'below'} ${val(d.maxScoreForRetake)}`;
    case 'ADVANCED_STUDY':
      return `Fast-track when GPA ≥ ${val(d.minGpa)} with ${val(d.minCreditsEarned)} credits earned`;
    default:
      if (d.otherKind === 'attendance') {
        return `Block when attendance is below ${d.minAttendance === '' ? '…' : `${d.minAttendance}%`} of sessions`;
      }
      return `Require ${val(d.minCredits)} credits${d.minGpa !== '' ? ` and GPA ≥ ${d.minGpa}` : ''}${d.courseCode.trim() !== '' ? ` before ${d.courseCode.trim().toUpperCase()}` : ''}`;
  }
}
