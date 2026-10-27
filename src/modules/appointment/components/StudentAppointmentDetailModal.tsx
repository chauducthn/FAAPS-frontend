import { CalendarDays, Clock, User } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { formatIsoDay, formatIsoTime } from '@/shared/lib/appointmentDate';
import { useStudentAppointmentDetail } from '../hooks/queries/useAppointmentQueries';
import { BookingStatusBadge } from './AppointmentBits';

export function StudentAppointmentDetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading, isError } = useStudentAppointmentDetail(id);
  return <Modal open={!!id} onClose={onClose} title="Appointment details" className="max-w-[540px]">
    <div className="border-b p-6"><h2 className="text-xl font-semibold">Appointment details</h2></div>
    <div className="space-y-4 p-6">
      {isLoading && <p className="text-sm text-gray-500">Loading appointment...</p>}
      {isError && <p className="text-sm text-red-600">Unable to load this appointment.</p>}
      {data && <>
        <div className="flex justify-end"><BookingStatusBadge status={data.status} /></div>
        <Info icon={<User />} label="Advisor" value={data.advisorName} />
        <Info icon={<CalendarDays />} label="Date" value={formatIsoDay(data.startTime)} />
        <Info icon={<Clock />} label="Time" value={`${formatIsoTime(data.startTime)} – ${formatIsoTime(data.endTime)}`} />
        <section><p className="text-xs font-semibold text-gray-500">Reason</p>
          <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm">{data.reason}</p></section>
        {data.decisionNote && <section><p className="text-xs font-semibold text-gray-500">Advisor note</p>
          <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm">{data.decisionNote}</p></section>}
      </>}
    </div>
    <div className="flex justify-end border-t p-4"><button type="button" onClick={onClose}
      className="rounded-lg border px-4 py-2 text-sm font-semibold">Close</button></div>
  </Modal>;
}

function Info({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
    <span className="size-4 text-gray-500">{icon}</span><div><p className="text-[10px] font-semibold uppercase text-gray-400">{label}</p>
      <p className="text-sm font-semibold">{value}</p></div></div>;
}
