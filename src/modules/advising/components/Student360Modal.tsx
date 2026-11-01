// src/pages/advising/Student360Modal.tsx
// Modal "Student 360 Profile" — 5 tabs: Overview | Transcript | Advising History | Appointments | Graduation.
// Lịch sử tư vấn và lịch hẹn lấy từ API thật của advisor (lọc theo sinh viên),
// graduation suy ra từ progress + transcript.

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  History,
  LayoutGrid,
  Mail,
  MessageSquareWarning,
  Phone,
  ScrollText,
  UserRound,
} from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import type { AdvisorStudentDetail } from '../services/advisorService';
import { advisorService } from '../services/advisorService';
import { appointmentService } from '../../appointment/services/appointmentService';
import { RequestStatusBadge } from './RequestStatusBadge';
import { BookingStatusBadge } from '../../appointment/components/AppointmentBits';
import { formatIsoDay, formatIsoTime } from '../../../shared/lib/appointmentDate';

type TabKey = 'overview' | 'transcript' | 'history' | 'appointments' | 'graduation';

const TABS: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'transcript', label: 'Transcript', icon: ScrollText },
  { key: 'history', label: 'Advising History', icon: History },
  { key: 'appointments', label: 'Appointments', icon: CalendarDays },
  { key: 'graduation', label: 'Graduation & OJT', icon: GraduationCap },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 ring-green-200',
  PROBATION: 'bg-orange-100 text-orange-800 ring-orange-200',
  SUSPENDED: 'bg-red-100 text-red-800 ring-red-200',
  GRADUATED: 'bg-blue-100 text-blue-800 ring-blue-200',
  WITHDRAWN: 'bg-gray-100 text-gray-700 ring-gray-200',
  LEAVE_OF_ABSENCE: 'bg-gray-100 text-gray-700 ring-gray-200',
};

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f1f4f9]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#F26F21] to-[#ff9a4d] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

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

  const graduation = useMemo(() => {
    if (!detail) return null;
    const { progress, transcript } = detail;
    const ojtRow = transcript.find((t) => t.courseCode === 'OJT401');
    const ojtStatus =
      !ojtRow || ojtRow.status === 'NOT_STARTED'
        ? { label: 'Not started', tone: 'todo' as const }
        : ojtRow.status === 'IN_PROGRESS'
          ? { label: 'In progress', tone: 'doing' as const }
          : { label: 'Completed', tone: 'done' as const };
    const gpa = progress.currentGpa ?? 0;
    const conditions = [
      {
        label: 'Accumulate 132 credits',
        done: progress.earnedCredits >= progress.requiredCredits,
        hint: `${progress.earnedCredits}/${progress.requiredCredits} credits`,
      },
      {
        label: 'Maintain GPA ≥ 5.00 / 10',
        done: gpa >= 5,
        hint: `Current ${gpa.toFixed(2)}`,
      },
      {
        label: 'Complete On-Job Training (OJT401)',
        done: ojtStatus.tone === 'done',
        hint: ojtStatus.label,
      },
      {
        label: 'No unresolved probation',
        done: detail.profile.academicStatus !== 'PROBATION' && detail.profile.academicStatus !== 'SUSPENDED',
        hint: detail.profile.academicStatus ?? '—',
      },
    ];
    return { ojtRow, ojtStatus, conditions };
  }, [detail]);

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
                <span
                  className={cn(
                    'inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold ring-1 ring-inset',
                    STATUS_STYLES[detail.profile.academicStatus ?? ''] ?? 'bg-white text-gray-700 ring-gray-200',
                  )}
                >
                  {detail.profile.academicStatus ?? '—'}
                </span>
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
                    'flex shrink-0 items-center gap-1.5 rounded-t-lg px-3.5 py-2.5 text-[13px] font-semibold transition-colors',
                    active
                      ? 'border-b-2 border-[#F26F21] text-[#F26F21]'
                      : 'border-b-2 border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800',
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
            {tab === 'overview' && (
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
                      <ProgressBar
                        value={detail.progress.earnedCredits}
                        max={detail.progress.requiredCredits}
                      />
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
            )}

            {tab === 'transcript' && (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                {detail.transcript.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">No transcript records.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Semester</th>
                        <th className="px-4 py-3 text-center">Score</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.transcript.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <strong className="text-[#151c27]">{row.courseCode}</strong>
                            <span className="block text-xs text-slate-500">{row.courseName}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{row.semesterCode}</td>
                          <td className="px-4 py-3 text-center font-semibold">
                            {row.finalScore ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-center text-[13px] text-slate-600">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === 'history' && (
              <div className="space-y-3">
                {requestsQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4">
                        <div className="h-5 w-24 animate-pulse rounded-lg bg-slate-100" />
                        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                        <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : requestsQuery.isError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
                    Could not load advising history.{' '}
                    <button
                      type="button"
                      onClick={() => requestsQuery.refetch()}
                      className="font-bold underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : history.length === 0 ? (
                  <p className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
                    No advising requests from this student yet.
                  </p>
                ) : (
                  history.map((r) => (
                    <article key={r.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <RequestStatusBadge status={r.status} />
                        <span className="text-xs text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-[#151c27]">{r.title}</h4>
                      <p className="mt-1 line-clamp-2 text-[13px] text-slate-600">{r.description}</p>
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Type: <span className="text-slate-700">{r.requestType}</span>
                      </p>
                      {r.resolutionSummary && (
                        <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-[13px] text-green-800">
                          {r.resolutionSummary}
                        </p>
                      )}
                    </article>
                  ))
                )}
              </div>
            )}

            {tab === 'appointments' && (
              <div className="space-y-3">
                {appointmentsQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4">
                        <div className="h-5 w-28 animate-pulse rounded-lg bg-slate-100" />
                        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                        <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : appointmentsQuery.isError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
                    Could not load appointments.{' '}
                    <button
                      type="button"
                      onClick={() => appointmentsQuery.refetch()}
                      className="font-bold underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-8 text-center">
                    <span className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <CalendarDays className="size-5" aria-hidden />
                    </span>
                    <p className="text-sm font-semibold text-[#151c27]">No appointments yet</p>
                    <p className="text-[13px] text-slate-500">
                      Booked sessions with this student will appear here.
                    </p>
                  </div>
                ) : (
                  appointments.map((a) => (
                    <article key={a.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <BookingStatusBadge status={a.status} />
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3.5" aria-hidden />
                            {formatIsoDay(a.startTime)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="size-3.5" aria-hidden />
                            {formatIsoTime(a.startTime)} – {formatIsoTime(a.endTime)}
                          </span>
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-[#151c27]">{a.reason}</h4>
                      {a.decisionNote && (
                        <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-[#fff7f0] px-3 py-2 text-[13px] leading-relaxed text-[#9a4a12]">
                          <MessageSquareWarning className="mt-0.5 size-4 shrink-0" aria-hidden />
                          {a.decisionNote}
                        </p>
                      )}
                      {a.consultationSummary && (
                        <p className="mt-2 rounded-xl bg-blue-50/60 px-3 py-2 text-[13px] leading-relaxed text-slate-700">
                          {a.consultationSummary}
                        </p>
                      )}
                    </article>
                  ))
                )}
              </div>
            )}

            {tab === 'graduation' && graduation && (
              <div className="space-y-4">
                <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Graduation check is derived from the student&apos;s progress and transcript — the
                  backend has no dedicated graduation-check endpoint yet.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
                      <GraduationCap className="size-4 text-[#F26F21]" aria-hidden /> Credit progress
                    </h3>
                    <p className="mt-2 text-2xl font-bold">
                      {detail.progress.earnedCredits}
                      <span className="text-sm font-medium text-slate-400">
                        /{detail.progress.requiredCredits}
                      </span>
                    </p>
                    <ProgressBar value={detail.progress.earnedCredits} max={detail.progress.requiredCredits} />
                    <p className="mt-2 text-xs text-slate-500">
                      Remaining: {Math.max(0, detail.progress.requiredCredits - detail.progress.earnedCredits)} credits
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
                      <Briefcase className="size-4 text-[#F26F21]" aria-hidden /> OJT status
                    </h3>
                    <p className="mt-2 text-2xl font-bold">{graduation.ojtStatus.label}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {graduation.ojtRow
                        ? `${graduation.ojtRow.courseCode} · ${graduation.ojtRow.courseName} · ${graduation.ojtRow.semesterCode}`
                        : 'No OJT course found in transcript'}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <h3 className="text-sm font-bold text-[#151c27]">Graduation checklist</h3>
                  <ul className="mt-3 space-y-2.5">
                    {graduation.conditions.map((c) => (
                      <li key={c.label} className="flex items-start gap-2.5 text-sm">
                        {c.done ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                        ) : (
                          <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#F26F21]" aria-hidden />
                        )}
                        <div>
                          <p className={cn('font-medium', c.done ? 'text-[#151c27]' : 'text-slate-600')}>
                            {c.label}
                          </p>
                          <p className="text-xs text-slate-400">{c.hint}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
