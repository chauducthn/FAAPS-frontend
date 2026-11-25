// Study roadmap panel: AI roadmap request form and graphical timeline.
// Used on the student /student/ai-roadmap page.
//
// Form parameters:
//   goal                         - free-form academic goal
//   maxCreditsPerSemester        - credit cap per semester
//   expectedGraduationSemesterId - target graduation semester (from GET /student/semesters)
//   orientation                  - career/academic orientation
//   targetGpa                    - target GPA (0 - 10)

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Route } from 'lucide-react';
import { useStudyRoadmap } from '../hooks/queries/useAiStudentQueries';
import { useGenerateRoadmap } from '../hooks/mutations/useAiStudentMutations';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import type { RoadmapOrientation } from '../types/ai-student';
import { RoadmapForm } from './RoadmapForm';
import { RoadmapTimeline } from './RoadmapTimeline';

export function RoadmapPanel() {
  const roadmapQuery = useStudyRoadmap();
  const generate = useGenerateRoadmap();

  const semestersQuery = useQuery({
    queryKey: ['student', 'semesters'],
    queryFn: studentAcademicService.semesters,
    staleTime: 5 * 60 * 1000,
  });

  const [goal, setGoal] = useState('');
  const [maxCredits, setMaxCredits] = useState('');
  const [expectedGraduationSemesterId, setExpectedGraduationSemesterId] = useState('');
  const [orientation, setOrientation] = useState<RoadmapOrientation | ''>('');
  const [targetGpa, setTargetGpa] = useState('');

  const roadmap = roadmapQuery.data ?? null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const credits = Number(maxCredits);
    const gpa = Number(targetGpa);
    generate.mutate({
      goal: goal.trim() ? goal.trim() : undefined,
      maxCreditsPerSemester:
        maxCredits.trim() && Number.isFinite(credits) && credits > 0 ? Math.round(credits) : undefined,
      expectedGraduationSemesterId: expectedGraduationSemesterId || undefined,
      orientation: orientation || undefined,
      targetGpa:
        targetGpa.trim() && Number.isFinite(gpa) && gpa >= 0 && gpa <= 10
          ? Math.round(gpa * 100) / 100
          : undefined,
    });
  };

  const semesters = semestersQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <RoadmapForm
        goal={goal}
        onGoalChange={setGoal}
        maxCredits={maxCredits}
        onMaxCreditsChange={setMaxCredits}
        expectedGraduationSemesterId={expectedGraduationSemesterId}
        onExpectedGraduationSemesterIdChange={setExpectedGraduationSemesterId}
        orientation={orientation}
        onOrientationChange={setOrientation}
        targetGpa={targetGpa}
        onTargetGpaChange={setTargetGpa}
        semesters={semesters}
        semestersLoading={semestersQuery.isLoading}
        semestersError={semestersQuery.isError}
        isGenerating={generate.isPending}
        hasRoadmap={Boolean(roadmap)}
        onSubmit={handleGenerate}
      />

      {roadmapQuery.isLoading || generate.isPending ? (
        <section className="rounded-xl bg-white p-5 shadow-sm" aria-label="Loading roadmap">
          <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          <div className="mt-3 h-20 animate-pulse rounded-lg bg-gray-100" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </section>
      ) : roadmapQuery.isError ? (
        <section className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#151c27]">Unable to load the study roadmap</p>
          <p className="text-[13px] text-[#555f6f]">An error occurred while loading data.</p>
          <button
            type="button"
            onClick={() => roadmapQuery.refetch()}
            className="mt-1 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Try again
          </button>
        </section>
      ) : !roadmap ? (
        <section className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-full bg-orange-100 text-[#F26F21]">
            <Route className="size-5" />
          </span>
          <p className="text-sm font-semibold text-[#151c27]">No study roadmap yet</p>
          <p className="max-w-md text-[13px] text-[#555f6f]">
            Enter your goal above, then select “Generate Roadmap” for an AI-generated semester timeline.
          </p>
        </section>
      ) : (
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <RoadmapTimeline roadmap={roadmap} />
        </section>
      )}
    </div>
  );
}
