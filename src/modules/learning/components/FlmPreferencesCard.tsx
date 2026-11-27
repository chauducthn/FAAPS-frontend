// Student / Profile: FLM specialization combo (Sem 5+) and Sem 0 electives (English, Physical Education, Instrument).

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FloppyDisk as Save, SlidersHorizontal } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { studentAcademicService } from '@/modules/academic/services/studentAcademicService';
import { STUDENT_QUERY_KEYS } from '../hooks/queries/useStudentQueries';

const selectCls =
  'mt-1.5 h-9.5 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 outline-none transition-colors focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/15';

export function FlmPreferencesCard({ majorCode }: { majorCode?: string | null }) {
  const queryClient = useQueryClient();
  const prefsQuery = useQuery({
    queryKey: [...STUDENT_QUERY_KEYS.all, 'flm-preferences', majorCode ?? null],
    queryFn: studentAcademicService.getFlmPreferences,
  });

  const [comboCode, setComboCode] = useState('');
  const [englishPrep, setEnglishPrep] = useState('');
  const [instrument, setInstrument] = useState('');
  const [physicalEd, setPhysicalEd] = useState('');

  const data = prefsQuery.data;
  useEffect(() => {
    if (!data) return;
    setComboCode(data.comboCode ?? '');
    setEnglishPrep(data.englishPrep ?? '');
    setInstrument(data.musicalInstrument ?? '');
    setPhysicalEd(data.physicalEducation ?? '');
  }, [data]);

  const selectedCombo = useMemo(
    () => (data?.combos ?? []).find((c) => c.code === comboCode),
    [data, comboCode],
  );

  const dirty =
    !!data &&
    (comboCode !== (data.comboCode ?? '') ||
      englishPrep !== (data.englishPrep ?? '') ||
      instrument !== (data.musicalInstrument ?? '') ||
      physicalEd !== (data.physicalEducation ?? ''));

  const save = useMutation({
    mutationFn: () =>
      studentAcademicService.saveFlmPreferences({
        comboCode: comboCode || null,
        englishPrep: englishPrep || null,
        musicalInstrument: instrument || null,
        physicalEducation: physicalEd || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
      toast.success('FLM curriculum preferences saved.');
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <SlidersHorizontal className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Specialization &amp; Electives</h2>
            <p className="text-xs text-gray-500">Resolves Semester 0 &amp; Semester 5+ FLM placeholders.</p>
          </div>
        </div>
        {dirty && (
          <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-[#C2410C] ring-1 ring-inset ring-orange-200">
            Unsaved
          </span>
        )}
      </div>

      <div className="space-y-4 p-6">
        <div>
          <label htmlFor="flm-combo" className="block text-xs font-semibold text-gray-700">
            Specialization Combo (Sem 5 – 8)
          </label>
          <select
            id="flm-combo"
            value={comboCode}
            disabled={prefsQuery.isLoading || (data?.combos?.length ?? 0) === 0}
            onChange={(e) => setComboCode(e.target.value)}
            className={selectCls}
          >
            <option value="">
              {(data?.combos?.length ?? 0) === 0
                ? 'No combos imported from FLM yet'
                : 'Not selected (keep COM* placeholders)'}
            </option>
            {(data?.combos ?? []).map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          {selectedCombo && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {selectedCombo.courses.map((course) => (
                <span
                  key={course.code}
                  title={course.name}
                  className="inline-flex items-center gap-1 rounded-md border border-orange-200/80 bg-orange-50/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#C2410C]"
                >
                  {course.code}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="flm-english" className="block text-xs font-semibold text-gray-700">
              Starting English Level (PEN)
            </label>
            <select
              id="flm-english"
              value={englishPrep}
              disabled={prefsQuery.isLoading || (data?.englishOptions?.length ?? 0) === 0}
              onChange={(e) => setEnglishPrep(e.target.value)}
              className={selectCls}
            >
              <option value="">
                {(data?.englishOptions?.length ?? 0) === 0 ? 'No PEN courses imported yet' : 'Default (PEN)'}
              </option>
              {(data?.englishOptions ?? []).map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="flm-pe" className="block text-xs font-semibold text-gray-700">
              Physical Education (PHE)
            </label>
            <select
              id="flm-pe"
              value={physicalEd}
              disabled={prefsQuery.isLoading || (data?.physicalEducationOptions?.length ?? 0) === 0}
              onChange={(e) => setPhysicalEd(e.target.value)}
              className={selectCls}
            >
              <option value="">
                {(data?.physicalEducationOptions?.length ?? 0) === 0 ? 'No PHE combos imported yet' : 'Not selected (PHE_COM*)'}
              </option>
              {(data?.physicalEducationOptions ?? []).map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="flm-instrument" className="block text-xs font-semibold text-gray-700">Instrument (TMI)</label>
            <select
              id="flm-instrument"
              value={instrument}
              disabled={prefsQuery.isLoading || (data?.instrumentOptions?.length ?? 0) === 0}
              onChange={(e) => setInstrument(e.target.value)}
              className={selectCls}
            >
              <option value="">
                {(data?.instrumentOptions?.length ?? 0) === 0 ? 'No TMI electives imported yet' : 'Not selected (TMI_ELE)'}
              </option>
              {(data?.instrumentOptions ?? []).map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={!dirty || save.isPending}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="size-4" aria-hidden />
            {save.isPending ? 'Saving...' : 'Save preferences'}
          </button>
        </div>
      </div>
    </section>
  );
}
