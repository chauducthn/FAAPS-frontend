// Student / Profile: auto-extracts cohort from the Student ID (e.g. SE182965 -> K18)
// and offers matching active curriculums for that cohort.

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FloppyDisk as Save, GraduationCap, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { studentAcademicService } from '@/modules/academic/services/studentAcademicService';
import { useCurriculumChoices } from '@/modules/auth/hooks/queries/useStudentOnboarding';
import { parseStudentId } from '@/modules/management/utils/accountRules';
import type { StudentProfile } from '../../advising/types/advising';
import { STUDENT_QUERY_KEYS } from '../hooks/queries/useStudentQueries';

function saveErrorMessage(error: unknown): string {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const message = axios.isAxiosError(error) ? (error.response?.data as { message?: string } | undefined)?.message : undefined;
  if (message) return message;
  if (status === 409) return 'Your transcript already has grades, so only the Academic Office can change your curriculum.';
  if (status === 404) return 'This curriculum is no longer available. Reload the page and choose another one.';
  return apiErrorMessage(error);
}

export function MajorCurriculumCard({ profile, compact = false }: { profile: StudentProfile; compact?: boolean }) {
  const queryClient = useQueryClient();
  const choices = useCurriculumChoices();
  const current = profile.curriculumVersionId ?? '';
  const [curriculumId, setCurriculumId] = useState(current);
  const [error, setError] = useState<string | null>(null);

  const detected = useMemo(() => parseStudentId(profile.studentCode ?? ''), [profile.studentCode]);
  const detectedCohort = detected?.cohort ?? null;

  useEffect(() => {
    setCurriculumId(current);
    setError(null);
  }, [current]);

  const filteredChoices = useMemo(() => {
    const all = choices.data ?? [];
    if (!detectedCohort) return all;
    const matched = all.filter(
      (item) => item.version.toUpperCase() === detectedCohort.toUpperCase() || item.id === current,
    );
    return matched.length > 0 ? matched : all;
  }, [choices.data, detectedCohort, current]);

  const groups = useMemo(() => {
    const byMajor = new Map<string, { label: string; items: typeof filteredChoices }>();
    for (const item of filteredChoices) {
      const entry = byMajor.get(item.majorCode) ?? { label: `${item.majorCode} - ${item.majorName}`, items: [] };
      entry.items.push(item);
      byMajor.set(item.majorCode, entry);
    }
    return [...byMajor.values()];
  }, [filteredChoices]);

  const save = useMutation({
    mutationFn: () => studentAcademicService.changeCurriculum(curriculumId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
      toast.success('Your major and curriculum were saved.');
    },
    onError: (err) => setError(saveErrorMessage(err)),
  });

  const isSet = !!current;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 ${compact ? 'px-4 py-3' : 'px-6 py-4'}`}>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
            <GraduationCap className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Major &amp; Curriculum</h2>
            <p className="text-xs text-gray-500">Matched to your cohort from Student ID.</p>
          </div>
        </div>
        {detectedCohort && (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#C2410C] ring-1 ring-inset ring-orange-200/80">
            Cohort {detectedCohort} · {detected?.code}
          </span>
        )}
      </div>

      <div className={compact ? 'space-y-3 p-4' : 'space-y-4 p-6'}>
        {!isSet && (
          <p
            role="note"
            className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-900"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
            You have not chosen your major yet. Choose it so your progress and study plan can be built.
          </p>
        )}

        <div>
          <label htmlFor="profile-curriculum" className="block text-xs font-semibold text-gray-700">
            Major / Curriculum
          </label>
          <select
            id="profile-curriculum"
            value={curriculumId}
            onChange={(e) => {
              setCurriculumId(e.target.value);
              setError(null);
            }}
            disabled={choices.isLoading}
            className="mt-1.5 h-9.5 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 outline-none transition-colors focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/15"
          >
            <option value="">
              {choices.isLoading
                ? 'Loading...'
                : 'Select major...'}
            </option>
            {groups.map((group) =>
              group.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {detectedCohort ? item.name : `${item.name} (${item.version})`}
                </option>
              )),
            )}
          </select>
          <p className="mt-1.5 text-xs text-gray-400">
            {detectedCohort
              ? `Filtered automatically for cohort ${detectedCohort} from your Student ID. Editable until grades are recorded.`
              : 'Editable until grades are recorded.'}
          </p>
          {choices.isError && <p className="mt-1 text-xs text-red-600">Could not load curriculums. Please reload.</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={!curriculumId || curriculumId === current || save.isPending}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="size-4" aria-hidden />
            {save.isPending ? 'Saving...' : isSet ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </section>
  );
}
