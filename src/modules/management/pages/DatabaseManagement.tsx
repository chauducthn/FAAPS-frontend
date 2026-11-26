import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Warning as AlertTriangle, Database, Stack as Layers, ArrowsClockwise as RefreshCw, ShieldCheck, Trash as Trash2 } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { toastBadRequest } from '@/shared/lib/apiError';
import { databaseService, type DatabaseResetScope } from '../services/database.service';
import { DatabaseResetModal } from '../components/DatabaseResetModal';

const DB_KEY = ['admin', 'database', 'overview'] as const;

export default function DatabaseManagementPage() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<DatabaseResetScope | 'ALL' | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const overviewQuery = useQuery({
    queryKey: DB_KEY,
    queryFn: databaseService.getOverview,
  });

  const resetMutation = useMutation({
    mutationFn: () => {
      const scopeId = target === 'ALL' || !target ? 'ALL' : target.id;
      return databaseService.resetDatabase(confirmText.trim(), scopeId);
    },
    onSuccess: async (res) => {
      const label = target === 'ALL' || !target ? 'Entire database' : target.label;
      setTarget(null);
      setConfirmText('');
      await queryClient.invalidateQueries();
      toast.success(
        `${label} reset (${res.deletedRows.toLocaleString()} rows cleared across ${res.clearedTables} tables).`,
      );
    },
    onError: (err) => toastBadRequest(err),
  });

  const openConfirm = (next: DatabaseResetScope | 'ALL') => {
    setConfirmText('');
    setTarget(next);
  };

  const d = overviewQuery.data;
  const stats = [
    { label: 'Users', value: d?.users },
    { label: 'Students', value: d?.students },
    { label: 'Advisors', value: d?.advisors },
    { label: 'Majors', value: d?.majors },
    { label: 'Cohorts', value: d?.cohorts },
    { label: 'Courses', value: d?.courses },
    { label: 'Semesters', value: d?.semesters },
    { label: 'Total tables', value: d?.totalTables },
  ];

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Database Overview</h2>
          <p className="text-[13px] text-gray-500">Live row counts across core tables in the FAAPS database.</p>
        </div>
        <button
          type="button"
          onClick={() => void overviewQuery.refetch()}
          disabled={overviewQuery.isFetching}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${overviewQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs">
            <p className="text-xs font-medium text-gray-500">{item.label}</p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900">
              {overviewQuery.isLoading ? '—' : (item.value ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
            <Layers className="size-4" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Reset by Module</h3>
            <p className="text-xs text-gray-500">
              Clear individual modules safely with foreign-key dependencies handled automatically.
            </p>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {(d?.scopes ?? []).map((scope) => (
            <div
              key={scope.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200/80 bg-gray-50/40 p-4 transition-colors hover:border-gray-300"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[13px] font-bold text-gray-900">{scope.label}</h4>
                  <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-gray-600 ring-1 ring-gray-200">
                    {scope.rowCount.toLocaleString()} rows
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{scope.description}</p>
                <p className="mt-1.5 text-[11px] font-medium text-emerald-700">{scope.preserves}</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200/60 pt-2.5">
                <span className="text-[11px] text-gray-400">{scope.tables.length} tables</span>
                <button
                  type="button"
                  disabled={scope.rowCount === 0}
                  onClick={() => openConfirm(scope)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-white"
                >
                  <Trash2 className="size-3.5" /> Reset
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-red-200/90 bg-white shadow-2xs">
        <div className="flex items-start gap-3 border-b border-red-100 bg-red-50/60 px-6 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <AlertTriangle className="size-4.5" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-red-900">Danger Zone — Reset Entire Database</h3>
            <p className="mt-0.5 text-[13px] text-red-700/90">
              Permanently delete all operational data across every table and start fresh.
            </p>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5 text-[13px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-4">
              <p className="flex items-center gap-1.5 font-semibold text-gray-900">
                <Database className="size-4 text-red-500" /> Will be wiped
              </p>
              <p className="mt-1.5 leading-relaxed text-gray-600">
                All students, advisors, majors, cohorts, curriculums, courses, prerequisites, semesters, attendance
                records, advising threads, appointments, AI logs, and notifications.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4">
              <p className="flex items-center gap-1.5 font-semibold text-emerald-900">
                <ShieldCheck className="size-4 text-emerald-600" /> Will be preserved
              </p>
              <p className="mt-1.5 leading-relaxed text-emerald-800/90">
                Only your current Admin account (
                <span className="font-mono font-semibold">{d?.preservedAdminEmail ?? 'current admin'}</span>
                ) along with system roles and course categories.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => openConfirm('ALL')}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="size-4" /> Reset entire database
            </button>
          </div>
        </div>
      </section>

      <DatabaseResetModal
        open={target !== null}
        target={target}
        preservedAdminEmail={d?.preservedAdminEmail}
        confirmText={confirmText}
        isPending={resetMutation.isPending}
        onConfirmTextChange={setConfirmText}
        onClose={() => setTarget(null)}
        onConfirm={() => resetMutation.mutate()}
      />
    </div>
  );
}
