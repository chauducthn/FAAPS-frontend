import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import type { AdminUserSummary } from '../types/admin';

type Props = { user: AdminUserSummary; isSelf: boolean; onView: () => void; onToggle: () => void;
  onAssignments?: () => void; onRole: () => void };

export function UserRowMenu({ user, isSelf, onView, onToggle, onAssignments, onRole }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggle = () => {
    if (open) return setOpen(false);
    const rect = buttonRef.current?.getBoundingClientRect(); if (!rect) return;
    const right = window.innerWidth - rect.right;
    setPos(window.innerHeight - rect.bottom < 180 ? { bottom: window.innerHeight - rect.top + 4, right } : { top: rect.bottom + 4, right });
    setOpen(true);
  };
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => { const target = e.target as Node; if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close(); };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close); window.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', close); window.removeEventListener('scroll', close, true); };
  }, [open]);
  const suspended = user.status === 'SUSPENDED';
  const item = 'block w-full px-3 py-2 text-left text-[13px] font-medium hover:bg-gray-50';
  const action = (handler: () => void) => { setOpen(false); handler(); };
  return <><button ref={buttonRef} type="button" aria-label={`Actions for ${user.fullName}`} aria-expanded={open} aria-haspopup="menu" onClick={toggle} className="rounded-md p-1.5 text-[#555f6f] hover:bg-gray-100"><MoreHorizontal className="size-5" /></button>
    {open && pos && createPortal(<div ref={menuRef} role="menu" style={{ position: 'fixed', ...pos }} className="z-50 w-44 overflow-hidden rounded-lg border bg-white py-1 shadow-md">
      <button className={cn(item, 'text-[#151c27]')} onClick={() => action(onView)}>View details</button>
      {onAssignments && <button className={cn(item, 'text-[#151c27]')} onClick={() => action(onAssignments)}>View assignments</button>}
      <button className={cn(item, 'text-[#151c27]')} onClick={() => action(onRole)}>Set Role: {user.role === 'STUDENT' ? 'Advisor' : 'Student'}</button>
      {(user.status === 'ACTIVE' || suspended) && <button disabled={isSelf && !suspended} title={isSelf && !suspended ? 'You cannot suspend your own account' : undefined} className={cn(item, suspended ? 'text-[#047857]' : 'text-[#b91c1c]', 'disabled:opacity-40')} onClick={() => action(onToggle)}>{suspended ? 'Activate account' : 'Suspend account'}</button>}
    </div>, document.body)}</>;
}
