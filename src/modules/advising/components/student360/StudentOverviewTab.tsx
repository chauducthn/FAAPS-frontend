// src/modules/advising/components/student360/StudentOverviewTab.tsx
// The "Overview" tab of the Student 360 modal: contact details, the three KPI
// cards (GPA / credits / courses) and the per-semester progress list.
//
// Mọi thuộc tính đều được đọc an toàn (optional chaining + fallback) để API
// trả payload thiếu `progress` / `semesters` không làm tab (và cả app) trắng.

import { CalendarDays, Mail, Phone, UserRound } from 'lucide-react';
import type { AdvisorStudentDetail } from '../../services/advisorService';
import { ProgressBar } from './shared';

interface Props {
  detail: AdvisorStudentDetail;
}

export default function StudentOverviewTab({ detail }: Props) {
  const profile = detail?.profile ?? null;
  const progress = detail?.progress ?? null;
  const semesters = progress?.semesters ?? [];

  const earnedCredits = progress?.earnedCredits ?? 0;
  const requiredCredits = progress?.requiredCredits ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-2">
        <p className="flex items-center gap-2 text-sm">
          <UserRound className="size-4 text-[#F26F21]" aria-hidden />
          <span className="text-slate-500">Student ID:</span>
          <strong>{profile?.studentCode ?? '—'}</strong>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <Mail className="size-4 text-[#F26F21]" aria-hidden />
          <span className="text-slate-500">Email:</span>
          <strong className="truncate">{profile?.email ?? '—'}</strong>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <Phone className="size-4 text-[#F26F21]" aria-hidden />
          <span className="text-slate-500">Phone:</span>
          <strong>{profile?.phone ?? '—'}</strong>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <CalendarDays className="size-4 text-[#F26F21]" aria-hidden />
          <span className="text-slate-500">Date of birth:</span>
          <strong>{profile?.dateOfBirth ?? '—'}</strong>
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'GPA', value: progress?.currentGpa?.toFixed(2) ?? '—' },
          {
            label: 'Credits earned',
            value: `${earnedCredits}/${requiredCredits}`,
          },
          {
            label: 'Courses completed',
            value: `${progress?.completedCourses ?? 0}/${progress?.curriculumCourses ?? 0}`,
          },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#151c27]">{c.value}</p>
            <ProgressBar value={earnedCredits} max={requiredCredits} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="text-sm font-bold text-[#151c27]">Progress by semester</h3>
        <div className="mt-3 space-y-2">
          {semesters.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[13px] text-slate-500">
              No semester progress is available for this student yet.
            </p>
          ) : (
            semesters.map((s) => (
              <div key={s.code} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-600">
                  {s.name} <span className="text-xs text-slate-400">({s.code})</span>
                </span>
                <span className="text-[13px] text-slate-500">
                  GPA{' '}
                  {typeof s.semesterGpa === 'number' && Number.isFinite(s.semesterGpa)
                    ? s.semesterGpa.toFixed(2)
                    : '—'}{' '}
                  · {s.creditsEarned ?? 0}/{s.creditsEnrolled ?? 0} cr
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
