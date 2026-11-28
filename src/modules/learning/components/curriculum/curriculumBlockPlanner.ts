import type { AcademicBlockConfigView } from '../../../management/services/academic-block.service';
import {
  getActiveRegularBlocks,
  type BlockTone,
  type EffectiveCurriculumCourse,
  type RegularBlockMeta,
} from './curriculumBlockRules';

export interface PlannedCourseRow {
  course: EffectiveCurriculumCourse;
  blockCode: string;
  blockLabel: string;
  durationLabel: string;
  blockTone: BlockTone;
}

export interface BlockSection {
  id: string;
  blockCode: string;
  blockType: string;
  title: string;
  subtitle: string;
  maxSlots: number;
  maxCredits: number;
  droppable: boolean;
  blockMeta?: RegularBlockMeta;
  emptyHint?: string;
  rows: PlannedCourseRow[];
}

const ENGLISH_LEVEL_RE = /^(PEN|TRS|LUK)\d+/i;

function buildRegularBlockSections(
  courses: EffectiveCurriculumCourse[],
  semKey: string,
  regularBlocks: RegularBlockMeta[],
): BlockSection[] {
  const mainBlock = regularBlocks.find((b) => b.blockType === 'MAIN') ?? regularBlocks[0];
  const intensiveBlock = regularBlocks.find((b) => b.blockType === 'INTENSIVE') ?? regularBlocks[regularBlocks.length - 1];

  const buckets = new Map<string, EffectiveCurriculumCourse[]>();
  for (const b of regularBlocks) buckets.set(b.code, []);

  const unplaced: EffectiveCurriculumCourse[] = [];
  for (const c of courses) {
    const placedCode = c.placement?.blockCode?.toUpperCase();
    if (placedCode && buckets.has(placedCode)) buckets.get(placedCode)!.push(c);
    else unplaced.push(c);
  }

  const mainBucket = buckets.get(mainBlock.code)!;
  const intensiveBucket = buckets.get(intensiveBlock.code)!;
  for (const c of unplaced) {
    if (mainBucket.length < mainBlock.maxCourses || intensiveBlock.code === mainBlock.code) {
      mainBucket.push(c);
    } else {
      intensiveBucket.push(c);
    }
  }

  return regularBlocks.map((b) => {
    const items = buckets.get(b.code) ?? [];
    const rows: PlannedCourseRow[] = items.map((c) => {
      const isCap = /490|_GRA_/i.test(c.code.trim());
      return {
        course: c,
        blockCode: b.code,
        blockLabel: isCap ? 'Capstone' : b.shortName,
        durationLabel: `${b.durationWeeks}w`,
        blockTone: isCap ? 'cap' : b.tone,
      };
    });
    const isSecondary = b.blockType !== 'MAIN';
    const hasDuration = new RegExp(`\\b${b.durationWeeks}w\\b`, 'i').test(b.shortName);
    return {
      id: `${semKey}-${b.code.toLowerCase()}`,
      blockCode: b.code,
      blockType: b.blockType,
      title: hasDuration ? b.shortName : `${b.shortName} · ${b.durationWeeks}w`,
      subtitle: `${rows.length}/${b.maxCourses} courses`,
      maxSlots: b.maxCourses,
      maxCredits: b.maxCredits,
      droppable: true,
      blockMeta: b,
      emptyHint: isSecondary
        ? `Drop eligible courses here (up to ${b.maxCourses}).`
        : 'Drop courses here.',
      rows,
    };
  });
}

export function planSemesterBlocks(
  courses: EffectiveCurriculumCourse[],
  sem: number,
  _cohort: string | null | undefined,
  config: AcademicBlockConfigView | undefined,
  prepIndex?: number,
): BlockSection[] {
  const prepPartsPerSem = Math.max(1, config?.limits.prepPartsPerSemester ?? 2);
  const prepCfg = (config?.blocks ?? []).find((b) => b.active && b.blockType === 'PREP');
  const prepWeeks = prepCfg?.durationWeeks ?? 7;
  const regularBlocks = getActiveRegularBlocks(config);

  if (sem <= 0) {
    const english = courses.filter((c) => ENGLISH_LEVEL_RE.test(c.code.trim())).sort((a, b) => a.code.localeCompare(b.code));
    const orient = courses.filter((c) => /^OTP/i.test(c.code.trim()));
    const others = courses.filter((c) => !ENGLISH_LEVEL_RE.test(c.code.trim()) && !/^OTP/i.test(c.code.trim()));
    const sections: BlockSection[] = [];

    if (english.length > 0) {
      const label = prepIndex ? `Prep ${prepIndex}` : 'Prep Term';
      sections.push({
        id: `prep-term-${prepIndex ?? 1}`,
        blockCode: 'PREP_PART',
        blockType: 'PREP',
        title: `${label} · ${english.length * prepWeeks}w (${prepWeeks}w / level)`,
        subtitle: `${english.length}/${prepPartsPerSem} levels`,
        maxSlots: prepPartsPerSem,
        maxCredits: 0,
        droppable: false,
        rows: english.map((c, idx) => ({
          course: c,
          blockCode: 'PREP_PART',
          blockLabel: `Part ${idx + 1}`,
          durationLabel: `${prepWeeks}w`,
          blockTone: 'prep',
        })),
      });
    }

    if (orient.length > 0) {
      sections.push({
        id: `prep-${prepIndex ?? 1}-orient`,
        blockCode: 'ORIENT',
        blockType: 'ORIENT',
        title: 'Orientation · 2w',
        subtitle: `${orient.length} ${orient.length === 1 ? 'course' : 'courses'}`,
        maxSlots: orient.length,
        maxCredits: 0,
        droppable: false,
        rows: orient.map((c) => ({
          course: c,
          blockCode: 'ORIENT',
          blockLabel: 'Orientation',
          durationLabel: '2w',
          blockTone: 'orient',
        })),
      });
    }

    // Prep terms have the same 14-week calendar structure as regular semesters (Block 10W / 5W / 3W)
    sections.push(...buildRegularBlockSections(others, `prep-${prepIndex ?? 1}`, regularBlocks));
    return sections;
  }

  const isOjtSem = courses.length === 1 && /^OJT/i.test(courses[0].code.trim());
  if (isOjtSem) {
    return [{
      id: `sem-${sem}-ojt`,
      blockCode: 'OJT',
      blockType: 'OJT',
      title: 'OJT Block · 15 weeks',
      subtitle: '1/1 slot · On-the-Job Training',
      maxSlots: 1,
      maxCredits: 10,
      droppable: false,
      rows: [{ course: courses[0], blockCode: 'OJT', blockLabel: 'OJT Term', durationLabel: '15w', blockTone: 'ojt' }],
    }];
  }

  return buildRegularBlockSections(courses, `sem-${sem}`, regularBlocks);
}
