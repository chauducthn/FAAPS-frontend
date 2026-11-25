// User detail modal — compact, scannable read-only view of one FAAPS account.
import { CircleAlert, GraduationCap, RotateCcw, UserRound, X } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { StatusBadge } from './StatusBadge';
import { useAdminUser } from '../hooks/queries/useAdminUsers';
import { cn } from '@/shared/lib/utils';
import { UserDetailSkeleton } from './UserDetailBits';
import { UserDetailBody } from './UserDetailBody';

export function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { data: user, isLoading, isError, refetch } = useAdminUser(userId);
  const isStudent = user?.role === 'STUDENT';

  return (
    <Modal open={!!userId} onClose={onClose} title="User details" className="max-w-lg">
      {isLoading ? (
        <UserDetailSkeleton onClose={onClose} />
      ) : isError || !user ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <CircleAlert className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Could not load this account</p>
            <p className="mt-1 text-xs text-gray-500">Check your connection and try again.</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 text-xs font-semibold text-white hover:bg-gray-700"
            >
              <RotateCcw className="size-3.5" /> Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
            <div className="flex min-w-0 items-start gap-3.5">
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
                  isStudent
                    ? 'bg-orange-50 text-[#F26F21] ring-orange-200/70'
                    : 'bg-indigo-50 text-indigo-600 ring-indigo-200/70',
                )}
              >
                {isStudent ? <GraduationCap className="size-5" /> : <UserRound className="size-5" />}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold tracking-tight text-gray-900" title={user.fullName}>
                  {user.fullName}
                </h2>
                <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-700">
                    {user.userId}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                      isStudent
                        ? 'bg-orange-50 text-[#9a3412] ring-orange-200/80'
                        : 'bg-indigo-50 text-indigo-700 ring-indigo-200/80',
                    )}
                  >
                    {isStudent ? 'Student' : 'Advisor'}
                  </span>
                  <StatusBadge status={user.status} />
                </div>
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

          <UserDetailBody user={user} isStudent={isStudent} />

          <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/70 px-6 py-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
