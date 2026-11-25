import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { useAttendanceConfigMutations } from '../../hooks/queries/useAttendance';
import { validateRule } from '../../services/attendance.service';
import type { AttendanceRule } from '../../types/attendance';
import { AttendanceRuleFields, fromDraft, toDraft, type RuleDraft } from './AttendanceRuleFields';

export function DefaultRuleCard({ rule }: { rule: AttendanceRule | undefined }) {
  const { saveDefault } = useAttendanceConfigMutations();
  const [draft, setDraft] = useState<RuleDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rule) setDraft(toDraft(rule));
  }, [rule]);

  const dirty = !!rule && !!draft && JSON.stringify(toDraft(rule)) !== JSON.stringify(draft);

  const save = async () => {
    if (!draft) return;
    const value = fromDraft(draft);
    const invalid = validateRule(value);
    if (invalid) return setError(invalid);
    setError(null);
    try {
      await saveDefault.mutateAsync(value);
      toast.success('Default attendance condition saved.');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <section aria-labelledby="default-rule" className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 id="default-rule" className="text-base font-semibold text-[#151c27]">
          Default condition
        </h2>
        <p className="mt-0.5 text-sm text-[#555f6f]">Used by every course that has no condition of its own.</p>
      </div>
      {draft ? (
        <AttendanceRuleFields draft={draft} onChange={setDraft} idPrefix="default-rule" disabled={saveDefault.isPending} />
      ) : (
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {dirty && (
          <button
            type="button"
            onClick={() => rule && setDraft(toDraft(rule))}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200"
          >
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saveDefault.isPending}
          className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
        >
          {saveDefault.isPending ? 'Saving...' : 'Save default'}
        </button>
      </div>
    </section>
  );
}
