import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpenText as BookOpenCheck, FileXls as FileSpreadsheet, GraduationCap, Sparkle as Sparkles, Target } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { useGenerateRoadmap } from '../../ai/hooks/mutations/useAiStudentMutations';
import type { RoadmapOrientation } from '../../ai/types/ai-student';
import { useMyProfile, useMyProgress } from '../hooks/queries/useStudentQueries';

const ORIENTATIONS: { value: RoadmapOrientation; label: string; hint: string }[] = [
  { value: 'JOB', label: 'Industry / Job-ready', hint: 'Hands-on projects, OJT & portfolio' },
  { value: 'ACADEMIC', label: 'Academic Excellence', hint: 'Strong GPA & theoretical mastery' },
  { value: 'RESEARCH', label: 'Research & Graduate', hint: 'Seminars, papers & faculty labs' },
  { value: 'ENTREPRENEURIAL', label: 'Startup / Product', hint: 'EXE electives & Capstone MVP' },
];

export default function StudentCurriculumGoals() {
  const navigate = useNavigate();
  const profile = useMyProfile();
  const progress = useMyProgress();
  const semesters = useQuery({
    queryKey: ['student', 'semesters'],
    queryFn: studentAcademicService.semesters,
    staleTime: 5 * 60_000,
  });
  const generateRoadmap = useGenerateRoadmap();

  const [expectedGraduationSemesterId, setExpectedGraduationSemesterId] = useState('');
  const [orientation, setOrientation] = useState<RoadmapOrientation>('JOB');
  const [targetGpa, setTargetGpa] = useState('8.0');
  const [maxCredits, setMaxCredits] = useState('18');
  const [careerGoal, setCareerGoal] = useState('');

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const gpaNum = Number(targetGpa);
    const creditsNum = Number(maxCredits);
    generateRoadmap.mutate(
      {
        goal: careerGoal.trim() || undefined,
        orientation,
        expectedGraduationSemesterId: expectedGraduationSemesterId || undefined,
        targetGpa: Number.isFinite(gpaNum) && gpaNum >= 0 && gpaNum <= 10 ? gpaNum : undefined,
        maxCreditsPerSemester: Number.isFinite(creditsNum) && creditsNum > 0 ? Math.round(creditsNum) : 18,
      },
      {
        onSuccess: () => {
          toast.success('Study plan & learning method generated.');
          navigate('/student/ai-roadmap');
        },
      },
    );
  };

  const gpaDisplay = progress.data?.currentGpa != null ? progress.data.currentGpa.toFixed(2) : '—';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-gray-500">Study Setup &amp; Plan / Study Goals</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Study Goals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define your graduation timeline, career orientation, and GPA targets to generate a personalized study plan.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/student/curriculum" className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs transition-colors hover:border-orange-300">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
              <GraduationCap className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">1. Curriculum</p>
              <p className="truncate text-sm font-bold text-gray-900">
                {profile.data?.majorCode
                  ? `${profile.data.majorCode}${profile.data.cohort ? ` · ${profile.data.cohort}` : ''}`
                  : 'Configure curriculum'}
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 shrink-0 text-gray-400" />
        </Link>

        <Link to="/student/transcript" className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs transition-colors hover:border-orange-300">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="size-4.5" />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">2. FAP Transcript</p>
              <p className="text-sm font-bold text-gray-900">
                {progress.data ? `GPA ${gpaDisplay} · ${progress.data.earnedCredits} cr` : 'Import grades'}
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-gray-400" />
        </Link>

        <Link to="/student/ai-roadmap" className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs transition-colors hover:border-orange-300">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <BookOpenCheck className="size-4.5" />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">3. Study Roadmap</p>
              <p className="text-sm font-bold text-gray-900">View AI plan</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-gray-400" />
        </Link>
      </div>

      <form onSubmit={handleGeneratePlan} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3.5">
          <Target className="size-4.5 text-[#F26F21]" />
          <div>
            <h2 className="text-sm font-bold text-gray-900">Define Study Goals &amp; Generate Study Plan</h2>
            <p className="text-xs text-gray-500">
              FAAPS proposes semesters, courses, and a tailored study method based on your targets.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Expected Graduation Semester</label>
            <select value={expectedGraduationSemesterId} onChange={(e) => setExpectedGraduationSemesterId(e.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 focus:border-[#F26F21] focus:outline-none">
              <option value="">Auto-calculate from curriculum</option>
              {(semesters.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Target GPA (0 – 10)</label>
            <input type="number" step="0.1" min="0" max="10" value={targetGpa} onChange={(e) => setTargetGpa(e.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 focus:border-[#F26F21] focus:outline-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Max Credits / Semester</label>
            <input type="number" min="6" max="24" value={maxCredits} onChange={(e) => setMaxCredits(e.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 focus:border-[#F26F21] focus:outline-none" />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Career Orientation</label>
          <div className="grid gap-2 sm:grid-cols-4">
            {ORIENTATIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setOrientation(opt.value)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  orientation === opt.value
                    ? 'border-[#F26F21] bg-orange-50/50 text-[#9a3412]'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <p className="text-xs font-bold">{opt.label}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">{opt.hint}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Target Job Role / Specific Focus</label>
          <input value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} placeholder="e.g. Backend Java Engineer, AI/ML Engineer, Full-stack Web Developer…" className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none" />
        </div>

        <div className="mt-5 flex justify-end">
          <button type="submit" disabled={generateRoadmap.isPending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#F26F21] px-5 text-[13px] font-bold text-white shadow-2xs transition-colors hover:bg-[#e05f14] disabled:opacity-55">
            <Sparkles className="size-4" />
            {generateRoadmap.isPending ? 'Generating study plan…' : 'Generate Study Plan & Method'}
          </button>
        </div>
      </form>
    </div>
  );
}
