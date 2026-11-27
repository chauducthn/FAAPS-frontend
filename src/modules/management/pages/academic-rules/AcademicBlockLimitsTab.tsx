import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FloppyDisk as Save, Plus, SlidersHorizontal, SpinnerGap } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/shared/lib/apiError';
import {
  ACADEMIC_BLOCK_QUERY_KEY,
  academicBlockService,
  type AcademicBlockInput,
  type AcademicBlockItem,
} from '../../services/academic-block.service';
import { AcademicBlockModal } from './AcademicBlockModal';
import { AcademicBlocksTable } from './AcademicBlocksTable';

const NUM_INPUT_CLASS =
  'mt-1 h-9 w-full rounded-md border border-line bg-white px-3 text-[13px] font-semibold tabular-nums ' +
  'text-ink-primary shadow-2xs transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

const PRIMARY_BTN_CLASS =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-brand px-3.5 text-[13px] font-semibold ' +
  'text-white shadow-2xs transition-colors hover:bg-brand-hover focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-45';

const SAVE_BTN_CLASS =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 text-[13px] ' +
  'font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover ' +
  'disabled:cursor-not-allowed disabled:opacity-45';

export function AcademicBlockLimitsTab({ headerLeft }: { headerLeft?: ReactNode } = {}) {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>{headerLeft}</div>
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className={PRIMARY_BTN_CLASS}
        >
          <Plus className="size-4" aria-hidden /> Add block
        </button>
      </div>

      <section className="rounded-lg border border-line bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
              <SlidersHorizontal className="size-[18px]" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink-primary">Global Semester Limits</h2>
              <p className="text-xs text-ink-muted">Applies across Student Curriculum views and AI Study Roadmap.</p>
            </div>
          </div>
          <button
            type="button"
            disabled={!limitsDirty || saveLimits.isPending}
            onClick={() => saveLimits.mutate()}
            className={SAVE_BTN_CLASS}
          >
            {saveLimits.isPending
              ? <SpinnerGap className="size-4 animate-spin text-ink-muted" aria-hidden />
              : <Save className="size-4 text-ink-muted" aria-hidden />}
            Save limits
          </button>
        </div>

        <div className="mt-3.5 grid gap-3.5 sm:grid-cols-3">
          <div>
            <label htmlFor="limit-max-cr" className="block text-xs font-medium text-ink-secondary">
              Max Credits / Semester
            </label>
            <input
              id="limit-max-cr" type="number" min={6} max={36}
              value={maxCr} onChange={(e) => setMaxCr(e.target.value)} className={NUM_INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="limit-max-co" className="block text-xs font-medium text-ink-secondary">
              Max Courses / Semester
            </label>
            <input
              id="limit-max-co" type="number" min={1} max={15}
              value={maxCo} onChange={(e) => setMaxCo(e.target.value)} className={NUM_INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="limit-prep" className="block text-xs font-medium text-ink-secondary">
              English Prep Parts / Semester
            </label>
            <input
              id="limit-prep" type="number" min={1} max={4}
              value={prepParts} onChange={(e) => setPrepParts(e.target.value)} className={NUM_INPUT_CLASS}
            />
          </div>
        </div>
      </section>

      <AcademicBlocksTable
        blocks={data?.blocks ?? []}
        isLoading={isLoading}
        isDeleting={removeBlock.isPending}
        onEdit={(block) => { setEditing(block); setModalOpen(true); }}
        onDelete={(id) => removeBlock.mutate(id)}
      />

      <AcademicBlockModal
        open={modalOpen} editing={editing} saving={saveBlock.isPending}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={(input) => saveBlock.mutate(input)}
      />
    </div>
  );
}
