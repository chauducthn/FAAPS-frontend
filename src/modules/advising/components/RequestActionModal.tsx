// Modal for advisors to accept or reject an advising request.

import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { useUpdateAdvisingRequestStatus } from '../hooks/mutations/useAdvisingMutations';
import type { AdvisingRequest } from '../types/advising';
import { cn } from '@/shared/lib/utils';
import { RequestActionFooter, RequestActionHero } from './RequestActionChrome';

type Decision = 'accept' | 'reject';

interface Props {
  request: AdvisingRequest | null;
  decision: Decision;
  onClose: () => void;
}

const MAX_NOTE = 1000;

export function RequestActionModal({ request, decision, onClose }: Props) {
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const updateMutation = useUpdateAdvisingRequestStatus();

  useEffect(() => {
    setNote('');
    setTouched(false);
  }, [request, decision]);

  if (!request) return null;

  const isReject = decision === 'reject';
  const summaryMissing = touched && note.trim().length === 0;
  const summaryEmpty = note.trim().length === 0;

  const handleSubmit = async () => {
    setTouched(true);
    if (note.trim().length === 0) return;

    try {
      await updateMutation.mutateAsync({
        id: request.id,
        body: {
          status: isReject ? 'IN_PROGRESS' : 'RESOLVED',
          resolutionSummary: note.trim(),
        },
      });
      onClose();
    } catch {
      // Error feedback is handled by the mutation hook; keep modal open.
    }
  };

  return (
    <Modal
      open={!!request}
      onClose={onClose}
      title={isReject ? 'Reject Request' : 'Accept Request'}
      className="max-w-2xl"
    >
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        <RequestActionHero request={request} />

        <div className="min-h-0 flex-1 overflow-auto bg-[#fafbfd] p-5">
          <div className="space-y-4">
            {request.description && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <h3 className="text-sm font-bold text-[#151c27]">Description</h3>
                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#f7f8fa] px-4 py-3 text-sm leading-relaxed text-slate-700">
                  {request.description}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <label htmlFor="request-note" className="text-xs font-semibold text-slate-600">
                {isReject ? 'Reason for rejection' : 'Resolution summary'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="request-note"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => setTouched(true)}
                maxLength={MAX_NOTE}
                placeholder={
                  isReject
                    ? 'Explain the reason so the student can make adjustments...'
                    : 'Summarise the outcome for the student...'
                }
                className={cn(
                  'mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-[#151c27]',
                  'outline-none placeholder:text-slate-400 focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]/40',
                )}
              />
              <div className="mt-1 flex items-center justify-between">
                <p className={cn('text-[11px]', summaryMissing ? 'font-semibold text-red-500' : 'text-slate-400')}>
                  {summaryMissing
                    ? 'A resolution summary is required.'
                    : isReject
                      ? 'The student will see this reason.'
                      : 'The student will see this summary.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {note.length}/{MAX_NOTE}
                </p>
              </div>
            </div>

            {isReject ? (
              <p className="rounded-xl border border-dashed border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-600">
                Rejected requests move to the In progress tab — the reason above is required.
              </p>
            ) : (
              <p className="rounded-xl border border-dashed border-[#F26F21]/30 bg-[#fff7f0] px-3 py-2 text-xs text-[#9a4a12]">
                Accepted requests are marked Resolved — the student is notified immediately.
              </p>
            )}
          </div>
        </div>

        <RequestActionFooter
          isReject={isReject}
          isPending={updateMutation.isPending}
          summaryEmpty={summaryEmpty}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
}
