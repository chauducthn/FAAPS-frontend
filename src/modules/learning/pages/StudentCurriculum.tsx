// Student / Curriculum: 3-tab workspace (Curriculum Courses | Course Pool | Major & Electives)
import { useState } from 'react';
import { BookOpen, SlidersHorizontal, Stack } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { FlmPreferencesCard } from '../components/FlmPreferencesCard';
import { MajorCurriculumCard } from '../components/MajorCurriculumCard';
import { StudentCurriculumCoursesCard } from '../components/StudentCurriculumCoursesCard';
import { TranscriptImport } from '../components/TranscriptImport';
import { useMyProfile } from '../hooks/queries/useStudentQueries';

type CurriculumTab = 'courses' | 'pool' | 'setup';

const TABS: { key: CurriculumTab; label: string; icon: typeof BookOpen }[] = [
  { key: 'courses', label: 'Curriculum Courses', icon: BookOpen },
  { key: 'pool', label: 'Course Pool', icon: Stack },
  { key: 'setup', label: 'Major & Electives', icon: SlidersHorizontal },
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

  const setupPanel = (
    <aside className="h-full min-h-0 overflow-y-auto pr-0.5">
      <div className="space-y-3 pb-1">
        {isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
            <span>Unable to load your academic profile.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        ) : isLoading || !profile ? (
          <div className="space-y-3">
            <div className="h-48 animate-pulse rounded-2xl bg-white shadow-2xs" />
            <div className="h-56 animate-pulse rounded-2xl bg-white shadow-2xs" />
          </div>
        ) : (
          <>
            <MajorCurriculumCard profile={profile} compact />
            <FlmPreferencesCard majorCode={profile.majorCode} compact />
          </>
        )}
        <TranscriptImport compact />
      </div>
    </aside>
  );

  return (
    <div className="flex w-full flex-col gap-3 lg:h-[calc(100vh-116px)] lg:overflow-hidden">
      <div className="min-h-0 flex-1">
        <StudentCurriculumCoursesCard
          topRightSlot={tabSwitcher}
          rightPanelMode={tab === 'pool' ? 'pool' : tab === 'setup' ? 'setup' : 'info'}
          setupPanel={setupPanel}
          onSwitchRightPanel={(mode) => setTab(mode === 'pool' ? 'pool' : mode === 'setup' ? 'setup' : 'courses')}
        />
      </div>
    </div>
  );
}
