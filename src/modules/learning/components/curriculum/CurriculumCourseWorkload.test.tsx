import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CourseWorkload } from '../../../academic/types/course';
import type { CourseDetail as StudentCourseDetail } from '../../../academic/services/studentAcademicService';
import type { EffectiveCurriculumCourse } from './curriculumBlockRules';
import { CurriculumCourseCard } from './CurriculumCourseCard';
import { CurriculumCourseDetailPanel } from './CurriculumCourseDetailPanel';
import { buildCurriculumCourseDetail } from './curriculumCourseHelpers';

const heavyWorkload: CourseWorkload = {
  level: 'HEAVY',
  score: 80,
  source: 'DATA_ADJUSTED',
  manualLevel: null,
  ruleLevel: 'MEDIUM',
  ruleScore: 60,
  ruleReasons: ['Core / major specialization'],
  stats: { sampleSize: 40, failRate: 27.5, avgScore: 6.2, sufficientSample: true, dataAdjustment: 20 },
};

const lightWorkload: CourseWorkload = {
  level: 'LIGHT',
  score: 25,
  source: 'RULE_BASED',
  manualLevel: null,
  ruleLevel: 'LIGHT',
  ruleScore: 25,
  ruleReasons: ['Foundational / introductory course'],
  stats: { sampleSize: 5, failRate: 0, avgScore: 8.5, sufficientSample: false, dataAdjustment: 0 },
};

const makeCourse = (overrides: Partial<EffectiveCurriculumCourse> = {}): EffectiveCurriculumCourse => ({
  courseId: 'c-1',
  code: 'PRN212',
  name: 'Basic Cross-Platform Application Programming',
  credits: 3,
  semesterNumber: 5,
  defaultSemesterNumber: 5,
  mandatory: true,
  groupName: null,
  workload: heavyWorkload,
  ...overrides,
});

describe('Curriculum course workload integration', () => {
  it('renders WorkloadBadge on CurriculumCourseCard when workload is present and omits it when null', () => {
    const course = makeCourse();
    const rowBase = { blockCode: 'BLOCK_10W', blockLabel: 'Block 10W', durationLabel: '10w', blockTone: 'main' as const };
    const { rerender } = render(
      <CurriculumCourseCard
        item={{ ...rowBase, course }}
        isSelected={false}
        isDragging={false}
        showSemester={false}
        onSelect={vi.fn()}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.getByText('Heavy')).toBeInTheDocument();

    rerender(
      <CurriculumCourseCard
        item={{ ...rowBase, course: makeCourse({ workload: null }) }}
        isSelected={false}
        isDragging={false}
        showSemester={false}
        onSelect={vi.fn()}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.queryByText('Heavy')).not.toBeInTheDocument();
    expect(screen.queryByText('--')).not.toBeInTheDocument();
  });

  it('renders compact read-only CourseWorkloadCard in CurriculumCourseDetailPanel from selected workload fallback', () => {
    const course = makeCourse();
    const { container } = render(
      <CurriculumCourseDetailPanel
        selected={course}
        termLabel="Sem 5"
        detail={null}
        isLoading={true}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByText('Course workload & difficulty')).toBeInTheDocument();
    expect(screen.getByText('80/100')).toBeInTheDocument();
    expect(screen.getByText('Core / major specialization')).toBeInTheDocument();
    expect(screen.getByText('27.5%')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Workload override' })).not.toBeInTheDocument();
    // Compact mode stacks Layer 1 and Layer 3 in a single column for the narrow sidebar
    expect(container.querySelector('.grid-cols-1')).not.toBeNull();
    expect(container.querySelector('.sm\\:grid-cols-2')).toBeNull();
  });

  it('preserves workload accurately in buildCurriculumCourseDetail across match, mismatch, and error paths', () => {
    const selected = makeCourse({ code: 'PRN212', workload: heavyWorkload });
    const mismatchedDetail: StudentCourseDetail = {
      course: {
        id: 'c-other',
        code: 'OTHER101',
        name: 'Other Course',
        credits: 2,
        category: 'General',
        description: 'Other desc',
        objectives: null,
        learningOutcomes: null,
        workload: lightWorkload,
      },
      prerequisites: [],
    };

    const mismatchResult = buildCurriculumCourseDetail(mismatchedDetail, false, selected);
    expect(mismatchResult?.workload).toEqual(heavyWorkload);

    const errorFallback = buildCurriculumCourseDetail(undefined, true, selected);
    expect(errorFallback?.workload).toEqual(heavyWorkload);

    const matchingDetail: StudentCourseDetail = {
      course: { ...mismatchedDetail.course, id: 'c-1', code: 'PRN212', workload: lightWorkload },
      prerequisites: [],
    };
    const matchResult = buildCurriculumCourseDetail(matchingDetail, false, selected);
    expect(matchResult?.workload).toEqual(lightWorkload);
  });
});
