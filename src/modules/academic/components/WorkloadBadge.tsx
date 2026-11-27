import { cn } from '@/shared/lib/utils';
import type { CourseWorkload, WorkloadLevel, WorkloadSource } from '../types/course';

const LEVEL_STYLES: Record<WorkloadLevel, string> = {
  LIGHT: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  MEDIUM: 'bg-amber-50 text-amber-800 ring-amber-200/80',
  HEAVY: 'bg-rose-50 text-rose-700 ring-rose-200/80',
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
    return <span className="text-xs text-gray-400">--</span>;
  }

  const label = LEVEL_LABELS[workload.level] ?? workload.level;
  const sourceLabel = SOURCE_SHORT[workload.source] ?? workload.source;
  const tooltip = `Workload: ${label} (${workload.score}/100, ${sourceLabel})`;

  return (
    <span
      title={tooltip}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset',
        LEVEL_STYLES[workload.level],
        className,
      )}
    >
      <span>{label}</span>
      {showSource && (
        <span className="font-medium opacity-75">· {sourceLabel}</span>
      )}
    </span>
  );
}
