// The three-dot action menu of one account row.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowsLeftRight as ArrowLeftRight,
  CheckCircle as CheckCircle2,
  Eye,
  Key as KeyRound,
  DotsThree as MoreHorizontal,
  ShieldSlash as ShieldOff,
  Trash as Trash2,
} from '@phosphor-icons/react';
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
  onDelete?: () => void;
};

export function UserRowMenu({
  user,
  isSelf,
  onView,
  onToggle,
  onRole,
  onResetPassword,
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
    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors ' +
    'hover:bg-surface-hover';
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
        className={
          'inline-flex size-8 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-line-soft ' +
          'hover:text-ink-primary aria-expanded:bg-line-soft aria-expanded:text-ink-primary'
        }
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
            className="z-[60] w-52 rounded-lg border border-line bg-white p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]"
          >
            <button role="menuitem" className={cn(item, 'text-ink-secondary')} onClick={() => action(onView)}>
              <Eye className="size-4 text-ink-subtle" aria-hidden />
              View details
            </button>
            <button role="menuitem" className={cn(item, 'text-ink-secondary')} onClick={() => action(onRole)}>
              <ArrowLeftRight className="size-4 text-ink-subtle" aria-hidden />
              Set role
            </button>
            {canReset ? (
              <button role="menuitem" className={cn(item, 'text-ink-secondary')} onClick={() => action(onResetPassword)}>
                <KeyRound className="size-4 text-ink-subtle" aria-hidden />
                Reset password
              </button>
            ) : (
              <button
                role="menuitem"
                disabled
                title={NO_PASSWORD_REASON}
                aria-label={`Reset password (unavailable: ${NO_PASSWORD_REASON})`}
                className={cn(item, 'cursor-not-allowed text-ink-subtle hover:bg-transparent')}
              >
                <KeyRound className="size-4 text-ink-subtle" aria-hidden />
                Reset password
              </button>
            )}
            {(user.status === 'ACTIVE' || suspended) && (
              <>
                <div className="-mx-1 my-1 border-t border-line" role="separator" />
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
