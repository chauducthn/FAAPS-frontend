import { useMemo, useState } from 'react';
import { Settings2, WandSparkles } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { StaticTable, type StaticColumn } from '../../../shared/components/common/table/StaticTable';
import type { SummaryCohort } from '../types/admin';
import { AssignmentModalHeader } from './AssignmentModalChrome';
import { cn } from '@/shared/lib/utils';

interface CohortPickerModalProps {
  open: boolean;
  cohorts: SummaryCohort[];
  poolCountByCohort?: Map<string, number>;
  onClose: () => void;
  onPick: (cohort: SummaryCohort) => void;
  onConfigurePool?: (cohort: SummaryCohort) => void;
}

export function CohortPickerModal({
  open,
  cohorts,
  poolCountByCohort,
  onClose,
  onPick,
  onConfigurePool,
}: CohortPickerModalProps) {
  const [majorFilter, setMajorFilter] = useState('');
  const waiting = useMemo(() => cohorts.filter((c) => c.unassigned > 0), [cohorts]);
  const majors = useMemo(() => [...new Set(waiting.map((c) => c.majorCode))].sort(), [waiting]);
  const rows = useMemo(
    () => (majorFilter ? waiting.filter((c) => c.majorCode === majorFilter) : waiting),
    [waiting, majorFilter],
  );

  const columns: StaticColumn<SummaryCohort>[] = [
    {
      key: 'major',
      header: 'Major',
      render: (cohort) => (
        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
          {cohort.majorCode}
        </span>
      ),
    },
    {
      key: 'cohort',
      header: 'Cohort',
      render: (cohort) => <span className="font-semibold text-gray-900">{cohort.cohort}</span>,
    },
    {
      key: 'pool',
      header: 'Advisor pool',
      render: (cohort) => {
        const count = poolCountByCohort?.get(cohort.cohortId) ?? 0;
        return count > 0 ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/70 tabular-nums">
            {count} advisor{count === 1 ? '' : 's'}
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200/80">
            Not set
          </span>
        );
      },
    },
    {
      key: 'coverage',
      header: 'Coverage',
      render: (cohort) => {
        const pct = cohort.total > 0 ? Math.round((cohort.assigned / cohort.total) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs tabular-nums text-gray-600">{cohort.assigned}/{cohort.total}</span>
          </div>
        );
      },
    },
    {
      key: 'unassigned',
      header: 'Unassigned',
      render: (cohort) => <span className="font-semibold tabular-nums text-amber-700">{cohort.unassigned}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (cohort) => {
        const hasPool = (poolCountByCohort?.get(cohort.cohortId) ?? 0) > 0;
        return (
          <div className="flex justify-end gap-1.5">
            {onConfigurePool && (
              <button
                type="button"
                onClick={() => onConfigurePool(cohort)}
                aria-label={`Configure advisors for ${cohort.majorCode} ${cohort.cohort}`}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Settings2 className="size-3.5 text-gray-400" aria-hidden />
                Pool
              </button>
            )}
            <button
              type="button"
              onClick={() => onPick(cohort)}
              aria-label={`Auto assign ${cohort.majorCode} ${cohort.cohort}`}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors',
                hasPool
                  ? 'border-orange-200 bg-orange-50/70 text-[#C2410C] hover:border-[#F26F21] hover:bg-[#F26F21] hover:text-white'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700',
              )}
            >
              <WandSparkles className="size-3.5" aria-hidden />
              Auto
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Auto assign" className="max-w-3xl">
      <AssignmentModalHeader
        icon={WandSparkles}
        title="Auto assign"
        subtitle="Configure each cohort's advisor pool, then distribute unassigned students evenly."
        onClose={onClose}
      />
      <div className="flex max-h-[72vh] flex-col gap-3 overflow-y-auto px-6 py-5">
        {majors.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(['', ...majors] as string[]).map((m) => {
              const active = majorFilter === m;
              return (
                <button
                  key={m || 'all'}
                  type="button"
                  onClick={() => setMajorFilter(m)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                    active
                      ? 'bg-orange-50 text-[#C2410C] ring-1 ring-inset ring-orange-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70',
                  )}
                >
                  {m || `All majors (${waiting.length})`}
                </button>
              );
            })}
          </div>
        )}

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">Every student has an advisor.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200/80">
            <StaticTable
              columns={columns}
              rows={rows}
              rowKey={(cohort) => cohort.cohortId}
              emptyTitle="Every student has an advisor."
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
