import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { AlertTriangle, FileSpreadsheet, ShieldCheck, SlidersHorizontal, Upload } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { AttendanceConfigTab } from '../components/attendance/AttendanceConfigTab';
import { AttendanceImportTab } from '../components/attendance/AttendanceImportTab';
import { useAttendanceDefaultRule, useAttendanceImports, useAttendanceOverrides } from '../hooks/queries/useAttendance';
import { maxAbsentSessions } from '../types/attendance';

type Tab = 'import' | 'config';

const TABS: { key: Tab; label: string; icon: typeof Upload }[] = [
  { key: 'import', label: 'Import', icon: Upload },
  { key: 'config', label: 'Config', icon: SlidersHorizontal },
];

function AttendanceStatTile({
  icon,
  label,
  value,
  meta,
  tone,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  meta: string;
  tone: 'orange' | 'indigo' | 'emerald' | 'amber';
  active?: boolean;
  onClick?: () => void;
}) {
  const iconTone = {
    orange: 'bg-orange-50 text-[#C2410C]',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }[tone];

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left transition-colors',
        onClick && 'cursor-pointer',
        active ? 'border-[#F26F21]/60 bg-orange-50/30' : 'border-gray-200/80 hover:border-gray-300',
      )}
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconTone)}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-lg font-bold leading-none tabular-nums text-gray-900">{value}</span>
          <span className="truncate text-xs text-gray-400">{meta}</span>
        </div>
      </div>
    </div>
  );
}

/** Admin attendance: import attendance data and set each course's attendance condition. */
export default function Attendance() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'config' ? 'config' : 'import';
  const defaultRule = useAttendanceDefaultRule();
  const overrides = useAttendanceOverrides();
  const imports = useAttendanceImports();

  const rule = defaultRule.data;
  const history = imports.data ?? [];
  const totalRows = history.reduce((sum, item) => sum + item.rowCount, 0);
  const totalWarnings = history.reduce((sum, item) => sum + item.warningCount, 0);
  const totalFails = history.reduce((sum, item) => sum + item.failCount, 0);
  const setTab = (next: Tab) => setParams(next === 'import' ? {} : { tab: next }, { replace: true });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-2.5 lg:grid-cols-4">
          <AttendanceStatTile
            icon={<ShieldCheck className="size-4" />}
            label="Default pass rule"
            value={rule ? `${rule.minAttendancePercent}%` : '—'}
            meta={rule ? `max ${maxAbsentSessions(rule)} / ${rule.totalSessions} absent` : 'loading…'}
            tone="orange"
            active={tab === 'config'}
            onClick={() => setTab('config')}
          />
          <AttendanceStatTile
            icon={<SlidersHorizontal className="size-4" />}
            label="Course overrides"
            value={overrides.data ? String(overrides.data.length) : '—'}
            meta="custom rules"
            tone="indigo"
            onClick={() => setTab('config')}
          />
          <AttendanceStatTile
            icon={<FileSpreadsheet className="size-4" />}
            label="Files imported"
            value={String(history.length)}
            meta={`${totalRows} rows recorded`}
            tone="emerald"
            active={tab === 'import'}
            onClick={() => setTab('import')}
          />
          <AttendanceStatTile
            icon={<AlertTriangle className="size-4" />}
            label="Flagged records"
            value={String(totalWarnings + totalFails)}
            meta={`${totalWarnings} warn · ${totalFails} fail`}
            tone="amber"
            onClick={() => setTab('import')}
          />
        </div>

        <div className="flex shrink-0 items-center justify-end">
          <div
            role="tablist"
            aria-label="Attendance view"
            className="inline-flex rounded-xl border border-gray-200/80 bg-gray-100/80 p-1"
          >
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold transition-all',
                    active
                      ? 'bg-white text-gray-900 shadow-2xs ring-1 ring-gray-200/70'
                      : 'text-gray-500 hover:text-gray-800',
                  )}
                >
                  <Icon className={cn('size-3.5', active ? 'text-[#F26F21]' : 'text-gray-400')} aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {tab === 'import' ? <AttendanceImportTab /> : <AttendanceConfigTab />}
    </div>
  );
}
