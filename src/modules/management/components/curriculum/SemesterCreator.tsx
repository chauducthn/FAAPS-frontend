import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { semesterService, type SemesterInput } from '../../../academic/services/semesterService';
import { CURRICULUM_QUERY_KEYS } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { toastBadRequest } from '@/shared/lib/apiError';

const empty: SemesterInput = { code: '', name: '', startDate: '', endDate: '' };
const field = 'rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-[#F26F21] focus:outline-none';

export function SemesterCreator({ onCreated }: { onCreated: (id: string) => void }) {
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [input, setInput] = useState<SemesterInput>(empty);
  const update = (key: keyof SemesterInput, value: string) => setInput((old) => ({ ...old, [key]: value }));

  const create = async () => {
    if (!/^(SP|SU|FA)\d{4}$/i.test(input.code.trim()) || !input.name.trim()
        || !input.startDate || !input.endDate || input.endDate <= input.startDate) {
      toast.error('Enter a code such as FA2026, a name, and valid start/end dates.');
      return;
    }
    setSaving(true);
    try {
      const created = await semesterService.create({
        ...input, code: input.code.trim().toUpperCase(), name: input.name.trim(),
      });
      await cache.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.semesters() });
      onCreated(created.id);
      setInput(empty);
      setOpen(false);
      toast.success(`${created.code} created`);
    } catch (error) {
      toastBadRequest(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2">
      <button type="button" className="font-semibold text-[#F26F21] hover:underline"
        onClick={() => setOpen((value) => !value)}>
        {open ? 'Cancel new semester' : '+ Add a new semester'}
      </button>
      {open && (
        <div className="mt-2 grid gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 sm:grid-cols-2">
          <input aria-label="New semester code" className={field} placeholder="FA2026"
            maxLength={6} value={input.code} onChange={(event) => update('code', event.target.value.toUpperCase())} />
          <input aria-label="New semester name" className={field} placeholder="Fall 2026"
            maxLength={100} value={input.name} onChange={(event) => update('name', event.target.value)} />
          <label className="grid gap-1">Start date<input type="date" className={field}
            value={input.startDate} onChange={(event) => update('startDate', event.target.value)} /></label>
          <label className="grid gap-1">End date<input type="date" className={field}
            value={input.endDate} onChange={(event) => update('endDate', event.target.value)} /></label>
          <button type="button" disabled={saving} onClick={create}
            className="rounded-lg bg-[#F26F21] px-3 py-2 font-semibold text-white disabled:opacity-60">
            {saving ? 'Adding...' : 'Add semester'}
          </button>
        </div>
      )}
    </div>
  );
}
