// Row of summary cards at the top of the student dashboard: credits, GPA, courses, latest standing.

import { Award, BookCheck, GraduationCap, Star } from 'lucide-react';
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

function Card({ icon: Icon, label, children }: { icon: typeof Star; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#555f6f]">
        <span className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-[#F26F21]">
          <Icon className="size-4" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function ProgressSummary({ progress, isLoading }: { progress: Progress | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-xl bg-white shadow-sm" />
        ))}
      </div>
    );
  }
  if (!progress) return null;

  const percent =
    progress.requiredCredits > 0 ? Math.min(100, Math.round((progress.earnedCredits / progress.requiredCredits) * 100)) : 0;
  const latest = progress.semesters[progress.semesters.length - 1];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card icon={GraduationCap} label="Credits earned">
        <p className="text-xl font-semibold text-[#151c27]">
          {progress.earnedCredits}
          <span className="text-sm font-medium text-[#98a2b3]"> / {progress.requiredCredits}</span>
        </p>
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
        <p className="mt-1 text-[11px] text-[#98a2b3]">{percent}% of the curriculum</p>
      </Card>

      <Card icon={Star} label="GPA">
        <p className="text-xl font-semibold text-[#151c27]">
          {progress.currentGpa ? progress.currentGpa.toFixed(2) : '—'}
          <span className="text-sm font-medium text-[#98a2b3]"> / 10</span>
        </p>
        <p className="mt-1 text-[11px] text-[#98a2b3]">{progress.currentGpa ? 'Cumulative GPA' : 'No grades yet'}</p>
      </Card>

      <Card icon={BookCheck} label="Courses completed">
        <p className="text-xl font-semibold text-[#151c27]">
          {progress.completedCourses}
          <span className="text-sm font-medium text-[#98a2b3]"> / {progress.curriculumCourses}</span>
        </p>
        <p className="mt-1 text-[11px] text-[#98a2b3]">Curriculum courses passed</p>
      </Card>

      <Card icon={Award} label="Latest standing">
        <p className="text-base font-semibold text-[#151c27]">{latest ? standingLabel(latest.standing) : '—'}</p>
        <p className="mt-1 text-[11px] text-[#98a2b3]">
          {latest ? `${latest.name} · GPA ${latest.semesterGpa.toFixed(2)}` : 'Import your transcript to see it'}
        </p>
      </Card>
    </div>
  );
}
