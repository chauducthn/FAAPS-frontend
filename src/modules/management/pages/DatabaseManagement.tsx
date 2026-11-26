import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Database, Loader2, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/shared/components/ui/Modal';
import { toastBadRequest } from '@/shared/lib/apiError';
import { databaseService } from '../services/database.service';

const DB_KEY = ['admin', 'database', 'overview'] as const;

export default function DatabaseManagementPage() {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const overviewQuery = useQuery({
    queryKey: DB_KEY,
    queryFn: databaseService.getOverview,
  });

  const resetMutation = useMutation({
    mutationFn: () => databaseService.resetDatabase(confirmText.trim()),
    onSuccess: async (res) => {
      setConfirmOpen(false);
      setConfirmText('');
      await queryClient.invalidateQueries();
      toast.success(
        `Database cleared (${res.deletedRows} rows across ${res.clearedTables} tables). Kept ${res.preservedAdminEmail}.`,
      );
    },
    onError: (err) => toastBadRequest(err),
  });

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

  const canConfirm = confirmText.trim().toUpperCase() === 'RESET' && !resetMutation.isPending;

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

      <section className="overflow-hidden rounded-2xl border border-red-200/90 bg-white shadow-2xs">
        <div className="flex items-start gap-3 border-b border-red-100 bg-red-50/60 px-6 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <AlertTriangle className="size-4.5" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-red-900">Danger Zone — Reset Database</h3>
            <p className="mt-0.5 text-[13px] text-red-700/90">
              Permanently delete all operational data across the database and start fresh.
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
                ) along with system roles and course categories so you can keep signing in and creating data.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setConfirmText(''); setConfirmOpen(true); }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="size-4" /> Reset database
            </button>
          </div>
        </div>
      </section>

      <Modal
        open={confirmOpen}
        onClose={() => !resetMutation.isPending && setConfirmOpen(false)}
        title="Confirm database reset"
        className="max-w-md"
      >
        <div className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-200/70">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">Reset entire database?</h3>
              <p className="mt-1 text-[13px] text-gray-600">
                This action cannot be undone. Every record will be deleted except your admin account (
                <span className="font-mono font-medium text-gray-900">{d?.preservedAdminEmail}</span>).
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-reset-input" className="mb-1.5 block text-xs font-medium text-gray-700">
              Type <span className="font-mono font-bold text-red-600">RESET</span> to confirm
            </label>
            <input
              id="confirm-reset-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESET"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 font-mono text-[13px] uppercase focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={resetMutation.isPending}
              onClick={() => setConfirmOpen(false)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => resetMutation.mutate()}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-4 text-[13px] font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resetMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {resetMutation.isPending ? 'Resetting…' : 'Confirm reset'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
