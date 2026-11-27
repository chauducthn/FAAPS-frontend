import { useState } from 'react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { validateRule } from '../../services/attendance.service';
import type { AttendanceRule } from '../../types/attendance';
import { AttendanceRuleFields, fromDraft, toDraft, type RuleDraft } from './AttendanceRuleFields';

interface Props {
  course: { id: string; code: string; name: string };
  /** The course's current condition (its own, or the default). */
  rule: AttendanceRule;
  saving: boolean;
  onClose: () => void;
  onSave: (rule: AttendanceRule) => Promise<unknown>;
}

export function CourseRuleModal({ course, rule, saving, onClose, onSave }: Props) {
  // Render this only while editing (keyed by course) so the form starts from the course's current condition.
  const [draft, setDraft] = useState<RuleDraft>(() => toDraft(rule));
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const value = fromDraft(draft);
    const invalid = validateRule(value);
    if (invalid) return setError(invalid);
    try {
      await onSave(value);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open onClose={onClose} title={`Attendance condition for ${course.code}`}>
      <div className="flex flex-col gap-4 p-6">
        <div>
          <h2 className="text-xl font-semibold text-ink-primary">Attendance condition</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {course.code} · {course.name}
          </p>
        </div>
        <AttendanceRuleFields draft={draft} onChange={setDraft} idPrefix="course-rule" disabled={saving} />
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-line p-4 sm:px-6">
        <button type="button" onClick={onClose} className="rounded-lg bg-line-soft px-5 py-2 text-sm font-semibold text-ink-primary hover:bg-line">
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}
