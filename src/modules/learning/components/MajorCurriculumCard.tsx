// Student / Profile: the student chooses (or later changes) the major and curriculum they follow.
// Nothing is detected or filtered from the Student ID: students who changed major or start in semester 0 do not
// match it, so every active curriculum is offered.

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Info } from 'lucide-react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { studentAcademicService } from '@/modules/academic/services/studentAcademicService';
import { useCurriculumChoices } from '@/modules/auth/hooks/queries/useStudentOnboarding';
import type { StudentProfile } from '../../advising/types/advising';
import { STUDENT_QUERY_KEYS } from '../hooks/queries/useStudentQueries';

export function MajorCurriculumCard({ profile }: { profile: StudentProfile }) {
  const queryClient = useQueryClient();
  const choices = useCurriculumChoices();
  const current = profile.curriculumVersionId ?? '';
  const [curriculumId, setCurriculumId] = useState(current);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurriculumId(current);
    setError(null);
  }, [current]);

  const groups = useMemo(() => {
    const byMajor = new Map<string, { label: string; items: NonNullable<typeof choices.data> }>();
    for (const item of choices.data ?? []) {
      const entry = byMajor.get(item.majorCode) ?? { label: `${item.majorCode} - ${item.majorName}`, items: [] };
      entry.items.push(item);
      byMajor.set(item.majorCode, entry);
    }
    return [...byMajor.values()];
  }, [choices.data]);

  const save = useMutation({
    mutationFn: () => studentAcademicService.changeCurriculum(curriculumId),
    onSuccess: async () => {
      // Progress, curriculum and roadmap all depend on the curriculum, so every student query is refreshed.
      await queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
      toast.success('Your major and curriculum were saved.');
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const isSet = !!current;

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <GraduationCap className="size-4 text-[#F26F21]" aria-hidden />
        <h2 className="text-sm font-semibold text-[#151c27]">Major &amp; Curriculum</h2>
      </div>

      {!isSet && (
        <p
          role="note"
          className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          You have not chosen your major yet. Choose it so your progress and study plan can be built.
        </p>
      )}

      <label htmlFor="profile-curriculum" className="mt-4 block text-xs font-semibold text-[#555f6f]">
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
        className="mt-1 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none focus:border-[#F26F21]"
      >
        <option value="">{choices.isLoading ? 'Loading...' : 'Select your major and cohort...'}</option>
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.version} - {item.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="mt-1 text-[12px] text-[#98a2b3]">
        You can change it later, until your transcript has grades. After that, contact the Academic Office.
      </p>
      {choices.isError && <p className="mt-1 text-[12px] text-red-600">Could not load the curriculums. Please reload the page.</p>}

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={!curriculumId || curriculumId === current || save.isPending}
          className="rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {save.isPending ? 'Saving...' : isSet ? 'Update' : 'Save'}
        </button>
      </div>
    </section>
  );
}
