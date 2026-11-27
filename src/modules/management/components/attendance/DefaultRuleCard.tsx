import { useEffect, useState } from 'react';
import { ShieldCheck } from '@phosphor-icons/react';
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
    <section aria-labelledby="default-rule" className="overflow-hidden rounded-lg border border-line/80 bg-white shadow-2xs">
      <div className="flex items-center gap-3 border-b border-line-soft px-5 py-3.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <ShieldCheck className="size-4" aria-hidden />
        </span>
        <div>
          <h2 id="default-rule" className="text-sm font-bold text-ink-primary">Default condition</h2>
          <p className="text-xs text-ink-muted">Used by every course that has no custom attendance override.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {draft ? (
          <AttendanceRuleFields draft={draft} onChange={setDraft} idPrefix="default-rule" disabled={saveDefault.isPending} />
        ) : (
          <div className="h-24 animate-pulse rounded-lg bg-line-soft" />
        )}
        {error && (
          <p role="alert" className="rounded-lg border border-red-200/80 bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          {dirty && (
            <button
              type="button"
              onClick={() => rule && setDraft(toDraft(rule))}
              className={
                'h-9 rounded-lg border border-line bg-white ' +
                'px-4 text-[13px] font-semibold text-ink-secondary hover:bg-surface-hover'
              }
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saveDefault.isPending}
            className="h-9 rounded-lg bg-brand px-4 text-[13px] font-semibold text-white shadow-2xs hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveDefault.isPending ? 'Saving…' : 'Save default'}
          </button>
        </div>
      </div>
    </section>
  );
}
