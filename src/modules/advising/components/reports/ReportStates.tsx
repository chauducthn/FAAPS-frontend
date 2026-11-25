// src/modules/advising/components/reports/ReportStates.tsx
// Ba trang thai chung cua mot khoi bieu do: loading (skeleton), error (retry),
// va empty (khong co du lieu). Dung chung de moi panel co mot hinh dang nhat quan.
//
// Ve "empty": khac voi "error", rong la ket qua dung — khong phai loi.

import { BarChart3, TriangleAlert } from 'lucide-react';

/** Skeleton giu dung chieu cao cua bieu do (300px) de layout khong nhay khi data ve. */
export function ChartSkeleton() {
  return (
    <div className="h-[300px] w-full animate-pulse rounded-xl bg-slate-50" aria-hidden />
  );
}

/** Loi tai: noi ro nguyen nhan va dua ngay nut thu lai. */
export function ChartError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <p className="text-sm font-bold text-slate-900">Could not load this chart</p>
      <p className="max-w-xs text-xs leading-relaxed text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex h-10 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21]"
      >
        Retry
      </button>
    </div>
  );
}

/** Khong co du lieu de ve — huong dan buoc tiep theo chu khong chi "khong co du lieu". */
export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <BarChart3 className="size-6" aria-hidden />
      </span>
      <p className="text-sm font-bold text-slate-900">No data to show</p>
      <p className="max-w-xs text-xs leading-relaxed text-slate-500">{message}</p>
    </div>
  );
}
