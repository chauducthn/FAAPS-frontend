import { useEffect } from 'react';
import { DataTablePagination } from '../../../shared/components/common/data-table/DataTablePagination';

interface PaginationProps {
  page: number; // zero-based
  pageSize: number;
  total: number;
  noun: string;
  onChange: (page: number) => void;
  /** No border/background, for use inside a card that already has padding. */
  bare?: boolean;
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // If the list shrinks (filters, deletions) while on a later page, step back to the last valid page.
  useEffect(() => {
    if (page > 0 && page >= totalPages) onChange(totalPages - 1);
  }, [page, totalPages, onChange]);

  const firstRow = total === 0 ? 0 : page * pageSize + 1;
  const lastRow = Math.min((page + 1) * pageSize, total);

  return (
    <DataTablePagination
      totalRows={total}
      firstRow={firstRow}
      lastRow={lastRow}
      pageIndex={page}
      pageSize={pageSize}
      totalPages={totalPages}
      pageSizes={[pageSize]}
      showPageSizeSelect={false}
      showPageJump
      canPreviousPage={page > 0}
      canNextPage={page + 1 < totalPages}
      onPageSizeChange={() => {}}
      onPageIndexChange={onChange}
      onPreviousPage={() => onChange(Math.max(0, page - 1))}
      onNextPage={() => onChange(Math.min(totalPages - 1, page + 1))}
    />
  );
}
