// Scrollable details and inline form body for the advisor appointment action modal.

import { Clock, FileText, ChatCenteredDots as MessageSquareWarning, User } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdvisorAppointment } from '../../types/appointment';
import { APPOINTMENT_RESULT_UPDATE_ENABLED, type ActionMode } from './types';
import { AppointmentContextLinks } from './AppointmentContextLinks';

interface AppointmentModalBodyProps {
  appointment: AdvisorAppointment;
  mode: ActionMode;
  reason: string;
  onReasonChange: (value: string) => void;
  summary: string;
  onSummaryChange: (value: string) => void;
  onTouch: () => void;
  reasonMissing: boolean;
  summaryMissing: boolean;
}

export function AppointmentModalBody({
  appointment,
  mode,
  reason,
  onReasonChange,
  summary,
  onSummaryChange,
  onTouch,
  reasonMissing,
  summaryMissing,
}: AppointmentModalBodyProps) {
  const isPending = appointment.status === 'PENDING';
  const isAccepted = appointment.status === 'ACCEPTED';
  const isCompleted = appointment.status === 'COMPLETED';
  const reasonLabel =
    mode === 'cancel' ? 'Reason for cancelling' : mode === 'noShow' ? 'Reason for no-show' : 'Reason for declining';

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#fafbfd] p-5">
      <div className="space-y-4">
        <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-2">
          <p className="flex items-center gap-2 text-sm">
            <User className="size-4 shrink-0 text-[#F26F21]" aria-hidden />
            <span className="text-slate-500">Student:</span>
            <strong className="truncate">{appointment.studentName}</strong>
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Clock className="size-4 shrink-0 text-[#F26F21]" aria-hidden />
            <span className="text-slate-500">Duration:</span>
            <strong>30 min</strong>
          </p>
        </div>

        <AppointmentContextLinks appointment={appointment} />

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <h3 className="text-sm font-bold text-[#151c27]">Booking reason</h3>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#f7f8fa] px-4 py-3 text-sm text-[#151c27]">
            {appointment.reason || 'No reason provided.'}
          </p>
        </div>

        {appointment.decisionNote && (
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
              <MessageSquareWarning className="size-4 text-[#F26F21]" aria-hidden />
              Decision note
            </h3>
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#fff7f0] px-4 py-3 text-sm text-[#9a4a12]">
              {appointment.decisionNote}
            </p>
          </div>
        )}

        {(isCompleted || mode === 'complete' || mode === 'editSummary') && (
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
              <FileText className="size-4 text-[#F26F21]" aria-hidden />
              Consultation summary
              {isCompleted && mode !== 'editSummary' && (
                <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  Completed
                </span>
              )}
            </h3>

            {mode === 'complete' || mode === 'editSummary' ? (
              <div className="mt-3 flex flex-col gap-1.5">
                <label htmlFor="consultation-summary" className="text-xs font-semibold text-slate-600">
                  Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="consultation-summary"
                  rows={4}
                  value={summary}
                  onChange={(e) => onSummaryChange(e.target.value)}
                  onBlur={onTouch}
                  maxLength={1000}
                  placeholder="Record the advice given, the decisions made, and the next steps for the student..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-slate-400 focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]/40"
                />
                <p className={cn('text-[11px]', summaryMissing ? 'font-semibold text-red-500' : 'text-slate-400')}>
                  {summaryMissing
                    ? 'Please enter a summary before completing.'
                    : 'The student will see this summary in their history.'}
                </p>
              </div>
            ) : (
              <div className="mt-2">
                {appointment.consultationSummary ? (
                  <p className="whitespace-pre-wrap rounded-xl bg-blue-50/60 px-4 py-3 text-sm text-slate-700">
                    {appointment.consultationSummary}
                  </p>
                ) : (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                    There is no summary for this appointment yet.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {(mode === 'reject' || mode === 'cancel' || mode === 'noShow') && (
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <label htmlFor="cancel-reason" className="text-xs font-semibold text-slate-600">
              {reasonLabel} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              onBlur={onTouch}
              maxLength={300}
              placeholder={
                mode === 'cancel'
                  ? 'Enter a reason so the student can reschedule proactively...'
                  : mode === 'noShow'
                    ? 'Enter the reason the student did not attend the advising session...'
                    : 'Let the student know why this request was not accepted...'
              }
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-slate-400 focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
            <p className={cn('mt-1 text-[11px]', reasonMissing ? 'font-semibold text-red-500' : 'text-slate-400')}>
              {reasonMissing ? 'A reason is required.' : 'The student will see this note.'}
            </p>
          </div>
        )}

        {isAccepted && mode === 'idle' && (
          <p className="rounded-xl border border-dashed border-[#F26F21]/30 bg-[#fff7f0] px-3 py-2 text-xs text-[#9a4a12]">
            {APPOINTMENT_RESULT_UPDATE_ENABLED
              ? 'Accepted — you can cancel (with notice to the student), mark it completed with a summary, or mark a no-show with a reason.'
              : 'Accepted — you can cancel (with notice to the student). Recording the outcome (completed / no-show) is still being built.'}
          </p>
        )}
        {isPending && mode === 'idle' && (
          <p className="rounded-xl border border-dashed border-[#F26F21]/30 bg-[#fff7f0] px-3 py-2 text-xs text-[#9a4a12]">
            Waiting for your response — accept to hold the slot, or decline with a clear reason.
          </p>
        )}
      </div>
    </div>
  );
}
