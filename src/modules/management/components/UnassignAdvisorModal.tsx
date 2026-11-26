import { useEffect, useState } from 'react';
import { Warning as AlertTriangle, UserMinus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { usePreviewUnassign, useUnassignStudents } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { AssignPreview } from '../types/admin';
import {
  AssignmentModalFooter,
  AssignmentModalHeader,
  assignmentCancelBtn,
  assignmentTextareaClass,
} from './AssignmentModalChrome';

interface Props {
  students: { id: string; name: string }[] | null;
  onClose: () => void;
  onDone?: () => void;
}

export function UnassignAdvisorModal({ students, onClose, onDone }: Props) {
  const previewMutation = usePreviewUnassign();
  const unassignMutation = useUnassignStudents();
  const [preview, setPreview] = useState<AssignPreview | null>(null);
  const [acknowledge, setAcknowledge] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ids = students?.map((student) => student.id) ?? [];
  const key = ids.join(',');

  useEffect(() => {
    if (!students?.length) return;
    setPreview(null);
    setAcknowledge(false);
    setNotes('');
    setError(null);
    previewMutation.mutate(ids, {
      onSuccess: setPreview,
      onError: (cause) => setError(apiErrorMessage(cause)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, !!students?.length]);

  const confirm = async () => {
    setError(null);
    try {
      const result = await unassignMutation.mutateAsync({ studentIds: ids, acknowledge, notes: notes.trim() || undefined });
      toast.success(`${result.unassigned} student${result.unassigned === 1 ? '' : 's'} unassigned.`);
      onDone?.();
      onClose();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  return (
    <Modal open={!!students?.length} onClose={onClose} title="Unassign advisor" className="max-w-lg">
      <AssignmentModalHeader
        icon={UserMinus}
        tone="danger"
        title="Unassign advisor"
        subtitle={`Remove the current advisor from ${students?.length ?? 0} selected student(s).`}
        onClose={onClose}
      />
      <div className="flex flex-col gap-4 px-6 py-5">
        <p className="text-xs text-gray-600">
          Selected students will return to the unassigned pool and become eligible for assignment again.
        </p>
        {previewMutation.isPending && <p className="text-xs text-gray-500">Checking appointments...</p>}
        {(preview?.appointmentCount ?? 0) > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="size-3.5 shrink-0" />
              {preview?.appointmentCount} future appointment(s) and open advising requests will be cancelled.
            </p>
            <label className="mt-2 flex cursor-pointer items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={acknowledge}
                onChange={(event) => setAcknowledge(event.target.checked)}
                className="size-3.5 accent-[#F26F21]"
              />
              I understand these appointments will be cancelled.
            </label>
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
            Reason or note <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className={assignmentTextareaClass} />
        </div>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
      </div>
      <AssignmentModalFooter>
        <button type="button" onClick={onClose} className={assignmentCancelBtn}>Cancel</button>
        <button
          type="button"
          onClick={confirm}
          disabled={!preview || previewMutation.isPending || unassignMutation.isPending || ((preview.appointmentCount ?? 0) > 0 && !acknowledge)}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Unassign
        </button>
      </AssignmentModalFooter>
    </Modal>
  );
}
