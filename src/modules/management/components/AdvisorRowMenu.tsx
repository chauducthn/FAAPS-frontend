// Single three-dot action menu for each advisor row.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, FolderPlus, DotsThree as MoreHorizontal, SlidersHorizontal } from '@phosphor-icons/react';

interface AdvisorRowMenuProps {
  advisorName: string;
  onAssignCohort: () => void;
  onEditLimit: () => void;
  onOpenDetails: () => void;
}

export function AdvisorRowMenu({
  advisorName,
  onAssignCohort,
  onEditLimit,
  onOpenDetails,
}: AdvisorRowMenuProps) {
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
      window.innerHeight - rect.bottom < 160
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

  const itemCls =
    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-100/80';
  const run = (handler: () => void) => {
    setOpen(false);
    handler();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${advisorName}`}
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
            className="z-[60] w-48 rounded-xl border border-gray-200/80 bg-white p-1.5 shadow-lg ring-1 ring-black/5"
          >
            <button role="menuitem" className={itemCls} onClick={() => run(onAssignCohort)}>
              <FolderPlus className="size-4 text-gray-400" aria-hidden />
              Assign cohort
            </button>
            <button role="menuitem" className={itemCls} onClick={() => run(onEditLimit)}>
              <SlidersHorizontal className="size-4 text-gray-400" aria-hidden />
              Advisory limit
            </button>
            <button role="menuitem" className={itemCls} onClick={() => run(onOpenDetails)}>
              <Eye className="size-4 text-gray-400" aria-hidden />
              Details &amp; history
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
