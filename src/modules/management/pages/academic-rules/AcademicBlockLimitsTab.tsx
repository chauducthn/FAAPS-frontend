import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, FloppyDisk as Save, PencilSimple, Plus, SlidersHorizontal, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/shared/lib/apiError';
import {
  ACADEMIC_BLOCK_QUERY_KEY,
  academicBlockService,
  type AcademicBlockInput,
  type AcademicBlockItem,
} from '../../services/academic-block.service';
import { AcademicBlockModal } from './AcademicBlockModal';

const TYPE_BADGE: Record<string, string> = {
  PREP: 'bg-sky-50 text-sky-700 ring-sky-200',
  MAIN: 'bg-orange-50 text-[#C2410C] ring-orange-200',
  FAST: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  INTENSIVE: 'bg-amber-50 text-amber-800 ring-amber-200',
};

const numCls =
  'mt-1 h-9.5 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-semibold text-gray-900 focus:border-[#F26F21] focus:outline-none';

export function AcademicBlockLimitsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ACADEMIC_BLOCK_QUERY_KEY,
    queryFn: academicBlockService.getAdminConfig,
  });

  const [maxCr, setMaxCr] = useState('21');
  const [maxCo, setMaxCo] = useState('7');
  const [prepParts, setPrepParts] = useState('2');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicBlockItem | null>(null);

  useEffect(() => {
    if (!data?.limits) return;
    setMaxCr(String(data.limits.maxCreditsPerSemester));
    setMaxCo(String(data.limits.maxCoursesPerSemester));
    setPrepParts(String(data.limits.prepPartsPerSemester));
  }, [data?.limits]);

  const limitsDirty = !!data?.limits && (
    Number(maxCr) !== data.limits.maxCreditsPerSemester ||
    Number(maxCo) !== data.limits.maxCoursesPerSemester ||
    Number(prepParts) !== data.limits.prepPartsPerSemester
  );

  const saveLimits = useMutation({
    mutationFn: () => academicBlockService.updateLimits({
      maxCreditsPerSemester: Number(maxCr) || 21,
      maxCoursesPerSemester: Number(maxCo) || 7,
      prepPartsPerSemester: Number(prepParts) || 2,
    }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ACADEMIC_BLOCK_QUERY_KEY });
      toast.success('Semester study limits updated.');
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const saveBlock = useMutation({
    mutationFn: (input: AcademicBlockInput) =>
      editing ? academicBlockService.updateBlock(editing.id, input) : academicBlockService.createBlock(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ACADEMIC_BLOCK_QUERY_KEY });
      toast.success(editing ? 'Study block updated.' : 'Study block created.');
      setModalOpen(false);
      setEditing(null);
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const removeBlock = useMutation({
    mutationFn: (id: string) => academicBlockService.deleteBlock(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ACADEMIC_BLOCK_QUERY_KEY });
      toast.success('Study block deleted.');
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
              <SlidersHorizontal className="size-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Global Semester Limits</h2>
              <p className="text-xs text-gray-500">Applies across Student Curriculum views and AI Study Roadmap.</p>
            </div>
          </div>
          <button
            type="button"
            disabled={!limitsDirty || saveLimits.isPending}
            onClick={() => saveLimits.mutate()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-xs font-semibold text-white hover:bg-[#e05f14] disabled:opacity-45"
          >
            <Save className="size-3.5" />
            {saveLimits.isPending ? 'Saving…' : 'Save limits'}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700">Max Credits / Semester</label>
            <input type="number" min={6} max={36} value={maxCr} onChange={(e) => setMaxCr(e.target.value)} className={numCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">Max Courses / Semester</label>
            <input type="number" min={1} max={15} value={maxCo} onChange={(e) => setMaxCo(e.target.value)} className={numCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">English Prep Parts / Semester</label>
            <input type="number" min={1} max={4} value={prepParts} onChange={(e) => setPrepParts(e.target.value)} className={numCls} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="size-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Study Blocks ({data?.blocks.length ?? 0})</h2>
              <p className="text-xs text-gray-500">Configure FPTU block durations (weeks), max courses, and max credits.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-xs font-semibold text-white hover:bg-[#e05f14]"
          >
            <Plus className="size-3.5" /> Add block
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-2.5 pl-5 pr-3">Code</th>
                <th className="px-3 py-2.5">Block Name</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5 text-center">Duration</th>
                <th className="px-3 py-2.5 text-center">Max Courses</th>
                <th className="px-3 py-2.5 text-center">Max Credits</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="py-2.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {isLoading ? (
                <tr><td colSpan={8} className="py-8 text-center text-xs text-gray-400">Loading blocks…</td></tr>
              ) : (data?.blocks ?? []).map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/70">
                  <td className="py-3 pl-5 pr-3 font-mono text-xs font-bold text-gray-900">{b.code}</td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-gray-900">{b.name}</p>
                    {b.description && <p className="text-[11px] text-gray-500">{b.description}</p>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TYPE_BADGE[b.blockType] ?? 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                      {b.blockType}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center font-mono text-xs font-semibold text-gray-800">{b.durationWeeks}w</td>
                  <td className="px-3 py-3 text-center font-mono text-xs font-semibold text-gray-800">{b.maxCourses}</td>
                  <td className="px-3 py-3 text-center font-mono text-xs font-semibold text-gray-800">{b.maxCredits} cr</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 pl-3 pr-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button type="button" aria-label="Edit block" onClick={() => { setEditing(b); setModalOpen(true); }} className="rounded-lg p-1.5 text-gray-500 hover:bg-orange-50 hover:text-[#C2410C]"><PencilSimple className="size-4" /></button>
                      <button type="button" aria-label="Delete block" disabled={removeBlock.isPending} onClick={() => removeBlock.mutate(b.id)} className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <AcademicBlockModal open={modalOpen} editing={editing} saving={saveBlock.isPending} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={(input) => saveBlock.mutate(input)} />
    </div>
  );
}
