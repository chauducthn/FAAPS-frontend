interface PaginationProps {
  page: number; // zero-based
  pageSize: number;
  total: number;
  noun: string;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, noun, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  // Show a compact window of page numbers around the current page.
  const pages = Array.from({ length: totalPages }, (_, i) => i).filter(
    (i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1
  );

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e7eefe] bg-[#f7f8fa]/60 px-4 py-3 sm:flex-row">
      <p className="text-[13px] text-[#555f6f]">
        Showing {from}–{to} of {total} {noun} · {pageSize} per page
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#555f6f] hover:bg-gray-100 disabled:opacity-40"
        >
          Previous
        </button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-xs text-[#98a2b3]">...</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={
                p === page
                  ? 'flex size-8 items-center justify-center rounded-lg bg-[#f37021] text-xs font-bold text-white'
                  : 'flex size-8 items-center justify-center rounded-lg text-xs font-semibold text-[#555f6f] hover:bg-gray-100'
              }
            >
              {p + 1}
            </button>
          </span>
        ))}
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#555f6f] hover:bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
