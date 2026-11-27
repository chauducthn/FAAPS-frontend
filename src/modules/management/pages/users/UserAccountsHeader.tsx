import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MENU_PANEL_CLASS, MenuItem, toolbarButtonClass } from '../../../../shared/components/ui/MenuParts';
import { CheckCircle as CheckCircle2, CaretDown as ChevronDown, DownloadSimple as Download, GraduationCap, SpinnerGap as Loader2, Plus, ShieldSlash as ShieldOff, UploadSimple as Upload, User as UserRound, Users } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ExampleSheetButton, type ExampleSheet } from '../../components/ImportCheckDialog';
import type { AdminUserRole, AdminUserStatus } from '../../types/admin';
import { AdminStatTile, type AdminStatTileProps } from '../../components/AdminStatTile';

/** Local alias kept for call sites that pass `sub`; renders the shared admin tile. */
function StatItem({ sub, ...rest }: Omit<AdminStatTileProps, 'meta'> & { sub?: ReactNode }) {
  return <AdminStatTile {...rest} meta={sub} />;
}

function ImportUsersMenu({
  isImporting,
  onImportStudents,
  onImportAdvisors,
}: {
  isImporting: boolean;
  onImportStudents: () => void;
  onImportAdvisors: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={isImporting}
        onClick={() => setOpen((v) => !v)}
        className={toolbarButtonClass()}
      >
        {isImporting ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4 text-ink-subtle" />}
        {isImporting ? 'Importing…' : 'Import Excel'}
        <ChevronDown className={cn('size-3.5 text-ink-subtle transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className={MENU_PANEL_CLASS} role="menu">
          <MenuItem icon={<GraduationCap />} onClick={() => { setOpen(false); onImportStudents(); }}>
            Import students (.xlsx)
          </MenuItem>
          <MenuItem icon={<UserRound />} onClick={() => { setOpen(false); onImportAdvisors(); }}>
            Import advisors (.xlsx)
          </MenuItem>
        </div>
      )}
    </div>
  );
}

export function UserAccountsHeader({
  studentCount, advisorCount, activeCount, suspendedCount, activeRole, activeStatus,
  onSelectRole, onSelectStatus, onClearAll, onCreate, onExport, isExporting, canExport,
  onImportStudents, onImportAdvisors, isImporting, importExamples,
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
  onImportStudents: () => void;
  onImportAdvisors: () => void;
  isImporting: boolean;
  importExamples: ExampleSheet[];
}) {
  const totalUsers = studentCount !== undefined && advisorCount !== undefined ? studentCount + advisorCount : undefined;
  const studentPct = totalUsers && totalUsers > 0 && studentCount !== undefined ? `${Math.round((studentCount / totalUsers) * 100)}%` : undefined;
  const advisorPct = totalUsers && totalUsers > 0 && advisorCount !== undefined ? `${Math.round((advisorCount / totalUsers) * 100)}%` : undefined;

  const roleTab = activeRole === 'STUDENT' ? 'STUDENT' : activeRole === 'ADVISOR' ? 'ADVISOR' : 'ALL';

  return (
    <div className="space-y-4">
      <AdminTabBar
        ariaLabel="User role tabs"
        activeKey={roleTab}
        onChange={(next) => onSelectRole(next === 'ALL' ? '' : next)}
        tabs={[
          { key: 'ALL', label: 'All users', icon: Users, count: totalUsers, badgeTone: 'slate' },
          { key: 'STUDENT', label: 'Students', icon: GraduationCap, count: studentCount, badgeTone: 'orange' },
          { key: 'ADVISOR', label: 'Advisors', icon: UserRound, count: advisorCount, badgeTone: 'emerald' },
        ]}
        actions={
          <>
            <ExampleSheetButton
              examples={importExamples}
              className={toolbarButtonClass()}
            />
            <ImportUsersMenu
              isImporting={isImporting}
              onImportStudents={onImportStudents}
              onImportAdvisors={onImportAdvisors}
            />
            <button
              type="button"
              onClick={onExport}
              disabled={!canExport || isExporting}
              className={toolbarButtonClass()}
            >
              {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </button>
            <button
              type="button"
              onClick={onCreate}
              className={toolbarButtonClass('primary')}
            >
              <Plus className="size-4" /> Create user
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatItem icon={<Users className="size-4" />} label="Total users" value={totalUsers !== undefined ? String(totalUsers) : '—'} tone="slate" active={!activeRole && !activeStatus} onClick={onClearAll} />
        <StatItem icon={<GraduationCap className="size-4" />} label="Students" value={String(studentCount ?? '—')} sub={studentPct} tone="orange" active={activeRole === 'STUDENT'} onClick={() => onSelectRole(activeRole === 'STUDENT' ? '' : 'STUDENT')} />
        <StatItem icon={<UserRound className="size-4" />} label="Advisors" value={String(advisorCount ?? '—')} sub={advisorPct} tone="indigo" active={activeRole === 'ADVISOR'} onClick={() => onSelectRole(activeRole === 'ADVISOR' ? '' : 'ADVISOR')} />
        <StatItem icon={<CheckCircle2 className="size-4" />} label="Active" value={String(activeCount ?? '—')} tone="emerald" active={activeStatus === 'ACTIVE'} onClick={() => onSelectStatus(activeStatus === 'ACTIVE' ? '' : 'ACTIVE')} />
        <StatItem icon={<ShieldOff className="size-4" />} label="Suspended" value={String(suspendedCount ?? '—')} tone="red" active={activeStatus === 'SUSPENDED'} onClick={() => onSelectStatus(activeStatus === 'SUSPENDED' ? '' : 'SUSPENDED')} />
      </div>
    </div>
  );
}
