// src/components/advising/RequestActionModal.tsx
// Modal cố vấn Chấp nhận / Từ chối một yêu cầu tư vấn — đồng bộ AppointmentActionModal / Student360Modal:
// hero cam FPT + body bg-[#fafbfd] + cards rounded-2xl + footer chuẩn.
//
// Mapping trạng thái (DB không có ACCEPTED/REJECTED):
//   Chấp nhận → status = 'RESOLVED'
//   Từ chối   → status = 'CANCELLED'  (bắt buộc có resolutionSummary)

import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, User, XCircle } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { RequestStatusBadge } from './RequestStatusBadge';
import { REQUEST_TYPE_LABELS } from './RequestTypeLabel';
import { useUpdateAdvisingRequestStatus } from '../hooks/mutations/useAdvisingMutations';
import type { AdvisingRequest } from '../types/advising';
import { cn } from '@/shared/lib/utils';

type Decision = 'accept' | 'reject';

interface Props {
  request: AdvisingRequest | null;
  decision: Decision;
  onClose: () => void;
}

const MAX_NOTE = 1000;

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

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
  const noteMissing = isReject && touched && note.trim().length === 0;

  const handleSubmit = async () => {
    setTouched(true);
    if (isReject && note.trim().length === 0) return;

    try {
      await updateMutation.mutateAsync({
        id: request.id,
        body: {
          status: isReject ? 'CANCELLED' : 'RESOLVED',
          resolutionSummary: note.trim() || undefined,
        },
      });
      onClose();
    } catch {
      // Lỗi hiển thị bởi mutation / global handler; giữ modal mở để sửa.
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
        {/* Hero cam FPT — đồng bộ Student360Modal / AppointmentActionModal */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#F26F21] to-[#ff8f3f] px-6 pb-5 pt-6 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-white/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 right-24 size-32 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/95 text-lg font-bold text-[#F26F21] shadow">
              {initialsOf(request.studentName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
                {REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType} · {request.studentCode ?? '—'}
              </p>
              <h2 className="mt-0.5 truncate text-xl font-bold">{request.title}</h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-white/90">
                <span className="inline-flex items-center gap-1">
                  <User className="size-3.5" aria-hidden />
                  {request.studentName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {formatDateTime(request.createdAt)}
                </span>
              </p>
            </div>
            <RequestStatusBadge status={request.status} className="bg-white/95 ring-white/40" />
          </div>
        </div>

        {/* Body */}
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
                {isReject ? 'Reason for rejection' : 'Note to student'}{' '}
                {isReject && <span className="text-red-500">*</span>}
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
                    : 'Add an optional note for the student...'
                }
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-slate-400 focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]/40"
              />
              <div className="mt-1 flex items-center justify-between">
                <p className={cn('text-[11px]', noteMissing ? 'font-semibold text-red-500' : 'text-slate-400')}>
                  {noteMissing ? 'A rejection reason is required.' : isReject ? 'The student will see this reason.' : 'The student will see this note.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {note.length}/{MAX_NOTE}
                </p>
              </div>
            </div>

            {isReject && (
              <p className="rounded-xl border border-dashed border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-600">
                Rejected requests move to the Resolved tab with a Rejected badge — the reason above is required.
              </p>
            )}
            {!isReject && (
              <p className="rounded-xl border border-dashed border-[#F26F21]/30 bg-[#fff7f0] px-3 py-2 text-xs text-[#9a4a12]">
                Accepted requests are marked Resolved — the student is notified immediately.
              </p>
            )}
          </div>
        </div>

        {/* Footer — đồng bộ AppointmentActionModal */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-white px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Close
          </button>
          {isReject ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="size-4" aria-hidden />
              {updateMutation.isPending ? 'Rejecting...' : 'Confirm rejection'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" aria-hidden />
              {updateMutation.isPending ? 'Saving...' : 'Confirm acceptance'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
