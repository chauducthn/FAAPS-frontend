import { CalendarDays, MapPin, Briefcase, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { AppointmentStatusBadge, durationMinutes, formatSlot } from './AppointmentBits';
import { useAppointment } from '../../hooks/queries/useAdminAppointments';

interface AppointmentDetailModalProps {
  appointmentId: string | null;
  onClose: () => void;
}

export function AppointmentDetailModal({ appointmentId, onClose }: AppointmentDetailModalProps) {
  const { data: a, isLoading, isError, refetch } = useAppointment(appointmentId);
  const minutes = a ? durationMinutes(a) : null;

  return (
    <Modal open={!!appointmentId} onClose={onClose} title="Appointment Details" className="max-w-[600px]">
      {isLoading || !a ? (
        <div className="p-8 text-center text-sm text-[#555f6f]">
          {isError ? (
            <>
              Could not load this appointment.{' '}
              <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
                Retry
              </button>
            </>
          ) : (
            'Loading...'
          )}
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] p-6">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[#151c27]">Appointment Details</h2>
              <p className="mt-1 break-all text-[13px] text-[#555f6f]">Session ID: {a.id}</p>
            </div>
            <AppointmentStatusBadge status={a.status} />
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto p-6">
            <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm font-medium text-[#151c27]">
              <CalendarDays className="size-4 shrink-0 text-[#555f6f]" />
              {formatSlot(a)}
              {minutes !== null && <span className="text-[#555f6f]">({minutes} min)</span>}
            </div>

            <div className="grid gap-4 rounded-lg border border-[#e5e7eb] p-4 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#555f6f]">
                  <User className="size-4" /> Student
                </p>
                <p className="mt-2 text-base font-semibold text-[#151c27]">{a.studentName}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#555f6f]">
                  <Briefcase className="size-4" /> Advisor
                </p>
                <p className="mt-2 text-base font-semibold text-[#151c27]">{a.advisorName}</p>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-[#151c27]">
                <MapPin className="size-4 text-[#555f6f]" /> Location
              </p>
              <p className="mt-2 rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm text-[#151c27]">{a.location || '—'}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#151c27]">Consultation topic / agenda</p>
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm text-[#151c27]">
                {a.agenda || 'No agenda provided.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#e5e7eb] p-4 sm:px-6">
            <p className="text-[13px] text-[#555f6f]">Read-only details</p>
            <button type="button" onClick={onClose} className="rounded-lg border border-[#e5e7eb] px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-50">
              Close
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
