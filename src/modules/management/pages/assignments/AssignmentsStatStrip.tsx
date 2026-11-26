import type { ReactNode } from 'react';
import { Bell, UserCheck, UserMinus as UserX, Users, MagicWand as WandSparkles } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AssignmentTab } from './AssignmentsToolbar';

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: string;
  meta?: string;
  tone?: 'slate' | 'emerald' | 'amber' | 'orange';
  active?: boolean;
  onClick?: () => void;
}

const ICON_TONE: Record<NonNullable<StatTileProps['tone']>, string> = {
  slate: 'bg-gray-100 text-gray-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  orange: 'bg-orange-50 text-[#C2410C]',
};

const ACTIVE_TONE: Record<NonNullable<StatTileProps['tone']>, string> = {
  slate: 'border-gray-400 bg-gray-50/70',
  emerald: 'border-emerald-400/70 bg-emerald-50/40',
  amber: 'border-amber-400/80 bg-amber-50/40',
  orange: 'border-[#F26F21]/60 bg-orange-50/40',
};

const VALUE_TONE: Record<NonNullable<StatTileProps['tone']>, string> = {
  slate: 'text-gray-900',
  emerald: 'text-gray-900',
  amber: 'text-amber-700',
  orange: 'text-[#C2410C]',
};

function StatTile({ icon, label, value, meta, tone = 'slate', active, onClick }: StatTileProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left transition-colors',
        onClick && 'cursor-pointer',
        active ? ACTIVE_TONE[tone] : 'border-gray-200/80 hover:border-gray-300',
      )}
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', ICON_TONE[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className={cn('text-lg font-bold leading-none tabular-nums', VALUE_TONE[tone])}>{value}</span>
          {meta && <span className="truncate text-xs text-gray-400">{meta}</span>}
        </div>
      </div>
    </div>
  );
}

export function AssignmentsStatStrip({
  total,
  assigned,
  unassigned,
  pending,
  waitingCohorts,
  advisorCount,
  activeTab,
  pendingOnly,
  onSelectAdvisors,
  onSelectUnassigned,
  onSelectPending,
  onAutoAssign,
}: {
  total?: number;
  assigned?: number;
  unassigned?: number;
  pending?: number;
  waitingCohorts: number;
  advisorCount: number;
  activeTab: AssignmentTab;
  pendingOnly: boolean;
  onSelectAdvisors: () => void;
  onSelectUnassigned: () => void;
  onSelectPending: () => void;
  onAutoAssign: () => void;
}) {
  const coverage = total && total > 0 && assigned !== undefined ? `${Math.round((assigned / total) * 100)}% covered` : undefined;
  const unassignedMeta = waitingCohorts > 0 ? `in ${waitingCohorts} cohort${waitingCohorts === 1 ? '' : 's'}` : 'all covered';

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile
          icon={<Users className="size-4" aria-hidden />}
          label="Total students"
          value={total !== undefined ? String(total) : '—'}
          meta={coverage}
          tone="slate"
          onClick={onSelectAdvisors}
        />
        <StatTile
          icon={<UserCheck className="size-4" aria-hidden />}
          label="Assigned"
          value={assigned !== undefined ? String(assigned) : '—'}
          meta={`${advisorCount} advisor${advisorCount === 1 ? '' : 's'}`}
          tone="emerald"
          active={activeTab === 'advisors'}
          onClick={onSelectAdvisors}
        />
        <StatTile
          icon={<UserX className="size-4" aria-hidden />}
          label="Unassigned"
          value={unassigned !== undefined ? String(unassigned) : '—'}
          meta={unassignedMeta}
          tone={(unassigned ?? 0) > 0 ? 'amber' : 'slate'}
          active={activeTab === 'unassigned' && !pendingOnly}
          onClick={onSelectUnassigned}
        />
        <StatTile
          icon={<Bell className="size-4" aria-hidden />}
          label="Waiting for advisor"
          value={pending !== undefined ? String(pending) : '—'}
          meta={(pending ?? 0) > 0 ? 'pending requests' : 'no pending'}
          tone={(pending ?? 0) > 0 ? 'orange' : 'slate'}
          active={activeTab === 'unassigned' && pendingOnly}
          onClick={(pending ?? 0) > 0 ? onSelectPending : undefined}
        />
      </div>

      {waitingCohorts > 0 && (
        <div className="flex shrink-0 items-center justify-end">
          <button
            type="button"
            onClick={onAutoAssign}
            title="Automatically distribute unassigned students across each cohort's advisor pool"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14]"
          >
            <WandSparkles className="size-4" aria-hidden />
            Auto assign
          </button>
        </div>
      )}
    </div>
  );
}
