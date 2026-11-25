import type { ReactNode } from 'react';
import { CheckCircle2, Download, GraduationCap, Loader2, Plus, ShieldOff, UserRound, Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AdminUserRole, AdminUserStatus } from '../../types/admin';

function StatItem({
  icon,
  label,
  value,
  sub,
  tone,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'slate' | 'orange' | 'indigo' | 'emerald' | 'red';
  active?: boolean;
  onClick?: () => void;
}) {
  const iconTone: Record<typeof tone, string> = {
    slate: 'bg-gray-100 text-gray-700',
    orange: 'bg-orange-50 text-[#C2410C]',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-600',
  };
  const activeTone: Record<typeof tone, string> = {
    slate: 'border-gray-400 bg-gray-50/70',
    orange: 'border-[#F26F21]/60 bg-orange-50/40',
    indigo: 'border-indigo-400/70 bg-indigo-50/40',
    emerald: 'border-emerald-400/70 bg-emerald-50/40',
    red: 'border-red-300 bg-red-50/40',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left transition-colors',
        onClick && 'cursor-pointer',
        active ? activeTone[tone] : 'border-gray-200/80 hover:border-gray-300',
      )}
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconTone[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-gray-500">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold leading-tight tabular-nums text-gray-900">{value}</span>
          {sub && <span className="truncate text-[11px] text-gray-400">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

export function UserAccountsHeader({
  studentCount,
  advisorCount,
  activeCount,
  suspendedCount,
  activeRole,
  activeStatus,
  onSelectRole,
  onSelectStatus,
  onClearAll,
  onCreate,
  onExport,
  isExporting,
  canExport,
}: {
  studentCount?: number;
  advisorCount?: number;
  activeCount?: number;
  suspendedCount?: number;
  activeRole: AdminUserRole | '';
  activeStatus: AdminUserStatus | '';
  onSelectRole: (role: AdminUserRole | '') => void;
  onSelectStatus: (status: AdminUserStatus | '') => void;
  onClearAll: () => void;
  onCreate: () => void;
  onExport: () => void;
  isExporting: boolean;
  canExport: boolean;
}) {
  const totalUsers =
    studentCount !== undefined && advisorCount !== undefined ? studentCount + advisorCount : undefined;
  const studentPct =
    totalUsers && totalUsers > 0 && studentCount !== undefined
      ? `${Math.round((studentCount / totalUsers) * 100)}%`
      : undefined;
  const advisorPct =
    totalUsers && totalUsers > 0 && advisorCount !== undefined
      ? `${Math.round((advisorCount / totalUsers) * 100)}%`
      : undefined;

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatItem
          icon={<Users className="size-4" />}
          label="Total users"
          value={totalUsers !== undefined ? String(totalUsers) : '—'}
          tone="slate"
          active={!activeRole && !activeStatus}
          onClick={onClearAll}
        />
        <StatItem
          icon={<GraduationCap className="size-4" />}
          label="Students"
          value={String(studentCount ?? '—')}
          sub={studentPct}
          tone="orange"
          active={activeRole === 'STUDENT'}
          onClick={() => onSelectRole(activeRole === 'STUDENT' ? '' : 'STUDENT')}
        />
        <StatItem
          icon={<UserRound className="size-4" />}
          label="Advisors"
          value={String(advisorCount ?? '—')}
          sub={advisorPct}
          tone="indigo"
          active={activeRole === 'ADVISOR'}
          onClick={() => onSelectRole(activeRole === 'ADVISOR' ? '' : 'ADVISOR')}
        />
        <StatItem
          icon={<CheckCircle2 className="size-4" />}
          label="Active"
          value={String(activeCount ?? '—')}
          tone="emerald"
          active={activeStatus === 'ACTIVE'}
          onClick={() => onSelectStatus(activeStatus === 'ACTIVE' ? '' : 'ACTIVE')}
        />
        <StatItem
          icon={<ShieldOff className="size-4" />}
          label="Suspended"
          value={String(suspendedCount ?? '—')}
          tone="red"
          active={activeStatus === 'SUSPENDED'}
          onClick={() => onSelectStatus(activeStatus === 'SUSPENDED' ? '' : 'SUSPENDED')}
        />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <button
          type="button"
          onClick={onExport}
          disabled={!canExport || isExporting}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          {isExporting ? 'Exporting…' : 'Export CSV'}
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50"
        >
          <Plus className="size-3.5" strokeWidth={2.5} /> Create user
        </button>
      </div>
    </div>
  );
}
