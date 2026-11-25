import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronDown, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { LoadBadge } from './LoadBadge';
import { useAssignStudents, usePreviewAssign } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { AssignPreview, AssignmentAdvisor } from '../types/admin';
import {
  AssignmentModalFooter,
  AssignmentModalHeader,
  assignmentCancelBtn,
  assignmentPrimaryBtn,
  assignmentSelectClass,
  assignmentTextareaClass,
} from './AssignmentModalChrome';

interface AssignToAdvisorModalProps {
  open: boolean;
  onClose: () => void;
  students: { id: string; name: string }[];
  advisors: AssignmentAdvisor[];
  onDone?: () => void;
}

export function AssignToAdvisorModal({ open, onClose, students, advisors, onDone }: AssignToAdvisorModalProps) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const ids = students.map((s) => s.id);
  const nameById = new Map(students.map((s) => [s.id, s.name]));
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
        studentIds: ids, advisorId, acknowledge: (preview?.appointmentCount ?? 0) > 0, notes: notes.trim() || undefined,
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
  const subtitle = `${students.length} student${students.length === 1 ? '' : 's'} selected${students.length <= 3 ? `: ${students.map((s) => s.name).join(', ')}` : ''}`;

  return (
    <Modal open={open} onClose={onClose} title="Assign to Advisor" className="max-w-xl">
      <AssignmentModalHeader icon={UserCheck} title="Assign to Advisor" subtitle={subtitle} onClose={onClose} />
      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Advisor</label>
          {advisors.length === 0 ? (
            <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              No advisor is assigned to this cohort yet (or selected students belong to different cohorts). Assign an advisor to the cohort first.
            </p>
          ) : (
            <div className="relative">
              <select
                value={advisorId}
                onChange={(e) => choose(e.target.value)}
                aria-label="Choose an advisor"
                className={assignmentSelectClass}
              >
                <option value="">Choose an advisor...</option>
                {advisors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} ({a.activeStudents}/{a.maxAdvisees ?? 'no limit'})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
          )}
        </div>

        {advisor && (
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 px-3.5 py-2.5 text-xs">
            <span className="text-gray-600">After this change <strong className="text-gray-900">{advisor.fullName}</strong> will have</span>
            <LoadBadge count={loadAfter} limit={advisor.maxAdvisees} />
          </div>
        )}
        {overBy > 0 && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            This is {overBy} over the advisory limit of {advisor?.maxAdvisees}. The limit is a warning, not a block.
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
            Note <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Why is this assignment being made?"
            className={assignmentTextareaClass}
          />
        </div>

        {previewMutation.isPending && <p className="text-xs text-gray-500">Checking appointments...</p>}
        {cancelling > 0 && preview && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="size-3.5" />
              {cancelling} future appointment{cancelling === 1 ? '' : 's'} will be cancelled
            </p>
            <ul className="mt-1.5 flex max-h-36 flex-col gap-1 overflow-y-auto">
              {preview.scheduledAppointments.map((a) => (
                <li key={a.appointmentId}>
                  {nameById.get(a.studentId) ?? 'Student'} · {new Date(a.scheduledAt).toLocaleString('en-US', {
                    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
                  })}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-red-700">The students are notified and need to book again with the new advisor.</p>
          </div>
        )}
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
      </div>
      <AssignmentModalFooter>
        <button type="button" onClick={onClose} className={assignmentCancelBtn}>Cancel</button>
        <button
          type="button"
          disabled={!advisorId || !preview || assignMutation.isPending || students.length === 0}
          onClick={confirm}
          className={assignmentPrimaryBtn}
        >
          <UserCheck className="size-4" aria-hidden />
          {assignMutation.isPending ? 'Assigning...' : cancelling > 0 ? `Assign and cancel ${cancelling}` : 'Assign'}
        </button>
      </AssignmentModalFooter>
    </Modal>
  );
}
