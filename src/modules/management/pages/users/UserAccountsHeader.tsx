import type { ReactNode } from 'react';
import { GraduationCap, Plus, ShieldCheck, UserRound, Users } from 'lucide-react';
import type { AdminUserRole } from '../../types/admin';

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  active?: boolean;
  accent?: 'orange' | 'indigo' | 'slate';
  onClick?: () => void;
}

const ACCENT_ICON: Record<NonNullable<KpiCardProps['accent']>, string> = {
  orange: 'bg-orange-100 text-[#C2410C]',
  indigo: 'bg-indigo-100 text-indigo-700',
  slate: 'bg-gray-100 text-gray-700',
};

const ACCENT_RING: Record<NonNullable<KpiCardProps['accent']>, string> = {
  orange: 'border-[#F26F21]/60 bg-orange-50/40 ring-2 ring-[#F26F21]/15',
  indigo: 'border-indigo-400/70 bg-indigo-50/40 ring-2 ring-indigo-500/15',
  slate: 'border-gray-300 bg-gray-50/60 ring-2 ring-gray-900/5',
};

function KpiCard({ icon, label, value, hint, active, accent = 'orange', onClick }: KpiCardProps) {
  const baseClass =
    'flex items-center gap-3.5 rounded-2xl border bg-white px-4 py-3.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all';
  const stateClass = active ? ACCENT_RING[accent] : 'border-gray-200/80 hover:border-gray-300';

  const content = (
    <>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${ACCENT_ICON[accent]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-0.5 flex items-baseline gap-1.5 text-xl font-extrabold tabular-nums leading-none text-gray-900">
          <span>{value}</span>
          <span className="truncate text-[11px] font-medium text-gray-500">{hint}</span>
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={`${baseClass} ${stateClass} cursor-pointer`}>
        {content}
      </button>
    );
  }
  return <div className={`${baseClass} border-gray-200/80`}>{content}</div>;
}

export function UserAccountsHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#F26F21] text-white shadow-[0_4px_12px_rgba(242,111,33,0.3)]">
          <Users className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">User Accounts</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Manage student and advisor accounts, access status, and password resets.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.35)] transition-all hover:-translate-y-px hover:bg-[#e05f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50 active:translate-y-0"
      >
        <Plus className="size-4" strokeWidth={2.5} /> Create user
      </button>
    </div>
  );
}

export function UserAccountsKpiStrip({
  studentCount,
  advisorCount,
  total,
  activeRole,
  onSelectRole,
}: {
  studentCount?: number;
  advisorCount?: number;
  total: number;
  activeRole: AdminUserRole | '';
  onSelectRole: (role: AdminUserRole | '') => void;
}) {
  const combinedTotal =
    studentCount !== undefined && advisorCount !== undefined ? String(studentCount + advisorCount) : '—';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={<Users className="size-4" />}
        label="All Accounts"
        value={combinedTotal}
        hint="total users"
        accent="slate"
        active={activeRole === ''}
        onClick={() => onSelectRole('')}
      />
      <KpiCard
        icon={<GraduationCap className="size-4" />}
        label="Students"
        value={String(studentCount ?? '—')}
        hint="accounts"
        accent="orange"
        active={activeRole === 'STUDENT'}
        onClick={() => onSelectRole(activeRole === 'STUDENT' ? '' : 'STUDENT')}
      />
      <KpiCard
        icon={<UserRound className="size-4" />}
        label="Advisors"
        value={String(advisorCount ?? '—')}
        hint="accounts"
        accent="indigo"
        active={activeRole === 'ADVISOR'}
        onClick={() => onSelectRole(activeRole === 'ADVISOR' ? '' : 'ADVISOR')}
      />
      <KpiCard
        icon={<ShieldCheck className="size-4" />}
        label="Matching"
        value={String(total)}
        hint="current filters"
        accent="orange"
      />
    </div>
  );
}
