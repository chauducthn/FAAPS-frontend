// Hero banner and KPI cards for AdvisorAcademicLookup.

import { Link } from 'react-router';
import { BookOpen, GraduationCap, Layers, LibraryBig } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface AcademicLookupHeaderProps {
  curriculaCount: number;
  coursesCount: number;
  majorsCount: number;
  categoriesCount: number;
}

export function AcademicLookupHeader({
  curriculaCount,
  coursesCount,
  majorsCount,
  categoriesCount,
}: AcademicLookupHeaderProps) {
  const kpis = [
    { label: 'Curricula', sub: 'training programs', value: String(curriculaCount), icon: GraduationCap, iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]', topBar: 'bg-slate-900' },
    { label: 'Courses', sub: 'subjects in catalog', value: String(coursesCount), icon: BookOpen, iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]', topBar: 'bg-[#F26F21]' },
    { label: 'Majors', sub: 'majors covered', value: String(majorsCount || '—'), icon: LibraryBig, iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', topBar: 'bg-slate-300' },
    { label: 'Categories', sub: 'course groups', value: String(categoriesCount), icon: Layers, iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]', topBar: 'bg-emerald-600' },
  ];

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <LibraryBig className="size-7" aria-hidden strokeWidth={2.25} />
              Academic Search
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              Tra cứu chương trình đào tạo và môn học để tư vấn chính xác — read-only, không chỉnh sửa.
            </p>
          </div>
          <Link
            to="/advisor"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 active:scale-[0.98]"
          >
            Back to Overview
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {kpis.map((s) => (
          <div
            key={s.label}
            aria-readonly="true"
            className="relative cursor-default overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_-14px_rgba(15,23,42,0.25)]"
          >
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', s.topBar)} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{s.label}</p>
                <p className="mt-2.5 text-[30px] font-extrabold leading-none tabular-nums text-slate-900">{s.value}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{s.sub}</p>
              </div>
              <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', s.iconBox)}>
                <s.icon className="size-5" aria-hidden strokeWidth={2.25} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
