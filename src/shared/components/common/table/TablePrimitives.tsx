// Shared table primitives.
//
// Every table in FAAPS renders the same visual language, whether it is a
// server-paged management list, a preview table inside a modal, or a
// read-only transcript. These primitives own that language so a table only
// has to describe its own columns and rows.
//
// The palette is the product orange on a neutral gray scale. No gradients.

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export interface TableShellProps {
  children: ReactNode;
  /** Keeps the header visible while the body scrolls. */
  stickyHeader?: boolean;
  /** Minimum width so narrow columns never collapse. */
  minWidth?: string;
  className?: string;
}

export function TableShell({
  children,
  stickyHeader = false,
  minWidth,
  className,
}: TableShellProps) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table
        className={cn(
          'w-full border-collapse text-left',
          minWidth && 'min-w-[720px]',
          '[&_tbody_tr]:border-b [&_tbody_tr]:border-gray-100 dark:[&_tbody_tr]:border-[#211f1d]',
          '[&_tbody_tr]:transition-colors [&_tbody_tr]:hover:bg-gray-50/80 dark:[&_tbody_tr]:hover:bg-[#22201e]',
          '[&_thead_tr]:border-b [&_thead_tr]:border-gray-200/80 [&_thead_tr]:bg-gray-50/95 dark:[&_thead_tr]:border-[#2a2725] dark:[&_thead_tr]:bg-[#151413]',
          stickyHeader && '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-gray-50/95 dark:[&_thead_th]:bg-[#151413]',
        )}
        style={minWidth ? { minWidth } : undefined}
      >
        {children}
      </table>
    </div>
  );
}

/** Header cell. `align` keeps numeric columns aligned with their data. */
export function TableHead({
  children,
  align = 'left',
  className,
  ...rest
}: {
  children?: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
} & React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={cn('text-[13px] leading-5 text-gray-700', className)}>{children}</tbody>;
}

export function TableRow({
  children,
  selected = false,
  className,
  ...rest
}: {
  children: ReactNode;
  selected?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn(selected && 'bg-[var(--brand-soft)]', className)} {...rest}>{children}</tr>
  );
}

export function TableCell({
  children,
  align = 'left',
  className,
  ...rest
}: {
  children?: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
} & React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'px-4 py-2.5 align-middle text-[13px] leading-5 text-gray-700',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right tabular-nums',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

/** Placeholder row shown when a table has nothing to display. */
export function TableEmpty({
  colSpan,
  title,
  description,
  icon,
}: {
  colSpan: number;
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          {icon ? (
            <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--line-soft)] text-[var(--ink-subtle)]">
              {icon}
            </span>
          ) : null}
          <p className="text-sm font-semibold text-[var(--ink-primary)]">{title}</p>
          {description ? (
            <p className="text-[13px] text-[var(--ink-muted)]">{description}</p>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

/** Placeholder row shown when the table data could not be loaded. */
export function TableError({
  colSpan,
  message,
  onRetry,
}: {
  colSpan: number;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <p className="text-sm font-semibold text-red-600">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
                'mt-2 rounded-lg border border-[var(--line)] bg-white',
                'px-3 py-1.5 text-[13px] font-semibold',
                'text-[var(--ink-muted)] transition-colors',
                'hover:bg-[var(--surface-hover)]',
              )}
          >
            Retry
          </button>
        ) : null}
      </td>
    </tr>
  );
}

/** Placeholder rows shown while the table data loads. */
export function TableSkeletonRows({ colSpan, rows = 4 }: { colSpan: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`}>
          <td colSpan={colSpan} className="px-4 py-4">
            <div
              className="h-3.5 animate-pulse rounded bg-[var(--line-soft)]"
              style={{ width: `${45 + ((rowIndex * 7) % 3) * 18}%` }}
            />
          </td>
        </tr>
      ))}
    </>
  );
}
