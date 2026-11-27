// Student / Curriculum: full-viewport 2-island workspace (Courses | Major & Electives | Import Transcript)
import { useState } from 'react';
import { BookOpen, SlidersHorizontal, UploadSimple } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { FlmPreferencesCard } from '../components/FlmPreferencesCard';
import { MajorCurriculumCard } from '../components/MajorCurriculumCard';
import { StudentCurriculumCoursesCard } from '../components/StudentCurriculumCoursesCard';
import { TranscriptImport } from '../components/TranscriptImport';
import { useMyProfile } from '../hooks/queries/useStudentQueries';

type CurriculumTab = 'courses' | 'setup' | 'import';

const TABS: { key: CurriculumTab; label: string; icon: typeof BookOpen }[] = [
  { key: 'courses', label: 'Curriculum Courses', icon: BookOpen },
  { key: 'setup', label: 'Major & Electives', icon: SlidersHorizontal },
  { key: 'import', label: 'Import Transcript', icon: UploadSimple },
];

export default function StudentCurriculum() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const [tab, setTab] = useState<CurriculumTab>('courses');

  const tabSwitcher = (
    <div
      role="tablist"
      aria-label="Curriculum sections"
      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1 shadow-2xs"
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
  );

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3',
        tab === 'courses' ? 'lg:h-[calc(100vh-116px)] lg:overflow-hidden' : 'pb-6',
      )}
    >
      {tab !== 'courses' && <div className="flex shrink-0 items-center justify-end">{tabSwitcher}</div>}

      {tab === 'courses' && (
        <div className="min-h-0 flex-1">
          <StudentCurriculumCoursesCard topRightSlot={tabSwitcher} />
        </div>
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
