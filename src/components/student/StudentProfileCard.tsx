// src/components/student/StudentProfileCard.tsx
// Card hồ sơ học tập của sinh viên hiện tại.

import { BookOpen, GraduationCap, Hash, Layers, Star, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AcademicStatus, StudentProfile } from '../../types/advising';

const ACADEMIC_STATUS_STYLES: Record<AcademicStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Đang học', className: 'bg-green-100 text-green-800 ring-green-200' },
  PROBATION: { label: 'Cảnh cáo học tập', className: 'bg-orange-100 text-orange-800 ring-orange-200' },
  SUSPENDED: { label: 'Đình chỉ', className: 'bg-red-100 text-red-800 ring-red-200' },
  GRADUATED: { label: 'Đã tốt nghiệp', className: 'bg-blue-100 text-blue-800 ring-blue-200' },
  WITHDRAWN: { label: 'Đã rút học', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  LEAVE_OF_ABSENCE: { label: 'Nghỉ học tạm thời', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
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
        <h2 className="text-sm font-semibold text-[#151c27]">Hồ sơ học tập</h2>
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
        <Stat icon={Hash} label="Mã sinh viên" value={profile.studentCode} />
        <Stat
          icon={GraduationCap}
          label="Chuyên ngành"
          value={
            profile.majorName
              ? `${profile.majorCode} · ${profile.majorName}`
              : (profile.majorCode ?? 'Chưa cập nhật')
          }
        />
        <Stat
          icon={Layers}
          label="Cohort / Khóa"
          value={profile.curriculumVersion ?? 'Chưa cập nhật'}
        />
        <Stat icon={BookOpen} label="Học kỳ hiện tại" value={`Học kỳ ${profile.currentSemester}`} />
        <Stat
          icon={Star}
          label="Điểm trung bình"
          value={profile.currentGpa !== null ? `${profile.currentGpa.toFixed(2)}/10` : 'Chưa có điểm'}
        />
        <Stat
          icon={Wallet}
          label="Tín chỉ đã tích lũy"
          value={`${profile.totalCreditsEarned} tín chỉ`}
        />
      </div>
    </section>
  );
}
