import { Bell, UserCheck, UserMinus as UserX, Users } from '@phosphor-icons/react';

import type { AssignmentTab } from './AssignmentsToolbar';
import { AdminStatTile } from '../../components/AdminStatTile';

const StatTile = AdminStatTile;

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
  onSelectAssigned,
  onSelectUnassigned,
  onSelectPending,
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
  onSelectAssigned: () => void;
  onSelectUnassigned: () => void;
  onSelectPending: () => void;
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
          active={activeTab === 'advisors'}
          onClick={onSelectAdvisors}
        />
        <StatTile
          icon={<UserCheck className="size-4" aria-hidden />}
          label="Assigned"
          value={assigned !== undefined ? String(assigned) : '—'}
          meta={`${advisorCount} advisor${advisorCount === 1 ? '' : 's'}`}
          tone="emerald"
          active={activeTab === 'assigned'}
          onClick={onSelectAssigned}
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
    </div>
  );
}
