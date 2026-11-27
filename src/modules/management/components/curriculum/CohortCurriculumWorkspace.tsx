import { useMemo, useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { StatusBadge } from '../StatusBadge';
import { useCurriculum, useCurriculumCourses } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { useCurriculumMutations } from '../../../academic/hooks/mutations/useCurriculumMutations';
import { CoursePoolPanel } from './CoursePoolPanel';
import { CurriculumTermsPanel } from './CurriculumTermsPanel';

interface Props {
  cohortId: string;
  onBackToCohorts: () => void;
}

export function CohortCurriculumWorkspace({ cohortId, onBackToCohorts }: Props) {
  const [targetTerm, setTargetTerm] = useState(1);
  const [busyCourseId, setBusyCourseId] = useState<string | null>(null);
  const curriculum = useCurriculum(cohortId);
  const coursesQuery = useCurriculumCourses(cohortId);
  const mutations = useCurriculumMutations('cohort');

  const courses = coursesQuery.data ?? [];
  const placedTerms = useMemo(
    () => new Map(courses.map((c) => [c.courseId, c.semesterNumber])),
    [courses],
  );

  const handleAddCourse = async (courseId: string, semesterNumber: number) => {
    setBusyCourseId(courseId);
    try {
      await mutations.addCourses({
        id: cohortId,
        body: { courseIds: [courseId], semesterNumber, isMandatory: true },
      });
    } catch {
      return;
    } finally {
      setBusyCourseId(null);
    }
  };

  const handleMoveCourse = async (courseId: string, semesterNumber: number) => {
    setBusyCourseId(courseId);
    try {
      await mutations.updateCourse({ id: cohortId, courseId, semesterNumber });
    } catch {
      return;
    } finally {
      setBusyCourseId(null);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    setBusyCourseId(courseId);
    try {
      await mutations.removeCourse({ id: cohortId, courseId });
    } catch {
      return;
    } finally {
      setBusyCourseId(null);
    }
  };

  if (curriculum.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-lg bg-line-soft" />
        <div className="admin-fill">
          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)]">
            <div className="min-h-[18rem] animate-pulse rounded-lg bg-line-soft lg:col-span-5" />
            <div className="min-h-[18rem] animate-pulse rounded-lg bg-line-soft lg:col-span-7" />
          </div>
        </div>
      </div>
    );
  }

  if (curriculum.isError || !curriculum.data) {
    return (
      <div className="rounded-lg border border-line bg-white px-6 py-12 text-center">
        <p className="text-sm font-semibold text-ink-primary">Could not load cohort curriculum.</p>
        <button
          type="button"
          onClick={onBackToCohorts}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 text-[13px] font-medium text-ink-secondary hover:bg-surface-hover"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to cohorts
        </button>
      </div>
    );
  }

  const item = curriculum.data;
  const usedCredits = courses
    .filter((c) => c.semesterNumber > 0 && !/^(PHE|VOV|GDQP|OTP|TMI|TPI|PEN|TRS|LUK)/i.test(c.courseCode))
    .reduce((sum, c) => sum + c.credits, 0);
  const creditLimit = item.majorTotalCredits ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white px-4 py-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBackToCohorts}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> Cohorts
          </button>
          <div className="h-5 w-px bg-line" aria-hidden />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-ink-primary">
                {item.majorCode} {item.version} — {item.majorName}
              </h2>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-xs text-ink-muted">
              {item.effectiveFromSemesterCode}
              {item.effectiveToSemesterCode ? ` → ${item.effectiveToSemesterCode}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-line bg-surface-page px-3 py-1.5 text-xs font-semibold tabular-nums text-ink-secondary">
          <span>Credits:</span>
          <span className={creditLimit > 0 && usedCredits >= creditLimit ? 'text-brand-ink' : 'text-ink-primary'}>
            {creditLimit > 0 ? `${usedCredits} / ${creditLimit}` : usedCredits}
          </span>
        </div>
      </div>

      <div className="admin-fill">
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col lg:col-span-5">
            <CoursePoolPanel
              placedTerms={placedTerms}
              targetTerm={targetTerm}
              onTargetTermChange={setTargetTerm}
              onAddCourse={(courseId, term) => void handleAddCourse(courseId, term)}
              busyCourseId={busyCourseId}
            />
          </div>
          <div className="flex min-h-0 flex-col lg:col-span-7">
            <CurriculumTermsPanel
              courses={courses}
              targetTerm={targetTerm}
              onSelectTerm={setTargetTerm}
              onMoveCourse={(courseId, term) => void handleMoveCourse(courseId, term)}
              onRemoveCourse={(courseId) => void handleRemoveCourse(courseId)}
              busyCourseId={busyCourseId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
