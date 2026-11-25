import { WandSparkles } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { StaticTable, type StaticColumn } from '../../../shared/components/common/table/StaticTable';
import { cn } from '@/shared/lib/utils';
import type { SummaryCohort } from '../types/admin';

interface CohortPickerModalProps {
  open: boolean;
  cohorts: SummaryCohort[];
  onClose: () => void;
  /** Called with the cohort whose unassigned students should be auto assigned. */
  onPick: (cohort: SummaryCohort) => void;
}

/** Lists the cohorts that still have students without an advisor, each with its own Auto assign button. */
export function CohortPickerModal({ open, cohorts, onClose, onPick }: CohortPickerModalProps) {
  const waiting = cohorts.filter((c) => c.unassigned > 0);

  const columns: StaticColumn<SummaryCohort>[] = [
    {
      key: 'cohort',
      header: 'Cohort',
      render: (cohort) => (
        <span className="font-semibold">
          {cohort.majorCode} {cohort.cohort}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Students',
      render: (cohort) => <span>{cohort.total}</span>,
    },
    {
      key: 'unassigned',
      header: 'Unassigned',
      render: (cohort) => (
        <span className="font-semibold text-[#b45309]">{cohort.unassigned}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (cohort) => (
        <button
          type="button"
          onClick={() => onPick(cohort)}
          aria-label={`Auto assign ${cohort.majorCode} ${cohort.cohort}`}
          className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border',
              'border-[#e5e7eb] px-3 py-1.5 text-[13px]',
              'font-semibold text-[#151c27] hover:bg-gray-50'
            )}
        >
          <WandSparkles className="size-4" aria-hidden />
          Auto
        </button>
      ),
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Auto assign">
      <div className="flex max-h-[80vh] flex-col gap-4 p-6">
        <div>
          <h2 className="text-xl font-semibold text-[#151c27]">Auto assign</h2>
          <p className="mt-1 text-sm text-[#555f6f]">Choose a cohort to share its unassigned students among its advisors.</p>
        </div>

        {waiting.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#555f6f]">Every student has an advisor.</p>
        ) : (
          <div className="overflow-y-auto rounded-lg border border-[#e5e7eb]">
            <StaticTable
              columns={columns}
              rows={waiting}
              rowKey={(cohort) => cohort.cohortId}
              emptyTitle="Every student has an advisor."
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
