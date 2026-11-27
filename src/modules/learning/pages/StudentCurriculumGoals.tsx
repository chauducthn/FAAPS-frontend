import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, UploadSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { studentAcademicService, type StudyJourneyGoal } from '../../academic/services/studentAcademicService';
import { useGenerateRoadmap } from '../../ai/hooks/mutations/useAiStudentMutations';
import type { RoadmapOrientation } from '../../ai/types/ai-student';
import { buildTranscriptMap, classifyStatus } from '../components/curriculum/curriculumCourseHelpers';
import { StudyJourneyGoalCards } from '../components/journey/StudyJourneyGoalCards';
import { StudyJourneySummaryPanel } from '../components/journey/StudyJourneySummaryPanel';
import { buildGraduationTermOptions, computeEffectiveCurrentSem, evaluateGpaFeasibility, roleSuggestionsForMajor } from '../components/journey/studyJourneyHelpers';
import { useMyCurriculum, useMyCurriculumCourses, useMyProfile, useMyProgress, useMyTranscript } from '../hooks/queries/useStudentQueries';

const JOURNEY_GOAL_KEY = ['student', 'study-journey-goal'] as const;

export default function StudentCurriculumGoals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useMyProfile();
  const progress = useMyProgress();
  const curriculum = useMyCurriculum();
  const coursesQuery = useMyCurriculumCourses();
  const transcriptQuery = useMyTranscript();
  const equivalentsQuery = useQuery({ queryKey: ['student', 'curriculum-equivalents'], queryFn: studentAcademicService.curriculumEquivalents, staleTime: 5 * 60_000, retry: false });
  const semestersQuery = useQuery({ queryKey: ['student', 'semesters'], queryFn: studentAcademicService.semesters, staleTime: 5 * 60_000 });
  const savedGoalQuery = useQuery({ queryKey: JOURNEY_GOAL_KEY, queryFn: studentAcademicService.studyJourneyGoal, staleTime: 60_000, retry: false });

  const generateRoadmap = useGenerateRoadmap();
  const saveGoalMutation = useMutation({
    mutationFn: studentAcademicService.saveStudyJourneyGoal,
    onSuccess: (next) => queryClient.setQueryData(JOURNEY_GOAL_KEY, next),
    onError: () => toast.error('Could not save your Study Journey goals.'),
  });

  const rawCourses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const transcriptByCode = useMemo(
    () => buildTranscriptMap(transcriptQuery.data, equivalentsQuery.data),
    [transcriptQuery.data, equivalentsQuery.data],
  );
  const effectiveCurrentSem = useMemo(
    () => computeEffectiveCurrentSem(rawCourses, transcriptByCode, profile.data?.currentSemester),
    [rawCourses, transcriptByCode, profile.data?.currentSemester],
  );
  const termOptions = useMemo(
    () => buildGraduationTermOptions(transcriptByCode, effectiveCurrentSem),
    [transcriptByCode, effectiveCurrentSem],
  );
  const recommendedTerm = useMemo(
    () => termOptions.find((t) => t.recommended) ?? termOptions[0] ?? null,
    [termOptions],
  );

  const [selectedTermCode, setSelectedTermCode] = useState<string>('');
  const [orientation, setOrientation] = useState<RoadmapOrientation>('JOB');
  const [targetJobRole, setTargetJobRole] = useState<string>('');
  const [targetGpa, setTargetGpa] = useState<number>(8.0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated || !savedGoalQuery.isFetched) return;
    const saved = savedGoalQuery.data;
    if (saved?.expectedGraduationTerm) setSelectedTermCode(saved.expectedGraduationTerm);
    else if (recommendedTerm) setSelectedTermCode(recommendedTerm.code);
    if (saved?.careerOrientation) setOrientation(saved.careerOrientation);
    if (saved?.targetJobRole) setTargetJobRole(saved.targetJobRole);
    if (saved?.targetGpa != null) setTargetGpa(saved.targetGpa);
    setHydrated(true);
  }, [hydrated, savedGoalQuery.isFetched, savedGoalQuery.data, recommendedTerm]);

  const activeTermCode = selectedTermCode || recommendedTerm?.code || '';
  const selectedTerm = useMemo(
    () => termOptions.find((t) => t.code === activeTermCode) ?? recommendedTerm,
    [termOptions, activeTermCode, recommendedTerm],
  );

  const totalCredits = useMemo(() => rawCourses.reduce((s, c) => s + c.credits, 0), [rawCourses]);
  const passedCredits = useMemo(
    () => rawCourses.reduce((s, c) => (classifyStatus(transcriptByCode.get(c.code.trim().toUpperCase())) === 'PASSED' ? s + c.credits : s), 0),
    [rawCourses, transcriptByCode],
  );
  const failedCount = useMemo(
    () => rawCourses.filter((c) => classifyStatus(transcriptByCode.get(c.code.trim().toUpperCase())) === 'FAILED').length,
    [rawCourses, transcriptByCode],
  );
  const remainingCredits = Math.max(0, totalCredits - passedCredits);
  const currentGpa = progress.data?.currentGpa ?? profile.data?.currentGpa ?? null;
  const feasibility = useMemo(
    () => evaluateGpaFeasibility(currentGpa, passedCredits, remainingCredits, targetGpa),
    [currentGpa, passedCredits, remainingCredits, targetGpa],
  );
  const roleChips = useMemo(() => roleSuggestionsForMajor(profile.data?.majorCode), [profile.data?.majorCode]);
  const hasTranscript = (transcriptQuery.data?.length ?? 0) > 0;
  const majorLabel = curriculum.data?.name ?? (profile.data?.majorCode ? `${profile.data.majorCode}` : 'Not configured');

  const buildPayload = (): StudyJourneyGoal => {
    const matchedSem = (semestersQuery.data ?? []).find((s) => s.code.trim().toUpperCase() === activeTermCode.trim().toUpperCase());
    return {
      expectedGraduationTerm: activeTermCode || null,
      expectedGraduationSemesterId: matchedSem?.id ?? null,
      careerOrientation: orientation,
      targetJobRole: targetJobRole.trim() || null,
      targetGpa: Math.round(targetGpa * 10) / 10,
    };
  };

  const hasUnsavedChanges = useMemo(() => {
    const s = savedGoalQuery.data;
    if (!s) return true;
    return (
      (s.expectedGraduationTerm ?? '') !== activeTermCode ||
      s.careerOrientation !== orientation ||
      (s.targetJobRole ?? '') !== targetJobRole.trim() ||
      (s.targetGpa ?? 8.0) !== Math.round(targetGpa * 10) / 10
    );
  }, [savedGoalQuery.data, activeTermCode, orientation, targetJobRole, targetGpa]);

  const handleSave = () => {
    saveGoalMutation.mutate(buildPayload(), { onSuccess: () => toast.success('Study Journey goals saved.') });
  };

  const handleSaveAndGenerate = () => {
    const payload = buildPayload();
    const termsLeft = Math.max(1, selectedTerm?.termsFromNow ?? 1);
    const maxCredits = Math.max(12, Math.min(24, Math.ceil(remainingCredits / termsLeft) || 18));
    saveGoalMutation.mutate(payload);
    generateRoadmap.mutate(
      {
        goal: payload.targetJobRole ?? undefined,
        orientation: payload.careerOrientation,
        expectedGraduationSemesterId: payload.expectedGraduationSemesterId ?? undefined,
        targetGpa: payload.targetGpa ?? undefined,
        maxCreditsPerSemester: maxCredits,
      },
      {
        onSuccess: () => {
          toast.success('Study Journey saved & AI Roadmap generated.');
          navigate('/student/ai-roadmap');
        },
      },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-8">
      {!hasTranscript && !transcriptQuery.isLoading && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <UploadSimple className="size-4.5 shrink-0 text-amber-600" />
            <span><strong>Import your transcript first</strong> so Study Journey can calculate your real GPA path and graduation timeline.</span>
          </div>
          <Link to="/student/curriculum" className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">
            Go to Import <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StudyJourneyGoalCards
            termOptions={termOptions} recommendedTerm={recommendedTerm} activeTermCode={activeTermCode}
            remainingCredits={remainingCredits} orientation={orientation} targetJobRole={targetJobRole}
            roleChips={roleChips} targetGpa={targetGpa}
            onSelectTerm={setSelectedTermCode} onSelectOrientation={setOrientation}
            onChangeRole={setTargetJobRole} onChangeGpa={setTargetGpa}
          />
        </div>
        <div className="lg:col-span-5">
          <StudyJourneySummaryPanel
            majorLabel={majorLabel} currentGpa={currentGpa} targetGpa={targetGpa}
            passedCredits={passedCredits} totalCredits={totalCredits} failedCount={failedCount}
            selectedTerm={selectedTerm} orientation={orientation} targetJobRole={targetJobRole}
            feasibility={feasibility} isSaving={saveGoalMutation.isPending} isGenerating={generateRoadmap.isPending}
            hasUnsavedChanges={hasUnsavedChanges} onSave={handleSave} onGenerateRoadmap={handleSaveAndGenerate}
          />
        </div>
      </div>
    </div>
  );
}
