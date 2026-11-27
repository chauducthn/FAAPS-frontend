import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Warning as AlertTriangle,
  Stack as Layers,
  ArrowsClockwise as RefreshCw,
  Trash as Trash2,
} from '@phosphor-icons/react';
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
      const label = target === 'ALL' || !target ? 'Database' : target.label;
      setTarget(null);
      setConfirmText('');
      await queryClient.invalidateQueries();
      toast.success(`${label} reset (${res.deletedRows.toLocaleString()} rows · ${res.clearedTables} tables).`);
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
    { label: 'Tables', value: d?.totalTables },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
        {stats.map((item) => (
          <div key={item.label} className="rounded-lg border border-line/80 bg-white px-3.5 py-3 shadow-2xs">
            <p className="text-[11px] font-medium text-ink-muted">{item.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-ink-primary">
              {overviewQuery.isLoading ? '—' : (item.value ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-lg border border-line/80 bg-white shadow-2xs">
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Layers className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-ink-primary">Reset by Module</h3>
          </div>
          <button
            type="button"
            onClick={() => void overviewQuery.refetch()}
            disabled={overviewQuery.isFetching}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-medium text-ink-secondary transition-colors hover:border-brand hover:text-brand-ink disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${overviewQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid gap-2.5 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {(d?.scopes ?? []).map((scope) => (
            <div
              key={scope.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-line/80 bg-surface-page/40 px-3.5 py-3 transition-colors hover:border-ink-subtle/50"
            >
              <div className="min-w-0">
                <h4 className="truncate text-[13px] font-semibold text-ink-primary">{scope.label}</h4>
                <p className="mt-0.5 text-xs tabular-nums text-ink-muted">
                  {scope.rowCount.toLocaleString()} rows · {scope.tables.length} tables
                </p>
              </div>
              <button
                type="button"
                disabled={scope.rowCount === 0}
                onClick={() => openConfirm(scope)}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-line disabled:text-ink-subtle disabled:hover:bg-white"
              >
                <Trash2 className="size-3.5" /> Reset
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200/90 bg-red-50/40 px-4 py-3.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <AlertTriangle className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-red-900">Reset Entire Database</h3>
            <p className="text-xs text-red-700/80">
              Keeps <span className="font-mono font-semibold">{d?.preservedAdminEmail ?? 'current admin'}</span>, roles &amp; categories.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openConfirm('ALL')}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
        >
          <Trash2 className="size-3.5" /> Reset all
        </button>
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
