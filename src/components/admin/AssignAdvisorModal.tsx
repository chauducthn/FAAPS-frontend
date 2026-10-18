import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { LoadBadge } from './LoadBadge';
import { useAssignStudents, usePreviewAssign } from '../../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../lib/apiError';
import type { AssignPreview, AssignmentAdvisor } from '../../types/admin';

interface AssignAdvisorModalProps {
  open: boolean;
  onClose: () => void;
  /** Students to give to the chosen advisor (unassigned students, or students being reassigned). */
  students: { id: string; name: string }[];
  advisors: AssignmentAdvisor[];
  /** The advisor the students currently have (cannot be picked again). */
  excludeAdvisorId?: string;
  onDone?: () => void;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });

export function AssignAdvisorModal({ open, onClose, students, advisors, excludeAdvisorId, onDone }: AssignAdvisorModalProps) {
  const [advisorId, setAdvisorId] = useState('');
  const [preview, setPreview] = useState<AssignPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const previewMutation = usePreviewAssign();
  const assignMutation = useAssignStudents();

  useEffect(() => {
    if (!open) return;
    setAdvisorId('');
    setPreview(null);
    setError(null);
    setNotes('');
    // Reset only when the dialog is (re)opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const ids = students.map((s) => s.id);
  const nameById = new Map(students.map((s) => [s.id, s.name]));
  const options = advisors.filter((a) => a.id !== excludeAdvisorId);
  const advisor = advisors.find((a) => a.id === advisorId);
  const loadAfter = advisor ? advisor.activeStudents + students.length : 0;
  const overBy = advisor?.maxAdvisees != null ? Math.max(0, loadAfter - advisor.maxAdvisees) : 0;

  const choose = async (id: string) => {
    setAdvisorId(id);
    setPreview(null);
    setError(null);
    if (!id) return;
    try {
      setPreview(await previewMutation.mutateAsync({ studentIds: ids, advisorId: id }));
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const confirm = async () => {
    setError(null);
    try {
      const res = await assignMutation.mutateAsync({
        studentIds: ids,
        advisorId,
        acknowledge: (preview?.appointmentCount ?? 0) > 0,
        notes: notes.trim() || undefined,
      });
      toast.success(`${res.assigned} student${res.assigned === 1 ? '' : 's'} assigned to ${advisor?.fullName}.`);
      if (res.warning) toast.warning(`${advisor?.fullName} is now ${res.overLimitBy} over the advisory limit.`);
      onDone?.();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const cancelling = preview?.appointmentCount ?? 0;

  return (
    <Modal open={open} onClose={onClose} title="Assign advisor" className="max-w-xl">
      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        <div>
          <h2 className="text-xl font-semibold text-[#151c27]">{excludeAdvisorId ? 'Reassign students' : 'Assign advisor'}</h2>
          <p className="mt-1 text-[13px] text-[#555f6f]">
            {students.length} student{students.length === 1 ? '' : 's'} selected
            {students.length <= 3 ? `: ${students.map((s) => s.name).join(', ')}` : ''}
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#151c27]">
          Advisor
          <select
            value={advisorId}
            onChange={(e) => choose(e.target.value)}
            className="h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="">Choose an advisor...</option>
            {options.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName} ({a.activeStudents}/{a.maxAdvisees ?? 'no limit'})
              </option>
            ))}
          </select>
        </label>

        {advisor && (
          <div className="flex items-center justify-between rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm">
            <span className="text-[#555f6f]">After this change {advisor.fullName} will have</span>
            <LoadBadge count={loadAfter} limit={advisor.maxAdvisees} />
          </div>
        )}
        {overBy > 0 && (
          <p className="flex items-start gap-2 rounded-lg bg-[#fffbeb] px-3 py-2 text-[13px] text-[#b45309]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            This is {overBy} over the advisory limit of {advisor?.maxAdvisees}. You can still continue; the limit is a warning, not a block.
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#151c27]">
          Note <span className="font-normal text-[#555f6f]">(optional, saved in the assignment history)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Why is this assignment being made?"
            className="rounded-lg border border-[#e5e7eb] p-2 text-sm font-normal text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </label>

        {previewMutation.isPending && <p className="text-sm text-[#555f6f]">Checking appointments...</p>}
        {cancelling > 0 && preview && (
          <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-[13px] text-[#7f1d1d]">
            <p className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              {cancelling} future appointment{cancelling === 1 ? '' : 's'} will be cancelled
            </p>
            <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto">
              {preview.scheduledAppointments.map((a) => (
                <li key={a.appointmentId}>
                  {nameById.get(a.studentId) ?? 'Student'} · {when(a.scheduledAt)}
                </li>
              ))}
            </ul>
            <p className="mt-2">The students are notified and need to book again with the new advisor.</p>
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#e5e7eb] p-4 sm:flex-row sm:px-6">
        <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200">
          Cancel
        </button>
        <button
          type="button"
          disabled={!advisorId || !preview || assignMutation.isPending || students.length === 0}
          onClick={confirm}
          className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
        >
          {assignMutation.isPending ? 'Assigning...' : cancelling > 0 ? `Assign and cancel ${cancelling}` : 'Assign'}
        </button>
      </div>
    </Modal>
  );
}
