// User detail modal — the read-only view of one FAAPS account.
//
// Synced with the rest of the management console (CourseDetailModal,
// CurriculumHeader): a gradient header bar with the identity, a tab strip,
// and one bordered card per group of facts.
//
// The three tabs split the record along the questions the admin actually has:
// who is this person, what is their academic / advisory work, and where does
// the account stand.

import { useState } from 'react';
import {
  BookOpenCheck,
  CalendarClock,
  CircleAlert,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { StatusBadge } from './StatusBadge';
import { useAdminUser } from '../hooks/queries/useAdminUsers';
import { cn } from '@/shared/lib/utils';

const formatDate = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    : '—';

type TabKey = 'profile' | 'academic' | 'status';

const TABS: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'profile', label: 'Personal', icon: LayoutGrid },
  { key: 'academic', label: 'Academic', icon: GraduationCap },
  { key: 'status', label: 'Status', icon: ShieldCheck },
];

export function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<TabKey>('profile');
  const { data: user, isLoading, isError, refetch } = useAdminUser(userId);

  const isStudent = user?.role === 'STUDENT';

  return (
    <Modal open={!!userId} onClose={onClose} title="User details" className="max-w-3xl">
      {isLoading ? (
        <DetailSkeleton onClose={onClose} />
      ) : isError || !user ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <CircleAlert className="size-6" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900">Could not load this account</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
              The record failed to load. Check your connection, then try again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="flex max-h-[90vh] flex-col overflow-hidden">
          {/* Header */}
          <div className="overflow-hidden rounded-t-2xl">
            <div className="h-1.5 bg-gradient-to-r from-[#F26F21] via-[#f97316] to-[#C2410C]" />
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] to-white px-6 py-5">
              <div className="flex min-w-0 items-start gap-3.5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
                  {isStudent ? <GraduationCap className="size-6" /> : <UserRound className="size-6" />}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-gray-900 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                      {user.userId}
                    </span>
                    <StatusBadge status={user.status} />
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset',
                        isStudent
                          ? 'bg-orange-100 text-[#9a3412] ring-orange-200'
                          : 'bg-indigo-100 text-indigo-800 ring-indigo-200',
                      )}
                    >
                      {isStudent ? <GraduationCap className="size-3" aria-hidden /> : <UserRound className="size-3" aria-hidden />}
                      {isStudent ? 'Student' : 'Advisor'}
                    </span>
                  </div>
                  <h2 className="mt-1.5 truncate text-base font-extrabold tracking-tight text-gray-900" title={user.fullName}>
                    {user.fullName}
                  </h2>
                  <p className="mt-0.5 truncate text-xs font-medium text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-4 pt-2">
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
                      ? 'border-[#F26F21] text-[#C2410C]'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fafbfd] p-5 text-[13px]">
            {tab === 'profile' && (
              <Panel icon={<LayoutGrid className="size-4" />} title="Personal information">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReadField icon={<UserRound className="size-3.5" />} label="Full name" value={user.fullName} />
                  <ReadField icon={<Mail className="size-3.5" />} label="Email" value={user.email} />
                  <ReadField icon={<ShieldCheck className="size-3.5" />} label="Identifier" value={user.userId} mono />
                </div>
              </Panel>
            )}

            {tab === 'academic' && (
              isStudent ? (
                <Panel icon={<GraduationCap className="size-4" />} title="Academic record">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReadField icon={<BookOpenCheck className="size-3.5" />} label="Major" value={user.majorName} />
                    <ReadField icon={<BookOpenCheck className="size-3.5" />} label="Curriculum" value={user.curriculumCode} mono />
                    <ReadField icon={<GraduationCap className="size-3.5" />} label="Current semester" value={user.currentSemester} />
                    <ReadField icon={<ShieldCheck className="size-3.5" />} label="Academic status" value={user.academicStatus} />
                  </div>
                </Panel>
              ) : (
                <Panel icon={<UserRound className="size-4" />} title="Advisory work">
                  <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-xs text-gray-500">
                    No academic record for an advisor account.
                  </p>
                </Panel>
              )
            )}

            {tab === 'status' && (
              <>
                <Panel icon={<ShieldCheck className="size-4" />} title="Account status">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReadField icon={<ShieldCheck className="size-3.5" />} label="Status" value={user.status} />
                    <ReadField icon={<GraduationCap className="size-3.5" />} label="Academic status" value={user.academicStatus} />
                  </div>
                </Panel>
                <Panel icon={<CalendarClock className="size-4" />} title="Timeline">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReadField icon={<CalendarClock className="size-3.5" />} label="Created" value={formatDate(user.createdAt)} />
                    <ReadField icon={<CalendarClock className="size-3.5" />} label="Last updated" value={formatDate(user.updatedAt)} />
                  </div>
                </Panel>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** One bordered group of facts, with the same header rule the course modal uses. */
function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100">
      <header className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
        <span className="text-[#F26F21]">{icon}</span>
        <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">{title}</h3>
      </header>
      <div className="bg-white p-4">{children}</div>
    </section>
  );
}

/** A read-only fact: a quiet label over a clear value. */
function ReadField({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-2.5">
      <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
        <span className="text-gray-400">{icon}</span>
        {label}
      </p>
      {value === null || value === undefined || value === '' ? (
        <p className="mt-1 text-[13px] font-semibold italic text-gray-500">Not recorded</p>
      ) : (
        <p className={cn('mt-1 truncate text-[13px] font-bold text-gray-900', mono && 'font-mono')}>{value}</p>
      )}
    </div>
  );
}

function DetailSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div aria-label="Loading user detail">
      <div className="h-1.5 animate-pulse bg-orange-100" />
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
        <div className="flex items-start gap-3.5">
          <div className="size-12 animate-pulse rounded-2xl bg-orange-100" />
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-48 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-3 bg-[#fafbfd] p-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
        <p className="flex items-center justify-center gap-2 text-center text-[11px] font-medium text-gray-400">
          <Loader2 className="size-3.5 animate-spin" /> Loading account…
        </p>
      </div>
    </div>
  );
}
