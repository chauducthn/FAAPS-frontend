// src/modules/appointment/components/AdvisorScheduleModal.tsx
// Form đặt lịch hẹn của CỐ VẤN (khác với form của sinh viên ở BookAppointment).
//
// Được mở từ nút "Schedule Appointment" trong Ticket Detail
// (`AdvisorRequestDetailModal`). Lịch hẹn được gắn với ticket gốc qua
// `advisingRequestId` ⇒ BE ghi vào `advising_sessions.advising_request_id`,
// nên ticket đó sẽ hiện card "Lịch hẹn đã được đặt".

import { useMemo, useState } from 'react';
import { CalendarPlus, Clock, PaperPlaneTilt as Send } from '@phosphor-icons/react';
import { Modal } from '@/shared/components/ui/Modal';
import { formatColumnDay, formatIsoTime, toDateKey } from '@/shared/lib/appointmentDate';
import { DateSelector } from './DateSelector';
import { TimeSlotPicker } from './TimeSlotPicker';
import { useAvailableSlots } from '../hooks/queries/useAppointmentQueries';
import { useScheduleAppointmentMutation } from '../hooks/mutations/useAppointmentMutations';
import { useAuth } from '../../auth/stores/useAuth';

const MAX_REASON = 500;

interface AdvisorScheduleModalProps {
  open: boolean;
  /** students.user_id — sinh viên sẽ tham gia buổi tư vấn. */
  studentId: string | null;
  studentName?: string | null;
  /** advising_requests.id — ticket gốc (optional). */
  advisingRequestId?: string | null;
  onClose: () => void;
  /** Được gọi sau khi đặt lịch thành công (để refresh ticket). */
  onScheduled?: () => void;
}

export function AdvisorScheduleModal({
  open,
  studentId,
  studentName,
  advisingRequestId,
  onClose,
  onScheduled,
}: AdvisorScheduleModalProps) {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const advisorId = useAuth((s) => s.user?.id);

  // Chỉ tải slot khi modal mở. Lịch rảnh luôn thuộc về CỐ VẤN đang đăng nhập
  // (BE đọc advisor_availability theo advisorId), nên truyền advisorId vào.
  const slotsQuery = useAvailableSlots(open && advisorId ? date : null, advisorId);
  const mutation = useScheduleAppointmentMutation();

  const selectedSlot = useMemo(
    () => (slotsQuery.data ?? []).find((s) => s.startTime === slot),
    [slotsQuery.data, slot],
  );

  const reasonMissing = touched && reason.trim().length === 0;
  const canSubmit = !!slot && reason.trim().length > 0 && !mutation.isPending && !!studentId;

  const close = () => {
    setSlot(null);
    setReason('');
    setTouched(false);
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit || !studentId) return;

    mutation.mutate(
      {
        studentId,
        startTime: slot as string,
        reason: reason.trim(),
        // Cố vấn đang đăng nhập là người nhận buổi tư vấn.
        advisorId: advisorId ?? undefined,
        // Gửi kèm alias để tương thích với cả 2 dạng contract của BE:
        //   • `startTime` / `reason`    (kiểu BookAppointmentDto)
        //   • `scheduledAt` / `agenda`  (kiểu ProactiveAppointmentRequest)
        scheduledAt: slot as string,
        agenda: reason.trim(),
        // Chỉ gửi khi có ticket gốc ⇒ BE gắn lịch hẹn vào ticket.
        ...(advisingRequestId ? { advisingRequestId } : {}),
      },
      {
        onSuccess: () => {
          onScheduled?.();
          close();
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={close} title="Schedule appointment" className="max-w-[640px]">
      <div className="border-b border-[#f1f5f9] p-5">
        <h2 className="text-lg font-semibold text-[#151c27]">Schedule an appointment</h2>
        <p className="mt-1 text-[13px] text-[#555f6f]">
          {studentName ? `Pick a free slot for ${studentName}. ` : 'Pick a free slot. '}
          The student will be notified once the request is sent.
        </p>
      </div>

      <form id="advisor-schedule-form" onSubmit={submit} className="flex-1 space-y-4 overflow-y-auto p-5">
        {advisingRequestId && (
          <p className="rounded-lg border border-orange-200 bg-orange-50 px-3.5 py-2.5 text-[13px] font-medium text-[#9a4a12]">
            This session will be linked to the advising request it came from.
          </p>
        )}

        <DateSelector
          value={date}
          onChange={(next) => {
            setDate(next);
            setSlot(null);
          }}
        />

        <TimeSlotPicker
          slots={slotsQuery.data ?? []}
          value={slot}
          onChange={setSlot}
          isLoading={slotsQuery.isLoading}
          isError={slotsQuery.isError}
          onRetry={() => slotsQuery.refetch()}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="advisor-appointment-reason" className="text-xs font-semibold text-[#555f6f]">
            Agenda <span className="text-red-500">*</span>
          </label>
          <textarea
            id="advisor-appointment-reason"
            rows={4}
            maxLength={MAX_REASON}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setTouched(false);
            }}
            onBlur={() => setTouched(true)}
            required
            placeholder="What should this session cover?"
            className="w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#98a2b3]">
              {reasonMissing ? 'An agenda is required.' : 'The student sees this agenda.'}
            </p>
            <p className="text-[11px] text-[#98a2b3]">
              {reason.length}/{MAX_REASON}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-3 py-2.5 text-[13px] text-[#555f6f]">
          <Clock className="size-4 shrink-0" aria-hidden />
          <span className="font-semibold text-[#151c27]">
            {slot
              ? `${formatColumnDay(new Date(`${date}T00:00:00`))} · ${formatIsoTime(slot)}${
                  selectedSlot ? ` – ${formatIsoTime(selectedSlot.endTime)}` : ''
                }`
              : 'No slot selected'}
          </span>
        </div>
      </form>

      <div className="flex items-center justify-end gap-2 border-t border-[#f1f5f9] p-4">
        <button
          type="button"
          onClick={close}
          className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#555f6f] hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="advisor-schedule-form"
          onClick={submit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CalendarPlus className="size-4" aria-hidden />
          {mutation.isPending ? 'Scheduling...' : 'Schedule appointment'}
        </button>
      </div>
    </Modal>
  );
}
