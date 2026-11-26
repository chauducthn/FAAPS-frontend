// Student / Curriculum: compact 3-tab workspace (Courses | Major & Electives | Import Transcript)
// with an inline summary strip so Courses are immediately visible above the fold.
import { useState } from 'react';
import { BookOpen, GraduationCap, SlidersHorizontal, UploadSimple } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { FlmPreferencesCard } from '../components/FlmPreferencesCard';
import { MajorCurriculumCard } from '../components/MajorCurriculumCard';
import { StudentCurriculumCoursesCard } from '../components/StudentCurriculumCoursesCard';
import { TranscriptImport } from '../components/TranscriptImport';
import { useMyProfile, useMyProgress } from '../hooks/queries/useStudentQueries';

type CurriculumTab = 'courses' | 'setup' | 'import';

const TABS: { key: CurriculumTab; label: string; icon: typeof BookOpen }[] = [
  { key: 'courses', label: 'Curriculum Courses', icon: BookOpen },
  { key: 'setup', label: 'Major & Electives', icon: SlidersHorizontal },
  { key: 'import', label: 'Import Transcript', icon: UploadSimple },
];

export default function StudentCurriculum() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const progress = useMyProgress();
  const [tab, setTab] = useState<CurriculumTab>('courses');

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">Study Setup &amp; Plan / Curriculum</p>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-gray-900">Curriculum</h1>
            {profile?.majorCode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-[#C2410C] ring-1 ring-inset ring-orange-200/80">
                <GraduationCap className="size-3.5" aria-hidden />
                {profile.majorCode}
                {profile.cohort ? ` · ${profile.cohort}` : ''}
              </span>
            )}
            {progress.data && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                {progress.data.earnedCredits} cr earned
                {progress.data.currentGpa != null ? ` · GPA ${progress.data.currentGpa.toFixed(2)}` : ''}
              </span>
            )}
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Curriculum sections"
          className="inline-flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1 shadow-2xs"
        >
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={cn(
                  'inline-flex h-8.5 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-[#F26F21] text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'courses' && (
        <StudentCurriculumCoursesCard onOpenSetup={() => setTab('setup')} />
      )}

      {tab === 'setup' && (
        isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>Unable to load your academic profile.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        ) : isLoading || !profile ? (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="h-60 animate-pulse rounded-2xl bg-white shadow-2xs lg:col-span-5" />
            <div className="h-60 animate-pulse rounded-2xl bg-white shadow-2xs lg:col-span-7" />
          </div>
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <MajorCurriculumCard profile={profile} />
            </div>
            <div className="lg:col-span-7">
              <FlmPreferencesCard majorCode={profile.majorCode} />
            </div>
          </div>
        )
      )}

      {tab === 'import' && <TranscriptImport />}
    </div>
  );
}
