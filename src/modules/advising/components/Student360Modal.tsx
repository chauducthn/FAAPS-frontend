// src/pages/advising/Student360Modal.tsx
// Modal "Student 360 Profile" — 5 tabs: Overview | Transcript | Advising History | Appointments | Graduation.
// Lịch sử tư vấn và lịch hẹn lấy từ API thật của advisor (lọc theo sinh viên),
// graduation suy ra từ progress + transcript.

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, GraduationCap, History, LayoutGrid, ScrollText } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import type { AdvisorStudentDetail } from '../services/advisorService';
import { advisorService } from '../services/advisorService';
import { appointmentService } from '../../appointment/services/appointmentService';
import StudentGraduationTab, { buildGraduationSummary } from './student360/StudentGraduationTab';
import StudentHistoryTab, { StudentAppointmentsTab } from './student360/StudentHistoryTab';
import StudentOverviewTab from './student360/StudentOverviewTab';
import StudentTranscriptTab from './student360/StudentTranscriptTab';
import { AcademicStatusPill, initialsOf } from './student360/shared';

type TabKey = 'overview' | 'transcript' | 'history' | 'appointments' | 'graduation';

const TABS: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'transcript', label: 'Transcript', icon: ScrollText },
  { key: 'history', label: 'Advising History', icon: History },
  { key: 'appointments', label: 'Appointments', icon: CalendarDays },
  { key: 'graduation', label: 'Graduation & OJT', icon: GraduationCap },
];

export function Student360Modal({
  detail,
  onClose,
}: {
  detail: AdvisorStudentDetail | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabKey>('overview');
  const studentId = detail?.profile.id ?? '';

  // Lịch sử tư vấn: API advisor trả về toàn bộ request — lọc theo sinh viên đang xem.
  const requestsQuery = useQuery({
    queryKey: ['advisor', 'advising-requests', { studentId }],
    queryFn: () => advisorService.getAdvisingRequests(),
    enabled: Boolean(studentId),
    staleTime: 1000 * 30,
  });
  // Lịch hẹn: GET /advisor/appointments trả toàn bộ lịch của advisor — lọc theo sinh viên.
  const appointmentsQuery = useQuery({
    queryKey: ['advisor', 'appointments', 'all', studentId],
    queryFn: () => appointmentService.getAllAdvisorAppointments(),
    enabled: Boolean(studentId),
    staleTime: 1000 * 30,
  });

  const history = useMemo(() => {
    if (!studentId) return [];
    return (requestsQuery.data ?? []).filter((r) => r.studentId === studentId);
  }, [requestsQuery.data, studentId]);

  const appointments = useMemo(() => {
    if (!studentId) return [];
    return (appointmentsQuery.data ?? [])
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => b.startTime.localeCompare(a.startTime));
  }, [appointmentsQuery.data, studentId]);

  const graduation = useMemo(() => (detail ? buildGraduationSummary(detail) : null), [detail]);

  return (
    <Modal open={detail !== null} onClose={onClose} title="Student 360 Profile" className="max-w-4xl">
      {!detail ? null : (
        <div className="flex max-h-[90vh] flex-col overflow-hidden">
          {/* Header — cam FPT */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#F26F21] to-[#ff8f3f] px-6 pb-5 pt-6 text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-white/10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 right-24 size-32 rounded-full bg-white/10"
            />
            <div className="relative flex flex-wrap items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white/95 text-lg font-bold text-[#F26F21] shadow">
                {initialsOf(detail.profile.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
                  Student 360 Profile · {detail.profile.studentCode ?? '—'}
                </p>
                <h2 className="mt-0.5 truncate text-xl font-bold">{detail.profile.fullName}</h2>
                <p className="mt-0.5 text-[13px] text-white/90">
                  {detail.profile.majorName ?? '—'} · {detail.profile.cohort ?? '—'} · Semester{' '}
                  {detail.profile.currentSemester ?? '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AcademicStatusPill status={detail.profile.academicStatus} />
                <span className="rounded-full bg-[#151c27]/85 px-3 py-1 text-[11px] font-bold">
                  GPA {detail.progress.currentGpa?.toFixed(2) ?? '—'}
                </span>
              </div>
            </div>
            {/* Quick stats */}
            <div className="relative mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Credits', value: `${detail.progress.earnedCredits}/${detail.progress.requiredCredits}` },
                {
                  label: 'Courses done',
                  value: `${detail.progress.completedCourses}/${detail.progress.curriculumCourses}`,
                },
                { label: 'Requests', value: String(history.length) },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm">
                  <p className="text-[11px] font-medium text-white/80">{s.label}</p>
                  <p className="text-base font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-white px-4 pt-2">
            {TABS.map((t) => {
              const active = tab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  aria-pressed={active}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition-colors',
                    active
                      ? 'border-[#F26F21] text-[#F26F21]'
                      : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {t.label}
                  {t.key === 'history' && history.length > 0 && (
                    <span className="ml-1 rounded-full bg-[#F26F21]/10 px-1.5 py-0.5 text-[11px] font-bold text-[#F26F21]">
                      {history.length}
                    </span>
                  )}
                  {t.key === 'appointments' && appointments.length > 0 && (
                    <span className="ml-1 rounded-full bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700">
                      {appointments.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-auto bg-[#fafbfd] p-5">
            {tab === 'overview' && <StudentOverviewTab detail={detail} />}

            {tab === 'transcript' && <StudentTranscriptTab transcript={detail.transcript} />}

            {tab === 'history' && (
              <StudentHistoryTab
                history={history}
                isLoading={requestsQuery.isLoading}
                isError={requestsQuery.isError}
                onRetry={() => void requestsQuery.refetch()}
              />
            )}

            {tab === 'appointments' && (
              <StudentAppointmentsTab
                appointments={appointments}
                isLoading={appointmentsQuery.isLoading}
                isError={appointmentsQuery.isError}
                onRetry={() => void appointmentsQuery.refetch()}
              />
            )}

            {tab === 'graduation' && <StudentGraduationTab detail={detail} graduation={graduation} />}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-slate-100 bg-white px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
