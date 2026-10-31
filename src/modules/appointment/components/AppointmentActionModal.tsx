// src/components/appointments/AppointmentActionModal.tsx
// Chi tiết lịch hẹn của advisor — đồng bộ style Student360Modal (hero cam FPT):
// Accept/Reject (pending) · Cancel (bắt buộc lý do) · Complete (bắt buộc consultation summary)
// · No-show · Xem/sửa Consultation Summary khi đã hoàn thành.

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquareWarning,
  User,
  UserX,
  XCircle,
} from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { BookingStatusBadge } from './AppointmentBits';
import { formatIsoDay, formatIsoTime } from '../../../shared/lib/appointmentDate';
import { useUpdateAppointmentStatusMutation } from '../hooks/mutations/useAppointmentMutations';
import type { AdvisorAppointment } from '../types/appointment';
import { cn } from '@/shared/lib/utils';
import { useAdvisorAppointmentDetail } from '../hooks/queries/useAppointmentQueries';

interface AppointmentActionModalProps {
  appointment: AdvisorAppointment | null;
  onClose: () => void;
}

type Mode = 'idle' | 'reject' | 'cancel' | 'complete' | 'editSummary';

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AppointmentActionModal({ appointment, onClose }: AppointmentActionModalProps) {
  const [mode, setMode] = useState<Mode>('idle');
  const [reason, setReason] = useState('');
  const [summary, setSummary] = useState('');
  const [touched, setTouched] = useState(false);
  const mutation = useUpdateAppointmentStatusMutation();
  const detailQuery = useAdvisorAppointmentDetail(appointment?.id ?? null);

  useEffect(() => {
    if (!appointment) return;
    setMode('idle');
    setReason('');
    setSummary('');
    setTouched(false);
  }, [appointment?.id]);

  const shown: AdvisorAppointment | null = useMemo(
    () => detailQuery.data ?? appointment,
    [detailQuery.data, appointment],
  );

  useEffect(() => {
    if (shown) setSummary(shown.consultationSummary ?? '');
  }, [shown?.id, shown?.consultationSummary]);

  if (!appointment || !shown) return null;

  const isPending = shown.status === 'PENDING';
  const isAccepted = shown.status === 'ACCEPTED';
  const isCompleted = shown.status === 'COMPLETED';

  const reasonMissing = (mode === 'reject' || mode === 'cancel') && touched && reason.trim().length === 0;
  const summaryMissing = (mode === 'complete' || mode === 'editSummary') && touched && summary.trim().length === 0;

  const resetForm = () => {
    setMode('idle');
    setReason('');
    setTouched(false);
  };

  const runMutation = (body: Parameters<typeof mutation.mutate>[0]['body'], keepOpen = false) => {
    mutation.mutate(
      { id: shown.id, body },
      {
        onSuccess: () => {
          if (keepOpen) {
            setMode('idle');
            setTouched(false);
          } else {
            onClose();
          }
        },
      },
    );
  };

  const handleAccept = () => runMutation({ status: 'ACCEPTED' });
  const handleReject = () => {
    setTouched(true);
    if (reason.trim().length === 0) return;
    runMutation({ status: 'REJECTED', reason: reason.trim() });
  };
  const handleCancel = () => {
    setTouched(true);
    if (reason.trim().length === 0) return;
    runMutation({ status: 'CANCELLED', reason: reason.trim() });
  };
  const handleNoShow = () => runMutation({ status: 'NO_SHOW' });
  const handleComplete = () => {
    setTouched(true);
    if (summary.trim().length === 0) return;
    runMutation({ status: 'COMPLETED', consultationSummary: summary.trim() });
  };
  const handleSaveSummary = () => {
    setTouched(true);
    if (summary.trim().length === 0) return;
    runMutation({ status: 'COMPLETED', consultationSummary: summary.trim() }, true);
  };

  const reasonLabel = mode === 'cancel' ? 'Lý do hủy lịch' : 'Lý do từ chối';

  return (
    <Modal open={!!appointment} onClose={onClose} title="Appointment details" className="max-w-2xl">
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        {/* Hero cam FPT — đồng bộ Student360Modal */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#F26F21] to-[#ff8f3f] px-6 pb-5 pt-6 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-white/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 right-24 size-32 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/95 text-lg font-bold text-[#F26F21] shadow">
              {initialsOf(shown.studentName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
                Appointment · {shown.studentCode ?? '—'}
              </p>
              <h2 className="mt-0.5 truncate text-xl font-bold">{shown.studentName}</h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-white/90">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {formatIsoDay(shown.startTime)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden />
                  {formatIsoTime(shown.startTime)} – {formatIsoTime(shown.endTime)}
                </span>
              </p>
            </div>
            <BookingStatusBadge status={shown.status} />
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-auto bg-[#fafbfd] p-5">
          <div className="space-y-4">
            <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-2">
              <p className="flex items-center gap-2 text-sm">
                <User className="size-4 shrink-0 text-[#F26F21]" aria-hidden />
                <span className="text-slate-500">Student:</span>
                <strong className="truncate">{shown.studentName}</strong>
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Clock className="size-4 shrink-0 text-[#F26F21]" aria-hidden />
                <span className="text-slate-500">Duration:</span>
                <strong>30 min</strong>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <h3 className="text-sm font-bold text-[#151c27]">Lý do đặt lịch</h3>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#f7f8fa] px-4 py-3 text-sm text-[#151c27]">
                {shown.reason || 'No reason provided.'}
              </p>
            </div>

            {shown.decisionNote && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
                  <MessageSquareWarning className="size-4 text-[#F26F21]" aria-hidden />
                  Ghi chú quyết định
                </h3>
                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#fff7f0] px-4 py-3 text-sm text-[#9a4a12]">
                  {shown.decisionNote}
                </p>
              </div>
            )}

            {/* Consultation Summary — hiển thị khi COMPLETED, form nhập khi complete/edit */}
            {(isCompleted || mode === 'complete' || mode === 'editSummary') && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
                  <FileText className="size-4 text-[#F26F21]" aria-hidden />
                  Tóm tắt buổi tư vấn (Consultation Summary)
                  {isCompleted && mode !== 'editSummary' && (
                    <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                      Completed
                    </span>
                  )}
                </h3>

                {mode === 'complete' || mode === 'editSummary' ? (
                  <div className="mt-3 flex flex-col gap-1.5">
                    <label htmlFor="consultation-summary" className="text-xs font-semibold text-slate-600">
                      Nội dung tóm tắt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="consultation-summary"
                      rows={4}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      onBlur={() => setTouched(true)}
                      maxLength={1000}
                      placeholder="Ghi lại nội dung đã tư vấn, quyết định đã chốt và bước tiếp theo cho sinh viên..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-slate-400 focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]/40"
                    />
                    <p className={cn('text-[11px]', summaryMissing ? 'font-semibold text-red-500' : 'text-slate-400')}>
                      {summaryMissing
                        ? 'Vui lòng nhập tóm tắt trước khi hoàn thành.'
                        : 'Sinh viên sẽ thấy tóm tắt này trong lịch sử của mình.'}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    {shown.consultationSummary ? (
                      <p className="whitespace-pre-wrap rounded-xl bg-blue-50/60 px-4 py-3 text-sm text-slate-700">
                        {shown.consultationSummary}
                      </p>
                    ) : (
                      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                        Chưa có tóm tắt cho buổi hẹn này.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Form lý do Hủy / Từ chối */}
            {(mode === 'reject' || mode === 'cancel') && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <label htmlFor="cancel-reason" className="text-xs font-semibold text-slate-600">
                  {reasonLabel} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cancel-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onBlur={() => setTouched(true)}
                  maxLength={300}
                  placeholder={
                    mode === 'cancel'
                      ? 'Nhập lý do hủy để sinh viên chủ động đặt lại lịch...'
                      : 'Cho sinh viên biết vì sao yêu cầu này không được chấp nhận...'
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-slate-400 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
                <p className={cn('mt-1 text-[11px]', reasonMissing ? 'font-semibold text-red-500' : 'text-slate-400')}>
                  {reasonMissing ? 'Bắt buộc nhập lý do.' : 'Sinh viên sẽ thấy ghi chú này.'}
                </p>
              </div>
            )}

            {/* Gợi ý ngữ cảnh */}
            {isAccepted && mode === 'idle' && (
              <p className="rounded-xl border border-dashed border-[#F26F21]/30 bg-[#fff7f0] px-3 py-2 text-xs text-[#9a4a12]">
                Ca hẹn đã được chấp nhận — bạn có thể Hủy (báo trước cho sinh viên), đánh dấu Hoàn thành kèm
                tóm tắt, hoặc đánh dấu Vắng mặt nếu sinh viên không tham gia.
              </p>
            )}
            {isPending && mode === 'idle' && (
              <p className="rounded-xl border border-dashed border-[#F26F21]/30 bg-[#fff7f0] px-3 py-2 text-xs text-[#9a4a12]">
                Yêu cầu đang chờ phản hồi — chấp nhận để giữ lịch, hoặc từ chối kèm lý do rõ ràng.
              </p>
            )}
          </div>
        </div>

        {/* Footer — nút hành động theo trạng thái */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-white px-5 py-3.5">
          <button
            type="button"
            onClick={mode === 'idle' ? onClose : resetForm}
            disabled={mutation.isPending}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {mode === 'idle' ? 'Close' : 'Back'}
          </button>

          {isPending && mode === 'idle' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode('reject');
                  setTouched(false);
                }}
                disabled={mutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="size-4" aria-hidden />
                Reject
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={mutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" aria-hidden />
                {mutation.isPending ? 'Updating...' : 'Accept'}
              </button>
            </>
          )}

          {isPending && mode === 'reject' && (
            <button
              type="button"
              onClick={handleReject}
              disabled={mutation.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Rejecting...' : 'Confirm rejection'}
            </button>
          )}

          {isAccepted && mode === 'idle' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode('cancel');
                  setTouched(false);
                }}
                disabled={mutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <XCircle className="size-4" aria-hidden />
                Hủy lịch
              </button>
              <button
                type="button"
                onClick={handleNoShow}
                disabled={mutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700 transition-colors hover:bg-purple-100 disabled:opacity-50"
              >
                <UserX className="size-4" aria-hidden />
                Vắng mặt
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('complete');
                  setTouched(false);
                }}
                disabled={mutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Hoàn thành
              </button>
            </>
          )}

          {isAccepted && mode === 'cancel' && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={mutation.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Cancelling...' : 'Xác nhận hủy'}
            </button>
          )}

          {isAccepted && mode === 'complete' && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" aria-hidden />
              {mutation.isPending ? 'Saving...' : 'Xác nhận hoàn thành'}
            </button>
          )}

          {isCompleted && mode === 'idle' && (
            <button
              type="button"
              onClick={() => {
                setMode('editSummary');
                setTouched(false);
              }}
              disabled={mutation.isPending}
              className="rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
            >
              Sửa tóm tắt
            </button>
          )}

          {isCompleted && mode === 'editSummary' && (
            <button
              type="button"
              onClick={handleSaveSummary}
              disabled={mutation.isPending}
              className="rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Lưu tóm tắt'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
