// Small reusable controls for DataTable: Checkbox, SortIcon, and PageJumpInput.

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (event: never) => void;
  label: string;
  className?: string;
  /** The checkbox is shown but cannot be changed. */
  disabled?: boolean;
  /** Why the checkbox is disabled. Shown as its tooltip. */
  disabledReason?: string;
}

export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
  className,
  disabled = false,
  disabledReason,
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  const input = (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'size-4 shrink-0 rounded border-gray-300 accent-[#F26F21]',
        disabled
          ? 'cursor-not-allowed border-gray-200 bg-gray-100'
          : 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40',
        className,
      )}
    />
  );

  // A disabled input cannot show a tooltip, so the reason rides along in the wrapper.
  if (!disabled || !disabledReason) return input;

  return (
    <span className="group relative inline-flex" title={disabledReason}>
      {input}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-48 -translate-x-1/2',
          'rounded-lg bg-gray-900 px-2.5 py-1.5 text-left text-[11px] font-medium leading-snug',
          'text-white opacity-0 shadow-lg transition-opacity duration-150',
          'group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        {disabledReason}
      </span>
    </span>
  );
}

export function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ArrowUp className="size-3.5 text-[#F26F21]" aria-hidden />;
  if (sorted === 'desc') return <ArrowDown className="size-3.5 text-[#F26F21]" aria-hidden />;
  return <ChevronsUpDown className="size-3.5 text-slate-400" aria-hidden />;
}

/**
 * Compact "go to page" field for long lists. The value stays local so a
 * half-typed number never moves the list until Enter or blur.
 */
export function PageJumpInput({
  pageIndex,
  totalPages,
  onJump,
}: {
  pageIndex: number;
  totalPages: number;
  onJump: (pageIndex: number) => void;
}) {
  const [value, setValue] = useState(String(pageIndex + 1));

  useEffect(() => {
    setValue(String(pageIndex + 1));
  }, [pageIndex]);

  const commit = () => {
    const parsed = Number.parseInt(value.trim(), 10);
    if (!Number.isFinite(parsed)) {
      setValue(String(pageIndex + 1));
      return;
    }
    const target = Math.min(Math.max(parsed, 1), totalPages) - 1;
    onJump(target);
    setValue(String(target + 1));
  };

  return (
    <label className="flex items-center gap-2 text-[13px] text-slate-500">
      Go to
      <input
        type="number"
        min={1}
        max={totalPages}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          }
        }}
        aria-label="Go to page"
        className={cn(
          'h-8 w-16 rounded-md border border-slate-200 bg-white px-2 text-center text-[13px] font-semibold text-[#151c27]',
          'tabular-nums outline-none focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]/40',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        )}
      />
    </label>
  );
}
