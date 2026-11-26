import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { Warning as AlertTriangle, DownloadSimple as Download, FileXls as FileSpreadsheet, SpinnerGap as Loader2, ShieldCheck, SlidersHorizontal, UploadSimple as Upload } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { AdminTabBar } from '../components/AdminTabBar';
import { AttendanceConfigTab } from '../components/attendance/AttendanceConfigTab';
import { AttendanceImportTab } from '../components/attendance/AttendanceImportTab';
import { downloadAttendanceCsv } from '../components/attendance/AttendanceImportPreviewTable';
import { useAttendanceDefaultRule, useAttendanceImportMutations, useAttendanceImports, useAttendanceOverrides } from '../hooks/queries/useAttendance';
import { attendanceTemplateCsv } from '../services/attendance.service';
import { maxAbsentSessions, type AttendanceImportPreview } from '../types/attendance';

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
  const { preview, confirm } = useAttendanceImportMutations();
  const [current, setCurrent] = useState<AttendanceImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setCurrent(null);
    try {
      setCurrent(await preview.mutateAsync(file));
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const rule = defaultRule.data;
  const history = imports.data ?? [];
  const totalRows = history.reduce((sum, item) => sum + item.rowCount, 0);
  const totalWarnings = history.reduce((sum, item) => sum + item.warningCount, 0);
  const totalFails = history.reduce((sum, item) => sum + item.failCount, 0);
  const setTab = (next: Tab) => setParams(next === 'import' ? {} : { tab: next }, { replace: true });

  return (
    <div className="flex w-full flex-col gap-4">
      <AdminTabBar
        ariaLabel="Attendance view"
        activeKey={tab}
        onChange={setTab}
        tabs={TABS.map((t) => ({ key: t.key, label: t.label, icon: t.icon }))}
        actions={
          tab === 'import' ? (
            <>
              <button
                type="button"
                onClick={() => downloadAttendanceCsv('attendance-template.csv', attendanceTemplateCsv())}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50"
              >
                <Download className="size-4 text-gray-500" aria-hidden /> Template
              </button>
              <label
                className={cn(
                  'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14]',
                  preview.isPending && 'pointer-events-none opacity-60',
                )}
              >
                {preview.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
                {preview.isPending ? 'Reading…' : 'Upload file'}
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  aria-label="Upload attendance file"
                  className="sr-only"
                  disabled={preview.isPending}
                  onChange={(e) => {
                    void pickFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
            </>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
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

      {tab === 'import' ? (
        <AttendanceImportTab
          current={current}
          error={error}
          isConfirming={confirm.isPending}
          onConfirm={confirm.mutateAsync}
          onClearCurrent={() => setCurrent(null)}
          onError={setError}
        />
      ) : (
        <AttendanceConfigTab />
      )}
    </div>
  );
}
