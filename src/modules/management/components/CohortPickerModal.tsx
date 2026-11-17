import { WandSparkles } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
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
            <table className="w-full text-left text-sm">
              <thead className="bg-[rgba(240,243,255,0.7)] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
                <tr>
                  <th className="px-4 py-2.5">Cohort</th>
                  <th className="px-4 py-2.5">Students</th>
                  <th className="px-4 py-2.5">Unassigned</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {waiting.map((c) => (
                  <tr key={c.cohortId} className="border-t border-[#e7eefe]">
                    <td className="px-4 py-2.5 font-semibold text-[#151c27]">
                      {c.majorCode} {c.cohort}
                    </td>
                    <td className="px-4 py-2.5 text-[#555f6f]">{c.total}</td>
                    <td className="px-4 py-2.5 font-semibold text-[#b45309]">{c.unassigned}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => onPick(c)}
                        aria-label={`Auto assign ${c.majorCode} ${c.cohort}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
                      >
                        <WandSparkles className="size-4" aria-hidden />
                        Auto
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
