// src/modules/advising/components/student360/StudentOverviewTab.tsx
// The "Overview" tab of the Student 360 modal: contact details, the three KPI
// cards (GPA / credits / courses) and the per-semester progress list.

import { CalendarDays, Mail, Phone, UserRound } from 'lucide-react';
import type { AdvisorStudentDetail } from '../../services/advisorService';
import { ProgressBar } from './shared';

interface Props {
  detail: AdvisorStudentDetail;
}

export default function StudentOverviewTab({ detail }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-2">
        <p className="flex items-center gap-2 text-sm">
          <UserRound className="size-4 text-[#F26F21]" aria-hidden />
          <span className="text-slate-500">Student ID:</span>
          <strong>{detail.profile.studentCode ?? '—'}</strong>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <Mail className="size-4 text-[#F26F21]" aria-hidden />
          <span className="text-slate-500">Email:</span>
          <strong className="truncate">{detail.profile.email}</strong>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <Phone className="size-4 text-[#F26F21]" aria-hidden />
          <span className="text-slate-500">Phone:</span>
          <strong>{detail.profile.phone ?? '—'}</strong>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <CalendarDays className="size-4 text-[#F26F21]" aria-hidden />
          <span className="text-slate-500">Date of birth:</span>
          <strong>{detail.profile.dateOfBirth ?? '—'}</strong>
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'GPA', value: detail.progress.currentGpa?.toFixed(2) ?? '—' },
          {
            label: 'Credits earned',
            value: `${detail.progress.earnedCredits}/${detail.progress.requiredCredits}`,
          },
          {
            label: 'Courses completed',
            value: `${detail.progress.completedCourses}/${detail.progress.curriculumCourses}`,
          },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#151c27]">{c.value}</p>
            <ProgressBar value={detail.progress.earnedCredits} max={detail.progress.requiredCredits} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="text-sm font-bold text-[#151c27]">Progress by semester</h3>
        <div className="mt-3 space-y-2">
          {detail.progress.semesters.map((s) => (
            <div key={s.code} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-600">
                {s.name} <span className="text-xs text-slate-400">({s.code})</span>
              </span>
              <span className="text-[13px] text-slate-500">
                GPA {s.semesterGpa?.toFixed(2) ?? '—'} · {s.creditsEarned}/{s.creditsEnrolled} cr
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
