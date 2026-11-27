import type { CurriculumCourse, TranscriptRow } from '../../../academic/services/studentAcademicService';
import type { RoadmapOrientation } from '../../../ai/types/ai-student';
import { classifyStatus } from '../curriculum/curriculumCourseHelpers';
import { computeNextCalendarSemCode } from '../curriculum/curriculumDraftHelpers';

const SEASONS = ['SP', 'SU', 'FA'] as const;
const SEASON_NAMES: Record<string, string> = { SP: 'Spring', SU: 'Summer', FA: 'Fall' };

export interface GraduationTermOption {
  code: string;
  label: string;
  termsFromNow: number;
  recommended: boolean;
}

export function advanceSemCode(code: string, steps: number): string {
  const m = /^(SP|SU|FA)(\d{4})$/i.exec(code.trim());
  if (!m) {
    const year = new Date().getFullYear();
    const total = steps;
    return `${SEASONS[total % 3]}${year + Math.floor(total / 3)}`;
  }
  const idx = SEASONS.indexOf(m[1].toUpperCase() as (typeof SEASONS)[number]);
  const total = Number(m[2]) * 3 + idx + steps;
  return `${SEASONS[total % 3]}${Math.floor(total / 3)}`;
}

export function formatSemLong(code: string): string {
  const m = /^(SP|SU|FA)(\d{4})$/i.exec(code.trim());
  if (!m) return code;
  return `${SEASON_NAMES[m[1].toUpperCase()]} ${m[2]}`;
}

export function computeEffectiveCurrentSem(
  rawCourses: CurriculumCourse[],
  transcriptByCode: Map<string, TranscriptRow>,
  profileCurrentSem?: number | null,
): number {
  const bySem = new Map<number, { total: number; passed: number }>();
  for (const c of rawCourses) {
    if (c.semesterNumber < 1) continue;
    const entry = bySem.get(c.semesterNumber) ?? { total: 0, passed: 0 };
    entry.total += 1;
    if (classifyStatus(transcriptByCode.get(c.code.trim().toUpperCase())) === 'PASSED') entry.passed += 1;
    bySem.set(c.semesterNumber, entry);
  }
  let highestCompleted = 0;
  for (const [sem, s] of bySem.entries()) {
    if (s.total > 0 && s.passed === s.total && sem > highestCompleted) highestCompleted = sem;
  }
  const maxSem = Math.max(1, ...Array.from(bySem.keys()));
  return Math.min(maxSem, Math.max(profileCurrentSem ?? 1, highestCompleted + 1));
}

export function buildGraduationTermOptions(
  transcriptByCode: Map<string, TranscriptRow>,
  effectiveCurrentSem: number,
  maxCurriculumSem = 9,
): GraduationTermOption[] {
  const nextRaw = computeNextCalendarSemCode(transcriptByCode);
  const startCode = /^(SP|SU|FA)\d{4}$/.test(nextRaw) ? nextRaw : `SP${new Date().getFullYear() + 1}`;
  const remainingTerms = Math.max(1, maxCurriculumSem - effectiveCurrentSem + 1);
  const count = Math.max(6, remainingTerms + 3);
  return Array.from({ length: count }, (_, idx) => {
    const code = advanceSemCode(startCode, idx);
    const termsFromNow = idx + 1;
    return {
      code,
      label: formatSemLong(code),
      termsFromNow,
      recommended: termsFromNow === remainingTerms,
    };
  });
}

export interface GpaFeasibility {
  requiredAvg: number | null;
  status: 'DONE' | 'ON_TRACK' | 'AMBITIOUS' | 'UNREALISTIC' | 'NO_DATA';
  message: string;
}

export function evaluateGpaFeasibility(
  currentGpa: number | null,
  passedCredits: number,
  remainingCredits: number,
  targetGpa: number,
): GpaFeasibility {
  if (remainingCredits <= 0) {
    return { requiredAvg: null, status: 'DONE', message: 'All curriculum credits completed.' };
  }
  if (currentGpa == null || passedCredits <= 0) {
    return {
      requiredAvg: targetGpa,
      status: targetGpa <= 8.5 ? 'ON_TRACK' : 'AMBITIOUS',
      message: `Aim for an average of ${targetGpa.toFixed(2)} across your upcoming courses.`,
    };
  }
  const totalCredits = passedCredits + remainingCredits;
  const required = (targetGpa * totalCredits - currentGpa * passedCredits) / remainingCredits;
  if (required <= 0) {
    return { requiredAvg: 5.0, status: 'ON_TRACK', message: 'Your current GPA already exceeds this target.' };
  }
  if (required > 10) {
    return {
      requiredAvg: required,
      status: 'UNREALISTIC',
      message: `Needs ${required.toFixed(2)}/10 on remaining credits — retake lower-grade courses or lower target.`,
    };
  }
  if (required > 8.8) {
    return {
      requiredAvg: required,
      status: 'AMBITIOUS',
      message: `Challenging — needs ${required.toFixed(2)} avg across ${remainingCredits} remaining credits.`,
    };
  }
  return {
    requiredAvg: required,
    status: 'ON_TRACK',
    message: `Achievable — maintain ${required.toFixed(2)} avg across ${remainingCredits} remaining credits.`,
  };
}

export const ORIENTATION_OPTIONS: {
  value: RoadmapOrientation;
  label: string;
  short: string;
  hint: string;
}[] = [
  { value: 'JOB', label: 'Industry / Job-ready', short: 'Industry', hint: 'Real-world projects, OJT & production portfolio' },
  { value: 'ACADEMIC', label: 'Academic Excellence', short: 'Academic', hint: 'High GPA, honors & deep core foundations' },
  { value: 'RESEARCH', label: 'Research & Graduate', short: 'Research', hint: 'Papers, seminars, labs & master’s prep' },
  { value: 'ENTREPRENEURIAL', label: 'Startup / Product', short: 'Startup', hint: 'Product building, EXE electives & Capstone MVP' },
];

export const GPA_PRESETS = [
  { value: 7.0, label: '7.0', rank: 'Good' },
  { value: 8.0, label: '8.0', rank: 'Very Good' },
  { value: 9.0, label: '9.0', rank: 'Excellent' },
] as const;

export function roleSuggestionsForMajor(majorCode?: string | null): string[] {
  const m = (majorCode ?? '').toUpperCase();
  if (m.startsWith('AI')) {
    return ['AI / ML Engineer', 'Data Scientist', 'Computer Vision Engineer', 'NLP / LLM Engineer', 'MLOps Engineer'];
  }
  if (m.startsWith('IA')) {
    return ['Security Analyst', 'Penetration Tester', 'DevSecOps Engineer', 'Cloud Security Engineer'];
  }
  if (m.startsWith('GD')) {
    return ['UI/UX Designer', 'Product Designer', 'Motion Designer', 'Brand Designer'];
  }
  return [
    'Backend Engineer',
    'Full-stack Developer',
    'Mobile Developer',
    'IC Design Engineer',
    'AI / ML Engineer',
    'DevOps / Cloud Engineer',
    'QA / Automation Engineer',
  ];
}
