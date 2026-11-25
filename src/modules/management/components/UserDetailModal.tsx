// User detail modal — the read-only view of one FAAPS account.
import { useState } from 'react';
import { CircleAlert, GraduationCap, LayoutGrid, ShieldCheck, UserRound, X } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { StatusBadge } from './StatusBadge';
import { useAdminUser } from '../hooks/queries/useAdminUsers';
import { cn } from '@/shared/lib/utils';
import { UserDetailSkeleton } from './UserDetailBits';
import { UserDetailBody, type UserDetailTabKey } from './UserDetailBody';

const TABS: { key: UserDetailTabKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'profile', label: 'Personal', icon: LayoutGrid },
  { key: 'academic', label: 'Academic', icon: GraduationCap },
  { key: 'status', label: 'Status', icon: ShieldCheck },
];

export function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<UserDetailTabKey>('profile');
  const { data: user, isLoading, isError, refetch } = useAdminUser(userId);
  const isStudent = user?.role === 'STUDENT';

  return (
    <Modal open={!!userId} onClose={onClose} title="User details" className="max-w-3xl">
      {isLoading ? (
        <UserDetailSkeleton onClose={onClose} />
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
          <div className="overflow-hidden rounded-t-2xl">
            <div className="h-1.5 bg-[var(--brand)]" />
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-[var(--brand-soft)] px-6 py-5">
              <div className="flex min-w-0 items-start gap-3.5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
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

          <UserDetailBody tab={tab} user={user} isStudent={isStudent} />

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
