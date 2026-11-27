import { cn } from '@/shared/lib/utils';
import type { CourseWorkload, WorkloadLevel, WorkloadSource } from '../types/course';

const LEVEL_STYLES: Record<WorkloadLevel, string> = {
  LIGHT: 'bg-emerald-50 text-emerald-700 [--dot:var(--color-emerald-500)]',
  MEDIUM: 'bg-amber-50 text-amber-700 [--dot:var(--color-amber-500)]',
  HEAVY: 'bg-red-50 text-red-700 [--dot:var(--color-red-500)]',
};

const LEVEL_LABELS: Record<WorkloadLevel, string> = {
  LIGHT: 'Light',
  MEDIUM: 'Medium',
  HEAVY: 'Heavy',
};

const SOURCE_SHORT: Record<WorkloadSource, string> = {
  MANUAL: 'Manual',
  DATA_ADJUSTED: 'Data',
  RULE_BASED: 'Auto',
};

export function WorkloadBadge({
  workload,
  showSource = false,
  className,
}: {
  workload?: CourseWorkload | null;
  showSource?: boolean;
  className?: string;
}) {
  if (!workload) {
    return <span className="text-xs text-ink-subtle">--</span>;
  }

  const label = LEVEL_LABELS[workload.level] ?? workload.level;
  const sourceLabel = SOURCE_SHORT[workload.source] ?? workload.source;
  const tooltip = `Workload: ${label} (${workload.score}/100, ${sourceLabel})`;

  return (
    <span
      title={tooltip}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-0.5 text-[11px] font-medium leading-4',
        !showSource && 'min-w-[68px]',
        LEVEL_STYLES[workload.level],
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[var(--dot)]" aria-hidden />
      <span>{label}</span>
      {showSource && <span className="opacity-75">· {sourceLabel}</span>}
    </span>
  );
}
