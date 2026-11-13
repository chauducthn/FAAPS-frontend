// The three-dot menu of one account row.
//
// It lists what the admin can do with this single account: open the details,
// jump to the advisor assignments, change the role, reset the password or
// suspend the account.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import type { AdminUserSummary } from '../types/admin';

type Props = {
  user: AdminUserSummary;
  isSelf: boolean;
  onView: () => void;
  onToggle: () => void;
  onRole: () => void;
  onResetPassword: () => void;
  onAssignments?: () => void;
};

export function UserRowMenu({
  user,
  isSelf,
  onView,
  onToggle,
  onRole,
  onResetPassword,
  onAssignments,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (open) return setOpen(false);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const right = window.innerWidth - rect.right;
    setPos(
      window.innerHeight - rect.bottom < 180
        ? { bottom: window.innerHeight - rect.top + 4, right }
        : { top: rect.bottom + 4, right },
    );
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const suspended = user.status === 'SUSPENDED';
  const item = 'block w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50';
  const action = (handler: () => void) => {
    setOpen(false);
    handler();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${user.fullName}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggle}
        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, right: pos.right }}
            className="z-[60] w-52 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-xl"
          >
            <button role="menuitem" className={cn(item, 'text-gray-700')} onClick={() => action(onView)}>
              View details
            </button>
            {onAssignments && (
              <button role="menuitem" className={cn(item, 'text-gray-700')} onClick={() => action(onAssignments)}>
                View assignments
              </button>
            )}
            <button role="menuitem" className={cn(item, 'text-gray-700')} onClick={() => action(onRole)}>
              Set role: {user.role === 'STUDENT' ? 'Advisor' : 'Student'}
            </button>
            <button role="menuitem" className={cn(item, 'text-gray-700')} onClick={() => action(onResetPassword)}>
              Reset password
            </button>
            {(user.status === 'ACTIVE' || suspended) && (
              <button
                role="menuitem"
                disabled={isSelf && !suspended}
                title={isSelf && !suspended ? 'You cannot suspend your own account' : undefined}
                className={cn(item, suspended ? 'text-[#047857]' : 'text-[#b91c1c]', 'disabled:opacity-40')}
                onClick={() => action(onToggle)}
              >
                {suspended ? 'Activate account' : 'Suspend account'}
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
