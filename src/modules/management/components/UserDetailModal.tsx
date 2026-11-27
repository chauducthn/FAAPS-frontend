// User detail modal — compact, scannable read-only view of one FAAPS account.
import { ArrowCounterClockwise, GraduationCap, User as UserRound, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { Modal } from '../../../shared/components/ui/Modal';
import { ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
import { StatusBadge } from './StatusBadge';
import { UserInitials } from './UserInitials';
import { useAdminUser } from '../hooks/queries/useAdminUsers';
import { UserDetailSkeleton } from './UserDetailBits';
import { UserDetailBody } from './UserDetailBody';

const CHIP = 'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-4';

export function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { data: user, isLoading, isError, refetch } = useAdminUser(userId);
  const isStudent = user?.role === 'STUDENT';

  return (
    <Modal open={!!userId} onClose={onClose} title="User details" className="max-w-[34rem]">
      {isLoading ? (
        <UserDetailSkeleton onClose={onClose} />
      ) : isError || !user ? (
        <>
          <ModalHeader title="User details" icon={<UserRound />} tone="neutral" onClose={onClose} />
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="flex size-10 items-center justify-center rounded-md bg-red-50 text-red-600">
              <WarningCircle className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-primary">Could not load this account</p>
              <p className="mt-1 text-xs text-ink-muted">Check your connection and try again.</p>
            </div>
          </div>
          <ModalFooter>
            <button type="button" onClick={onClose} className={modalButtonClass('secondary')}>
              Close
            </button>
            <button type="button" onClick={() => refetch()} className={modalButtonClass('primary')}>
              <ArrowCounterClockwise className="size-4" /> Retry
            </button>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalHeader
            title={<span title={user.fullName}>{user.fullName}</span>}
            description={user.email}
            media={<UserInitials name={user.fullName} avatarUrl={user.avatarUrl} className="size-11 text-sm" />}
            onClose={onClose}
          >
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={cn(CHIP, 'bg-line-soft font-mono text-ink-secondary')}>{user.userId}</span>
              <span className={cn(CHIP, isStudent ? 'bg-brand-soft text-brand-ink' : 'bg-line-soft text-ink-secondary')}>
                {isStudent ? <GraduationCap className="size-3" /> : <UserRound className="size-3" />}
                {isStudent ? 'Student' : 'Advisor'}
              </span>
              <StatusBadge status={user.status} />
            </div>
          </ModalHeader>

          <UserDetailBody user={user} isStudent={isStudent} />

          <ModalFooter>
            <button type="button" onClick={onClose} className={modalButtonClass('secondary')}>
              Close
            </button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
