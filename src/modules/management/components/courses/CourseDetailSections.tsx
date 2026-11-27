import { ArrowUpRight, BookOpenText, GraduationCap, Scroll as ScrollText, SpinnerGap as Loader2, Target, TreeStructure as ListTree, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { CourseDetail } from '../../../academic/types/course';

export function CourseDetailSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div aria-label="Loading course detail">
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="size-9 animate-pulse rounded-md bg-line-soft" />
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded-sm bg-line-soft" />
            <div className="h-3.5 w-32 animate-pulse rounded-sm bg-line-soft" />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex size-8 items-center justify-center rounded-md text-ink-subtle hover:bg-line-soft hover:text-ink-primary"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-3 px-6 py-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-line-soft" />
        ))}
        <p className="flex items-center justify-center gap-2 text-center text-xs font-medium text-ink-subtle">
          <Loader2 className="size-3.5 animate-spin" /> Loading course detail…
        </p>
      </div>
    </div>
  );
}

export function CourseStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3.5 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">{label}</p>
      <p className={cn('mt-0.5 text-base font-semibold leading-tight tabular-nums', accent ? 'text-brand-ink' : 'text-ink-primary')}>
        {value}
      </p>
    </div>
  );
}

export function CourseSyllabusBlock({ icon, title, text, fallback }: {
  icon: React.ReactNode; title: string; text: string | null; fallback: string;
}) {
  return (
    <div>
      <h4 className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
        <span className="text-brand">{icon}</span> {title}
      </h4>
      {text ? (
        <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-secondary">{text}</p>
      ) : (
        <p className="text-[13px] italic text-ink-subtle">{fallback}</p>
      )}
    </div>
  );
}

export function CourseSyllabusTab({ course }: { course: CourseDetail }) {
  const hasSyllabus = !!(course.description || course.objectives || course.learningOutcomes);
  if (!hasSyllabus) {
    return (
      <div className="rounded-lg border border-line bg-white px-6 py-12 text-center text-xs text-ink-subtle">
        No syllabus overview recorded for {course.code} yet.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white">
      <header className="flex items-center gap-2 border-b border-line-soft px-4 py-2.5">
        <ScrollText className="size-4 text-brand" />
        <h3 className="text-[13px] font-semibold text-ink-primary">Syllabus overview</h3>
      </header>
      <div className="space-y-3.5 p-4">
        {course.description && (
          <CourseSyllabusBlock icon={<BookOpenText className="size-3.5" />} title="Description" text={course.description} fallback="" />
        )}
        {course.objectives && (
          <CourseSyllabusBlock icon={<Target className="size-3.5" />} title="Objectives & Study Requirements" text={course.objectives} fallback="" />
        )}
        {course.learningOutcomes && (
          <CourseSyllabusBlock icon={<GraduationCap className="size-3.5" />} title="Learning outcomes (CLOs)" text={course.learningOutcomes} fallback="" />
        )}
      </div>
    </section>
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
    <section className="overflow-hidden rounded-lg border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line-soft px-4 py-2.5">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-primary">
          <ListTree className="size-4 text-brand" /> Referenced by
        </h3>
        <span className="rounded-sm bg-line-soft px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-muted">
          {course.referencedBy.length}
        </span>
      </header>
      {course.referencedBy.length === 0 ? (
        <p className="px-4 py-5 text-center text-xs text-ink-subtle">
          No other course lists {course.code} as a prerequisite yet.
        </p>
      ) : (
        <ul className="divide-y divide-line-soft">
          {course.referencedBy.map((r) => (
            <li key={r.courseId}>
              {onNavigate ? (
                <button
                  type="button"
                  onClick={() => onNavigate(r.courseId)}
                  title={`View detail of ${r.courseCode}`}
                  className="group flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-hover"
                >
                  <span className="min-w-0">
                    <span className="rounded-sm bg-ink-primary px-1.5 py-0.5 font-mono text-[11px] font-semibold text-surface-page transition-colors group-hover:bg-brand group-hover:text-white">
                      {r.courseCode}
                    </span>
                    <span className="ml-2 truncate text-xs font-medium text-ink-secondary group-hover:text-ink-primary">
                      {r.courseName}
                    </span>
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-ink-subtle transition-colors group-hover:text-brand" />
                </button>
              ) : (
                <p className="px-4 py-2.5 text-xs text-ink-secondary">
                  <span className="font-mono font-semibold text-ink-primary">{r.courseCode}</span> — {r.courseName}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
