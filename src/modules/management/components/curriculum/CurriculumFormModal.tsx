// Create / edit modal shared by the Curriculum and Cohorts pages.
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { GraduationCap, SpinnerGap as Loader2, X } from '@phosphor-icons/react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { toastBadRequest } from '@/shared/lib/apiError';
import { useMajorsQuery } from '../../../academic/hooks/queries/useMajorsQuery';
import { useSemesterOptions } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { curriculumFormSchema, type CurriculumFormValues } from '../../../academic/validations/curriculum.schema';
import type { CurriculumInput, CurriculumItem } from '../../../academic/types/curriculum';
import { CurriculumFormFields } from './CurriculumFormFields';
import {
  draftCode, draftFromSemester, EMPTY_SEMESTER_DRAFT, resolveSemesterId, validateSemesterDrafts, type SemesterDraft,
} from './semesterRangeUtils';

interface Props {
  open: boolean; noun: 'Cohort' | 'Curriculum'; initial?: CurriculumItem | null;
  isSubmitting?: boolean; onClose: () => void; onSubmit: (body: CurriculumInput) => Promise<unknown>;
}

const emptyValues: CurriculumFormValues = {
  majorId: '', version: '', name: '', effectiveFromSemesterId: '',
  effectiveToSemesterId: '', description: '', isCurrent: false, status: 'ACTIVE',
};

const toFormValues = (item: CurriculumItem): CurriculumFormValues => ({
  majorId: item.majorId, version: item.version, name: item.name,
  effectiveFromSemesterId: item.effectiveFromSemesterId,
  effectiveToSemesterId: item.effectiveToSemesterId ?? '',
  description: item.description ?? '', isCurrent: item.isCurrent, status: item.status,
});

export default function CurriculumFormModal({ open, noun, initial, isSubmitting, onClose, onSubmit }: Props) {
  const isCreate = !initial;
  const cache = useQueryClient();
  const majors = useMajorsQuery({ page: 0, size: 100 });
  const semesters = useSemesterOptions(open);
  const nameTouchedRef = useRef(false);
  const [startDraft, setStartDraft] = useState<SemesterDraft>(EMPTY_SEMESTER_DRAFT);
  const [endDraft, setEndDraft] = useState<SemesterDraft>(EMPTY_SEMESTER_DRAFT);
  const [resolvingSemesters, setResolvingSemesters] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitted },
  } = useForm<CurriculumFormValues>({
    resolver: zodResolver(curriculumFormSchema),
    defaultValues: emptyValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) return;
    nameTouchedRef.current = !isCreate;
    reset(initial ? toFormValues(initial) : emptyValues);
    setStartDraft(initial ? draftFromSemester(initial.effectiveFromSemesterCode, initial.effectiveFromDate, null) : EMPTY_SEMESTER_DRAFT);
    setEndDraft(initial ? draftFromSemester(initial.effectiveToSemesterCode, null, initial.effectiveToDate) : EMPTY_SEMESTER_DRAFT);
  }, [open, initial, isCreate, reset]);

  const status = watch('status');
  const majorId = watch('majorId');
  const version = watch('version');
  const displayName = watch('name');
  const semesterList = semesters.data ?? [];
  const majorList = majors.data?.items ?? [];
  const isCurrentDisabled = status !== 'ACTIVE';

  useEffect(() => {
    if (status !== 'ACTIVE') setValue('isCurrent', false, { shouldValidate: true });
  }, [status, setValue]);

  useEffect(() => {
    if (!open || !isCreate) return;
    const major = majorList.find((m) => m.id === majorId);
    if (noun === 'Cohort') {
      setValue('name', major ? major.name : '', { shouldValidate: Boolean(major) });
      return;
    }
    if (!major || nameTouchedRef.current) return;
    const cleanVersion = version.trim().toUpperCase();
    if (cleanVersion) setValue('name', `${major.name} ${cleanVersion}`, { shouldValidate: true });
  }, [open, isCreate, noun, majorId, version, majorList, setValue]);

  const syncStart = (next: SemesterDraft) => {
    setStartDraft(next);
    const code = draftCode(next);
    const match = code ? semesterList.find((s) => s.code.toUpperCase() === code) : undefined;
    setValue('effectiveFromSemesterId', match?.id ?? code, { shouldValidate: true });
  };

  const syncEnd = (next: SemesterDraft) => {
    setEndDraft(next);
    const code = draftCode(next);
    const match = code ? semesterList.find((s) => s.code.toUpperCase() === code) : undefined;
    setValue('effectiveToSemesterId', match?.id ?? code, { shouldValidate: true });
  };

  const { startError, endError } = validateSemesterDrafts(startDraft, endDraft);
  const shownStartError = startError ?? (isSubmitted ? errors.effectiveFromSemesterId?.message : undefined);
  const shownEndError = endError ?? (isSubmitted ? errors.effectiveToSemesterId?.message : undefined);
  const busy = Boolean(isSubmitting || resolvingSemesters);
  const canSubmit = !busy && isValid && !startError && !endError && Boolean(draftCode(startDraft)) && Boolean(draftCode(endDraft));

  const submit = handleSubmit(async (values) => {
    if (startError || endError) return;
    setResolvingSemesters(true);
    try {
      const fromId = await resolveSemesterId(startDraft, semesterList, cache);
      const toId = await resolveSemesterId(endDraft, semesterList, cache);
      await onSubmit({
        majorId: values.majorId,
        version: values.version.trim().toUpperCase(),
        name: values.name.trim(),
        effectiveFromSemesterId: fromId,
        effectiveToSemesterId: toId,
        description: values.description?.trim() ? values.description.trim() : null,
        isCurrent: values.status === 'ACTIVE' ? values.isCurrent : false,
        status: values.status,
      });
    } catch (err) {
      toastBadRequest(err);
    } finally {
      setResolvingSemesters(false);
    }
  });

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={`${isCreate ? 'Create' : 'Edit'} ${noun.toLowerCase()}`} className="max-w-2xl">
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line-soft bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand ring-1 ring-brand/25">
              <GraduationCap className="size-4.5" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-ink-primary">
                {isCreate ? `Create ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}
              </h2>
              <p className="text-[13px] text-ink-muted">
                Configure major, cohort intake, and effective semester range.
              </p>
            </div>
          </div>
          <button type="button" disabled={busy} onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-ink-subtle transition-colors hover:bg-line-soft hover:text-ink-secondary disabled:opacity-40">
            <X className="size-4" />
          </button>
        </div>

        <CurriculumFormFields
          noun={noun}
          status={status}
          majorId={majorId}
          displayName={displayName}
          startDraft={startDraft}
          endDraft={endDraft}
          startError={shownStartError}
          endError={shownEndError}
          isCurrentDisabled={isCurrentDisabled}
          majorList={majorList}
          semesterList={semesterList}
          register={register}
          setValue={setValue}
          errors={errors}
          onStartDraftChange={syncStart}
          onEndDraftChange={syncEnd}
          onManualNameEdit={() => { nameTouchedRef.current = true; }}
        />

        <div className="flex items-center justify-end gap-2.5 border-t border-line-soft bg-surface-page/70 px-6 py-3.5">
          <button type="button" disabled={busy} onClick={onClose} className="h-9 rounded-lg border border-line bg-white px-4 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            title={!canSubmit ? 'Fill in Major, Cohort, Name, Start semester and End semester to continue' : undefined}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-55"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy ? 'Saving…' : isCreate ? `Create ${noun.toLowerCase()}` : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
