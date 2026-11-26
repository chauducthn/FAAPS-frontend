import { ArrowUpRight, ListTree, Loader2, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { CourseDetail } from '../../../academic/types/course';

export function CourseDetailSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div aria-label="Loading course detail">
      <div className="h-1.5 animate-pulse bg-orange-100" />
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="size-11 animate-pulse rounded-2xl bg-orange-100" />
          <div className="space-y-2">
            <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-56 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-3 px-6 py-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
        <p className="flex items-center justify-center gap-2 text-center text-[11px] font-medium text-gray-400">
          <Loader2 className="size-3.5 animate-spin" /> Loading course detail…
        </p>
      </div>
    </div>
  );
}

export function CourseStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-xl border px-3.5 py-3 shadow-2xs', accent ? 'border-orange-200/80 bg-orange-50/50' : 'border-gray-200/80 bg-white')}>
      <p className="text-[11px] font-semibold text-gray-500">{label}</p>
      <p className={cn('mt-1 text-lg font-bold leading-none tabular-nums', accent ? 'text-[#C2410C]' : 'text-gray-900')}>{value}</p>
    </div>
  );
}

export function CourseSyllabusBlock({
  icon,
  title,
  text,
  fallback,
}: {
  icon: React.ReactNode;
  title: string;
  text: string | null;
  fallback: string;
}) {
  return (
    <div>
      <h4 className="mb-1 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
        <span className="text-[#F26F21]">{icon}</span> {title}
      </h4>
      {text ? (
        <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-700">{text}</p>
      ) : (
        <p className="text-[13px] italic text-gray-400">{fallback}</p>
      )}
    </div>
  );
}

export function CourseReferencedBySection({
  course,
  onNavigate,
}: {
  course: CourseDetail;
  onNavigate?: (courseId: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100">
      <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
        <h3 className="flex items-center gap-1.5 text-[13px] font-extrabold tracking-tight text-gray-900">
          <ListTree className="size-4 text-[#F26F21]" /> Referenced by
        </h3>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold tabular-nums text-gray-600">
          {course.referencedBy.length}
        </span>
      </header>
      {course.referencedBy.length === 0 ? (
        <p className="px-4 py-5 text-center text-xs text-gray-400">
          No other course lists {course.code} as a prerequisite yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {course.referencedBy.map((r) => (
            <li key={r.courseId}>
              {onNavigate ? (
                <button
                  type="button"
                  onClick={() => onNavigate(r.courseId)}
                  title={`View detail of ${r.courseCode}`}
                  className="group flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#fff7ed]/60"
                >
                  <span className="min-w-0">
                    <span className="rounded-md bg-gray-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white transition-colors group-hover:bg-[#F26F21]">
                      {r.courseCode}
                    </span>
                    <span className="ml-2 truncate text-xs font-semibold text-gray-700 group-hover:text-[#9a3412]">{r.courseName}</span>
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-[#F26F21]" />
                </button>
              ) : (
                <p className="px-4 py-2.5 text-xs text-gray-700">
                  <span className="font-bold text-gray-900">{r.courseCode}</span> - {r.courseName}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
