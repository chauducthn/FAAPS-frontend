// Student 360 entry point and the link back to the ticket an appointment was booked from.

import { Link } from 'react-router';
import { Student360Button } from '../../../advising/components/Student360Button';
import { advisorRequestLink } from '../../../advising/utils/ticketLink';
import type { AdvisorAppointment } from '../../types/appointment';

export function AppointmentContextLinks({ appointment }: { appointment: AdvisorAppointment }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#151c27]">Student profile</h3>
          <p className="mt-0.5 text-xs text-slate-500">Transcript, progress, advising history and graduation status.</p>
        </div>
        <Student360Button
          studentId={appointment.studentId}
          studentName={appointment.studentName}
          label="View Student Profile"
        />
      </div>

      {appointment.advisingRequestId && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <h3 className="text-sm font-bold text-[#151c27]">Linked advising request</h3>
          <p className="mt-1 text-sm text-slate-600">This appointment was booked from an advising request.</p>
          <Link
            to={advisorRequestLink(appointment.advisingRequestId)}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[#F26F21] hover:underline"
          >
            Open the advising request
          </Link>
        </div>
      )}
    </>
  );
}
