// src/components/learning/StudentProfileCard.tsx
// Card hồ sơ học tập của sinh viên hiện tại.

import { BookOpen, GraduationCap, Hash, Layers, Star, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AcademicStatus, StudentProfile } from '../../types/advising';

const ACADEMIC_STATUS_STYLES: Record<AcademicStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800 ring-green-200' },
  PROBATION: { label: 'Academic probation', className: 'bg-orange-100 text-orange-800 ring-orange-200' },
  SUSPENDED: { label: 'Suspended', className: 'bg-red-100 text-red-800 ring-red-200' },
  GRADUATED: { label: 'Graduated', className: 'bg-blue-100 text-blue-800 ring-blue-200' },
  WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  LEAVE_OF_ABSENCE: { label: 'Leave of absence', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
};

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#98a2b3]" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#98a2b3]">{label}</p>
        <p className="truncate text-[13px] font-medium text-[#151c27]">{value}</p>
      </div>
    </div>
  );
}

export function StudentProfileCard({ profile }: { profile: StudentProfile }) {
  const status = ACADEMIC_STATUS_STYLES[profile.academicStatus] ?? ACADEMIC_STATUS_STYLES.ACTIVE;

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#151c27]">Academic Profile</h2>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={Hash} label="Student ID" value={profile.studentCode} />
        <Stat
          icon={GraduationCap}
          label="Major"
          value={
            profile.majorName
              ? `${profile.majorCode} · ${profile.majorName}`
              : (profile.majorCode ?? 'Not updated')
          }
        />
        <Stat
          icon={Layers}
          label="Cohort"
          value={profile.curriculumVersion ?? 'Not updated'}
        />
        <Stat icon={BookOpen} label="Current Semester" value={`Semester ${profile.currentSemester}`} />
        <Stat
          icon={Star}
          label="GPA"
          value={profile.currentGpa !== null ? `${profile.currentGpa.toFixed(2)}/10` : 'No grades yet'}
        />
        <Stat
          icon={Wallet}
          label="Credits Earned"
          value={`${profile.totalCreditsEarned} credits`}
        />
      </div>
    </section>
  );
}
