import { cn } from '@/lib/utils';
import type { AdminUserStatus } from '../../types/admin';

const STYLES: Record<AdminUserStatus, string> = {
  ACTIVE: 'bg-[#ecfdf5] text-[#047857]',
  SUSPENDED: 'bg-[#fef2f2] text-[#b91c1c]',
  LOCKED: 'bg-[#fef2f2] text-[#b91c1c]',
  INACTIVE: 'bg-gray-100 text-[#555f6f]',
};

export function StatusBadge({ status }: { status: AdminUserStatus }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em]', STYLES[status])}>
      {status}
    </span>
  );
}
