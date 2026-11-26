// Row of summary cards at the top of the student dashboard: credits, GPA, courses, latest standing.

import { Medal as Award, BookBookmark as BookCheck, GraduationCap, Star } from '@phosphor-icons/react';
import type { Progress } from '../../academic/services/studentAcademicService';

const STANDING_LABEL: Record<string, string> = {
  GOOD: 'Good standing',
  GOOD_STANDING: 'Good standing',
  PROBATION: 'Academic probation',
  WARNING: 'Warning',
  DEAN_LIST: 'Dean list',
};

const standingLabel = (value: string) =>
  STANDING_LABEL[value] ?? value.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());

function Card({
  icon: Icon,
  label,
  tone,
  children,
}: {
  icon: typeof Star;
  label: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-2xs">
      <div className="flex items-center gap-2 text-gray-500">
        <span className={`flex size-7 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-4" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

export function ProgressSummary({ progress, isLoading }: { progress: Progress | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[96px] animate-pulse rounded-xl border border-gray-200/80 bg-white shadow-2xs" />
        ))}
      </div>
    );
  }
  if (!progress) return null;

  const percent =
    progress.requiredCredits > 0 ? Math.min(100, Math.round((progress.earnedCredits / progress.requiredCredits) * 100)) : 0;
  const latest = progress.semesters[progress.semesters.length - 1];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card icon={GraduationCap} label="Credits earned" tone="bg-orange-50 text-[#F26F21]">
        <div className="flex items-baseline justify-between">
          <p className="text-xl font-bold tabular-nums text-gray-900">
            {progress.earnedCredits}
            <span className="text-xs font-medium text-gray-400"> / {progress.requiredCredits}</span>
          </p>
          <span className="text-xs font-semibold tabular-nums text-[#C2410C]">{percent}%</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Credits earned"
        >
          <div className="h-full rounded-full bg-[#F26F21]" style={{ width: `${percent}%` }} />
        </div>
      </Card>

      <Card icon={Star} label="Cumulative GPA" tone="bg-amber-50 text-amber-600">
        <p className="text-xl font-bold tabular-nums text-gray-900">
          {progress.currentGpa ? progress.currentGpa.toFixed(2) : '—'}
          <span className="text-xs font-medium text-gray-400"> / 10</span>
        </p>
        <p className="mt-1 text-[11px] text-gray-400">{progress.currentGpa ? 'Across completed terms' : 'No grades yet'}</p>
      </Card>

      <Card icon={BookCheck} label="Courses passed" tone="bg-emerald-50 text-emerald-700">
        <p className="text-xl font-bold tabular-nums text-gray-900">
          {progress.completedCourses}
          <span className="text-xs font-medium text-gray-400"> / {progress.curriculumCourses}</span>
        </p>
        <p className="mt-1 text-[11px] text-gray-400">Curriculum courses completed</p>
      </Card>

      <Card icon={Award} label="Latest standing" tone="bg-blue-50 text-blue-600">
        <p className="truncate text-base font-bold text-gray-900">{latest ? standingLabel(latest.standing) : '—'}</p>
        <p className="mt-1 truncate text-[11px] text-gray-400">
          {latest
            ? `${latest.name} · GPA ${latest.semesterGpa?.toFixed(2) ?? '—'}`
            : 'Import transcript to calculate'}
        </p>
      </Card>
    </div>
  );
}
