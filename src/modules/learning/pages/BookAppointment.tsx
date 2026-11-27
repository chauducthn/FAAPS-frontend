// src/pages/learning/BookAppointment.tsx
// Đặt lịch hẹn (phía sinh viên).
//
// Mô hình Shared Multi-Advisor: SV không bị gán cứng 1 advisor ⇒ trang này cho
// chọn trong danh sách các cố vấn có slot trống. BE đã sort ưu tiên cố vấn
// CÙNG Major Group lên đầu ⇒ hiển thị badge "Recommended · Same Major Group".
//
// Nếu mở từ 1 ticket tư vấn (`?advisingRequestId=<id>`) thì lịch hẹn được
// gắn vào ticket đó ⇒ BE ghi `advising_sessions.advising_request_id` và ticket
// sẽ hiện card "Lịch hẹn đã được đặt".

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CalendarClock, CalendarDays, Clock, Link2, Send, UserRound } from 'lucide-react';
import { DateSelector } from '../../appointment/components/DateSelector';
import { TimeSlotPicker } from '../../appointment/components/TimeSlotPicker';
import { AdvisorPicker } from '../../appointment/components/AdvisorPicker';
import {
  useAvailableSlots,
  useBookableAdvisors,
} from '../../appointment/hooks/queries/useAppointmentQueries';
import { useBookAppointmentMutation } from '../../appointment/hooks/mutations/useAppointmentMutations';
import { formatColumnDay, formatIsoTime, toDateKey } from '../../../shared/lib/appointmentDate';
import { useAuth } from '../../auth/stores/useAuth';
import { useQueries, useQuery } from '@tanstack/react-query';
import { appointmentService } from '../../appointment/services/appointmentService';
import { APPOINTMENT_QUERY_KEYS } from '../../appointment/hooks/queries/useAppointmentQueries';
import { StudentAppointments } from '../components/StudentAppointments';
import { advisingRequestIdFromParams } from '../../advising/utils/appointmentLink';
import { isSameMajorGroup } from '../../appointment/types/advisorOption';

const MAX_REASON = 500;

export default function BookAppointment() {
  const user = useAuth((s) => s.user);
  const [searchParams] = useSearchParams();
  /**
   * Ticket gốc (nếu có) mà lịch hẹn này sẽ được gắn vào.
   *
   * Nguồn: nút "Book Appointment" trong `AdvisingRequestDetailModal` điều hướng
   * tới `/student/appointments?advisingRequestId=<ticketId>`. BE ghi giá trị này
   * vào `advising_sessions.advising_request_id` ⇒ ticket sẽ hiện
   * "Lịch hẹn đã được đặt".
   */
  const advisingRequestId = advisingRequestIdFromParams(searchParams);

  const today = new Date();
  const [date, setDate] = useState(toDateKey(today));
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  /** Cố vấn đang chọn — null ⇒ BE fallback về cố vấn được phân công. */
  const [advisorId, setAdvisorId] = useState<string | null>(null);

  const advisorsQuery = useBookableAdvisors();
  const advisors = useMemo(() => advisorsQuery.data ?? [], [advisorsQuery.data]);

  /**
   * Slot trống của TỪNG cố vấn trong ngày đang chọn.
   *
   * Dùng `useQueries` để gọi song song `/appointments/available-slots` cho mỗi
   * cố vấn ⇒ danh sách hiển thị "N free" / "Full" và SV chỉ chọn được cố vấn
   * thực sự còn slot.
   */
  const perAdvisorSlotQueries = useQueries({
    queries: advisors.map((advisor) => ({
      queryKey: APPOINTMENT_QUERY_KEYS.availableSlots(date, advisor.id),
      queryFn: () => appointmentService.getAvailableSlots(date, advisor.id),
      enabled: !!date,
      staleTime: 1000 * 30,
    })),
  });

  /** { advisorId → số slot trống } */
  const slotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    advisors.forEach((advisor, i) => {
      counts[advisor.id] = perAdvisorSlotQueries[i]?.data?.length ?? 0;
    });
    return counts;
  }, [advisors, perAdvisorSlotQueries]);

  /** Slot trống của cố vấn đang chọn trong ngày đang chọn. */
  const slotsQuery = useAvailableSlots(date, advisorId ?? undefined);

  const bookMutation = useBookAppointmentMutation();
  const appointments = useQuery({
    queryKey: ['appointments', 'student'],
    queryFn: appointmentService.getStudentAppointments,
  });

  /**
   * Cố vấn được chọn mặc định: ưu tiên cố vấn cùng Major Group (BE đã xếp lên
   * đầu) ⇒ chỉ cần lấy phần tử đầu tiên.
   */
  const recommendedAdvisor = useMemo(
    () => advisors.find((a) => isSameMajorGroup(a)) ?? advisors[0] ?? null,
    [advisors],
  );

  /**
   * Fallback: BE chưa có endpoint `/student/appointments/advisors` ⇒ danh sách
   * cố vấn rỗng. Khi đó giữ hành vi cũ: không gửi `advisorId`, BE tự dùng cố
   * vấn được phân công.
   */
  const advisorListUnavailable = advisorsQuery.isError && advisors.length === 0;

  /** Cố vấn thực sự dùng để đặt lịch (có thể do SV chọn tay). */
  const effectiveAdvisorId = advisorId ?? recommendedAdvisor?.id ?? null;
  /** Tên cố vấn để hiển thị trong phần tóm tắt. */
  const effectiveAdvisorName =
    advisors.find((a) => a.id === effectiveAdvisorId)?.fullName ?? null;

  const reasonMissing = touched && reason.trim().length === 0;
  /**
   * Khi BE chưa có endpoint danh sách cố vấn ⇒ không gửi `advisorId`, BE tự
   * dùng cố vấn được phân công ⇒ vẫn cho đặt lịch được.
   */
  const canSubmit =
    !!slot &&
    reason.trim().length > 0 &&
    !bookMutation.isPending &&
    (!!effectiveAdvisorId || advisorListUnavailable);

  const handleDateChange = (next: string) => {
    setDate(next);
    setSlot(null); // the chosen time belongs to the previous day
  };

  const handleAdvisorChange = (next: string) => {
    setAdvisorId(next);
    setSlot(null); // slot của cố vấn cũ không dùng được cho cố vấn mới
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!slot || reason.trim().length === 0) return;

    bookMutation.mutate(
      {
        // Gửi kèm `advisorId` ⇒ BE đặt lịch đúng cố vấn SV chọn.
        ...(effectiveAdvisorId ? { advisorId: effectiveAdvisorId } : {}),
        startTime: slot,
        reason: reason.trim(),
        // `advisingRequestId` chỉ gửi khi có ⇒ BE gắn lịch hẹn vào ticket tương ứng.
        ...(advisingRequestId ? { advisingRequestId } : {}),
      },
      {
        onSuccess: () => {
          setReason('');
          setSlot(null);
          setTouched(false);
        },
      },
    );
  };

  const selectedSlot = slotsQuery.data?.find((s) => s.startTime === slot);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Appointments / Book a session</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Book an Advisor Appointment</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Pick an advisor, choose a date and a free slot, then tell them what you would like to
          discuss.
        </p>
        {user?.fullName && (
          <p className="mt-1 text-[13px] font-medium text-[#98a2b3]">Booking as {user.fullName}</p>
        )}
      </div>

      {/* Đến từ ticket tư vấn ⇒ nhắc SV lịch hẹn này sẽ gắn với ticket đó. */}
      {advisingRequestId && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-[13px] font-medium text-[#9a4a12]"
        >
          <Link2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            This appointment will be linked to your advising request, so your advisor sees
            the same context when you meet.
          </span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          {/*
            BE chưa có endpoint danh sách cố vấn ⇒ ẩn picker và fallback về
            cố vấn được phân công (BE tự lo).
          */}
          {!advisorListUnavailable && (
            <AdvisorPicker
              advisors={advisors}
              value={effectiveAdvisorId}
              onChange={handleAdvisorChange}
              slotCounts={slotCounts}
              isLoading={advisorsQuery.isLoading}
              isError={advisorsQuery.isError}
              onRetry={() => void advisorsQuery.refetch()}
            />
          )}
          {advisorListUnavailable && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[13px] font-medium text-[#555f6f] shadow-sm">
              Choosing a specific advisor is unavailable right now — your request will go to
              your assigned advisor.
            </div>
          )}
          <DateSelector
            value={date}
            onChange={handleDateChange}
            advisorId={effectiveAdvisorId}
          />
          <TimeSlotPicker
            slots={slotsQuery.data ?? []}
            value={slot}
            onChange={setSlot}
            isLoading={slotsQuery.isLoading}
            isError={slotsQuery.isError}
            onRetry={() => slotsQuery.refetch()}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#151c27]">Booking details</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-3 py-2.5">
              <UserRound className="size-4 shrink-0 text-[#555f6f]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">Advisor</p>
                <p className="truncate text-[13px] font-semibold text-[#151c27]">
                  {effectiveAdvisorName ?? 'Not selected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-3 py-2.5">
              <CalendarDays className="size-4 shrink-0 text-[#555f6f]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">Date</p>
                <p className="truncate text-[13px] font-semibold text-[#151c27]">
                  {formatColumnDay(new Date(`${date}T00:00:00`))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-3 py-2.5">
              <Clock className="size-4 shrink-0 text-[#555f6f]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">Time</p>
                <p className="truncate text-[13px] font-semibold text-[#151c27]">
                  {slot ? `${formatIsoTime(slot)}${selectedSlot ? ` – ${formatIsoTime(selectedSlot.endTime)}` : ''}` : 'Not selected'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="appointment-reason" className="text-xs font-semibold text-[#555f6f]">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="appointment-reason"
              rows={6}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              maxLength={MAX_REASON}
              required
              placeholder="Describe the topic you want to discuss with your advisor..."
              className="w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]"
            />
            <div className="flex items-center justify-between">
              <p className={`text-[11px] ${reasonMissing ? 'font-semibold text-red-500' : 'text-[#98a2b3]'}`}>
                {reasonMissing ? 'A reason is required.' : 'The advisor reads this before accepting.'}
              </p>
              <p className="text-[11px] text-[#98a2b3]">
                {reason.length}/{MAX_REASON}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookMutation.isPending ? (
              <>
                <CalendarClock className="size-4 animate-pulse" />
                Sending request...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Request appointment
              </>
            )}
          </button>
        </form>
      </div>
      <StudentAppointments
        appointments={appointments.data}
        isLoading={appointments.isLoading}
        isError={appointments.isError}
        onRetry={() => appointments.refetch()}
      />
    </div>
  );
}
