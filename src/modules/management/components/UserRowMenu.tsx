// The three-dot action menu of one account row.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeftRight,
  Briefcase,
  CheckCircle2,
  Eye,
  KeyRound,
  MoreHorizontal,
  ShieldOff,
  Trash2,
} from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { canResetPassword, NO_PASSWORD_REASON } from '../utils/passwordReset';
import type { AdminUserSummary } from '../types/admin';

/** Why a Google-only account cannot be reset. */
export { NO_PASSWORD_REASON };

type Props = {
  user: AdminUserSummary;
  isSelf: boolean;
  onView: () => void;
  onToggle: () => void;
  onRole: () => void;
  onResetPassword: () => void;
  onAssignments?: () => void;
  onDelete?: () => void;
};

export function UserRowMenu({
  user,
  isSelf,
  onView,
  onToggle,
  onRole,
  onResetPassword,
  onAssignments,
  onDelete,
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
      window.innerHeight - rect.bottom < 210
        ? { bottom: window.innerHeight - rect.top + 6, right }
        : { top: rect.bottom + 6, right },
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
  const canReset = canResetPassword(user);
  const item =
    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors hover:bg-gray-100/80';
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
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
            className="z-[60] w-52 rounded-xl border border-gray-200/80 bg-white p-1.5 shadow-lg ring-1 ring-black/5"
          >
            <button role="menuitem" className={cn(item, 'text-gray-700')} onClick={() => action(onView)}>
              <Eye className="size-4 text-gray-400" aria-hidden />
              View details
            </button>
            {onAssignments && (
              <button role="menuitem" className={cn(item, 'text-gray-700')} onClick={() => action(onAssignments)}>
                <Briefcase className="size-4 text-gray-400" aria-hidden />
                View assignments
              </button>
            )}
            <button role="menuitem" className={cn(item, 'text-gray-700')} onClick={() => action(onRole)}>
              <ArrowLeftRight className="size-4 text-gray-400" aria-hidden />
              Set role
            </button>
            {canReset ? (
              <button role="menuitem" className={cn(item, 'text-gray-700')} onClick={() => action(onResetPassword)}>
                <KeyRound className="size-4 text-gray-400" aria-hidden />
                Reset password
              </button>
            ) : (
              <button
                role="menuitem"
                disabled
                title={NO_PASSWORD_REASON}
                aria-label={`Reset password (unavailable: ${NO_PASSWORD_REASON})`}
                className={cn(item, 'cursor-not-allowed text-gray-400 hover:bg-transparent')}
              >
                <KeyRound className="size-4 text-gray-300" aria-hidden />
                Reset password
              </button>
            )}
            {(user.status === 'ACTIVE' || suspended) && (
              <>
                <div className="my-1 border-t border-gray-100" role="separator" />
                <button
                  role="menuitem"
                  disabled={isSelf && !suspended}
                  title={isSelf && !suspended ? 'You cannot suspend your own account' : undefined}
                  className={cn(
                    item,
                    suspended
                      ? 'text-emerald-700 hover:bg-emerald-50'
                      : 'text-red-600 hover:bg-red-50',
                    'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
                  )}
                  onClick={() => action(onToggle)}
                >
                  {suspended ? (
                    <CheckCircle2 className="size-4" aria-hidden />
                  ) : (
                    <ShieldOff className="size-4" aria-hidden />
                  )}
                  {suspended ? 'Activate account' : 'Suspend account'}
                </button>
              </>
            )}
            {onDelete && (
              <button
                role="menuitem"
                disabled={isSelf}
                title={isSelf ? 'You cannot delete your own account' : undefined}
                className={cn(
                  item,
                  'text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
                )}
                onClick={() => action(onDelete)}
              >
                <Trash2 className="size-4" aria-hidden />
                Delete account
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
