import type { AcademicRule } from '../../../academic/types/academic-rule';
import { describeCondition, draftFromCondition } from './ruleConditionDraft';

export interface FormattedRuleCondition {
  primary: string;
  secondary: string | null;
  tooltip: string;
}

function fmtNum(value: number | '' | null | undefined): string | null {
  if (value === '' || value === null || value === undefined || !Number.isFinite(value)) return null;
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function fmtOp(op: string): string {
  if (op === '<=') return '≤';
  if (op === '>=') return '≥';
  return op || '<';
}

function plural(n: number | '', singular: string, pluralWord = `${singular}s`): string {
  return n === 1 ? singular : pluralWord;
}

function fallbackFormat(condition: Record<string, unknown>, grade: number | null): FormattedRuleCondition {
  const entries = Object.entries(condition).filter(([k]) => k !== 'rule_name' && k !== 'grade' && k !== 'scope' && k !== 'operator');
  const first = entries[0];
  const g = fmtNum(grade);
  if (!first) {
    return { primary: g ? `Threshold ${g}` : '—', secondary: null, tooltip: JSON.stringify(condition) };
  }
  const label = first[0].replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  const val = typeof first[1] === 'object' ? JSON.stringify(first[1]) : String(first[1]);
  const extra = entries.length > 1 ? `+${entries.length - 1} more` : null;
  return { primary: `${label}: ${val}`, secondary: extra, tooltip: JSON.stringify(condition, null, 2) };
}

/** Converts a rule's policyType + condition JSON into a scannable threshold and context line. */
export function formatRuleCondition(rule: Pick<AcademicRule, 'policyType' | 'condition' | 'grade'>): FormattedRuleCondition {
  const cond = rule.condition ?? {};
  const d = draftFromCondition(rule.policyType, cond);
  const tooltip = describeCondition(rule.policyType, d);
  const op = fmtOp(d.operator);

  switch (rule.policyType) {
    case 'GPA_WARNING': {
      const gpa = fmtNum(d.minGpa) ?? fmtNum(rule.grade) ?? '—';
      const scope = d.scope === 'cumulative_gpa' ? 'Cumulative GPA' : 'Semester GPA';
      return { primary: `GPA ${op} ${gpa}`, secondary: scope, tooltip };
    }
    case 'ACADEMIC_PROBATION': {
      const gpa = fmtNum(d.minGpa) ?? fmtNum(rule.grade) ?? '—';
      const sem = fmtNum(d.consecutiveSemesters);
      return {
        primary: `GPA ${op} ${gpa}`,
        secondary: sem ? `${sem} consecutive ${plural(d.consecutiveSemesters, 'semester')}` : 'Consecutive semesters',
        tooltip,
      };
    }
    case 'MAX_CREDITS_PER_SEMESTER': {
      const cr = fmtNum(d.maxCredits) ?? fmtNum(rule.grade) ?? '—';
      return { primary: `Max ${cr} credits`, secondary: 'Per semester', tooltip };
    }
    case 'MIN_CREDITS_PER_SEMESTER': {
      const cr = fmtNum(d.minCredits) ?? fmtNum(rule.grade) ?? '—';
      return {
        primary: `Min ${cr} credits`,
        secondary: d.fullTimeOnly ? 'Full-time · Per semester' : 'Per semester',
        tooltip,
      };
    }
    case 'COURSE_REPEAT_LIMIT': {
      const max = fmtNum(d.maxRepeats) ?? fmtNum(rule.grade) ?? '—';
      return {
        primary: `Max ${max} ${plural(d.maxRepeats, 'repeat')}`,
        secondary: 'Per course',
        tooltip,
      };
    }
    case 'RETAKE': {
      const score = fmtNum(d.maxScoreForRetake) ?? fmtNum(rule.grade) ?? '—';
      const attempts = fmtNum(d.maxAttempts);
      return {
        primary: `Score ${op} ${score}`,
        secondary: attempts ? `Max ${attempts} ${plural(d.maxAttempts, 'attempt')}` : 'Course retake',
        tooltip,
      };
    }
    case 'ADVANCED_STUDY': {
      const gpa = fmtNum(d.minGpa) ?? fmtNum(rule.grade) ?? '—';
      const cr = fmtNum(d.minCreditsEarned);
      return {
        primary: `GPA ≥ ${gpa}`,
        secondary: cr ? `Min ${cr} credits · Fast-track` : 'Fast-track',
        tooltip,
      };
    }
    case 'OTHER': {
      if (d.otherKind === 'attendance' || cond.min_attendance_percent !== undefined) {
        const pct = fmtNum(d.minAttendance) ?? fmtNum(rule.grade) ?? '—';
        return { primary: `Attendance ${op} ${pct}%`, secondary: 'Course attendance', tooltip };
      }
      const cr = fmtNum(d.minCredits) ?? fmtNum(rule.grade);
      const parts: string[] = [];
      if (d.courseCode.trim()) parts.push(`Before ${d.courseCode.trim().toUpperCase()}`);
      const gpa = fmtNum(d.minGpa);
      if (gpa) parts.push(`GPA ≥ ${gpa}`);
      return {
        primary: cr ? `Min ${cr} credits` : 'Milestone requirement',
        secondary: parts.length > 0 ? parts.join(' · ') : 'Milestone',
        tooltip,
      };
    }
    default:
      return fallbackFormat(cond, rule.grade);
  }
}
