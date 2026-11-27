import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowsClockwise as RefreshCw } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { toastBadRequest } from '@/shared/lib/apiError';
import { databaseService, type DatabaseResetScope } from '../services/database.service';
import { DatabaseResetColumn } from '../components/DatabaseResetColumn';
import { DatabaseResetModal } from '../components/DatabaseResetModal';
import { DatabaseStatusColumn } from '../components/DatabaseStatusColumn';

const DB_KEY = ['admin', 'database', 'overview'] as const;

const REFRESH_BTN_CLASS =
  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3 ' +
  'text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-50';

export default function DatabaseManagementPage() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<DatabaseResetScope | 'ALL' | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const overviewQuery = useQuery({ queryKey: DB_KEY, queryFn: databaseService.getOverview });

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

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
          Database Management
        </h2>
        <button
          type="button"
          onClick={() => void overviewQuery.refetch()}
          disabled={overviewQuery.isFetching}
          className={REFRESH_BTN_CLASS}
        >
          <RefreshCw className={`size-4 ${overviewQuery.isFetching ? 'animate-spin' : ''}`} aria-hidden />
          Refresh
        </button>
      </div>

      <div className="admin-fill">
        <div
          className={
            'grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain ' +
            'xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:grid-rows-[minmax(0,1fr)] xl:overflow-hidden'
          }
        >
          <DatabaseStatusColumn
            data={d}
            isLoading={overviewQuery.isLoading}
            isError={overviewQuery.isError}
            dataUpdatedAt={overviewQuery.dataUpdatedAt}
          />
          <DatabaseResetColumn
            scopes={d?.scopes ?? []}
            preservedAdminEmail={d?.preservedAdminEmail}
            isLoading={overviewQuery.isLoading}
            isError={overviewQuery.isError}
            onRetry={() => void overviewQuery.refetch()}
            onResetScope={(scope) => openConfirm(scope)}
            onResetAll={() => openConfirm('ALL')}
          />
        </div>
      </div>

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
