import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { usePreviewUnassign, useUnassignStudents } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { AssignPreview } from '../types/admin';

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
    // Preview only when the selection changes.
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
    <Modal open={!!students?.length} onClose={onClose} title="Unassign advisor">
      <div className="flex flex-col gap-4 p-6 text-sm text-[#151c27]">
        <p>Remove the current advisor from {students?.length ?? 0} selected student(s). They will become eligible for assignment again.</p>
        {previewMutation.isPending && <p>Checking appointments...</p>}
        {(preview?.appointmentCount ?? 0) > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
            <p>{preview?.appointmentCount} future appointment(s) will be cancelled. Open advising requests will also be cancelled.</p>
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" checked={acknowledge} onChange={(event) => setAcknowledge(event.target.checked)} />
              I understand these appointments will be cancelled.
            </label>
          </div>
        )}
        <label className="flex flex-col gap-1">Reason or note
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="rounded-lg border border-gray-300 p-2" />
        </label>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">Cancel</button>
          <button type="button" onClick={confirm}
            disabled={!preview || previewMutation.isPending || unassignMutation.isPending || ((preview.appointmentCount ?? 0) > 0 && !acknowledge)}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Unassign</button>
        </div>
      </div>
    </Modal>
  );
}
