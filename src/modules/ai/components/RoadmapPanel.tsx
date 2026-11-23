// src/components/ai/RoadmapPanel.tsx
// Panel "Lộ trình học": form yêu cầu AI sinh roadmap + timeline đồ họa.
// Dùng cho trang /student/ai-roadmap của sinh viên.
//
// Form gồm 5 tham số:
//   goal                       — mục tiêu tự do (vd "Ra trường đúng hạn, GPA >= 8.0")
//   maxCreditsPerSemester      — giới hạn tín chỉ mỗi kỳ
//   expectedGraduationSemesterId — kỳ học dự kiến tốt nghiệp (từ GET /student/semesters)
//   orientation                — định hướng nghề nghiệp
//   targetGpa                  — GPA mục tiêu (0 - 10)
//
// Lưu ý: BE hiện tại (`StudentRoadmapService.generate()`) mới chỉ xử lý
// `maxCreditsPerSemester`; `goal` chỉ được nối vào mô tả. Ba tham số còn lại vẫn được
// gửi lên payload để khớp thiết kế đã duyệt, và sẽ có tác dụng ngay khi BE bổ sung.

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Route, Sparkles } from 'lucide-react';
import { useStudyRoadmap } from '../hooks/queries/useAiStudentQueries';
import { useGenerateRoadmap } from '../hooks/mutations/useAiStudentMutations';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import type { RoadmapOrientation } from '../types/ai-student';
import { RoadmapTimeline } from './RoadmapTimeline';

const MAX_GOAL = 500;
const field =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]';

const ORIENTATIONS: { value: RoadmapOrientation; label: string; hint: string }[] = [
  { value: 'ACADEMIC', label: 'Academic', hint: 'Ưu tiên học thuật, GPA cao, chuyên sâu' },
  { value: 'JOB', label: 'Job', hint: 'Ưu tiên môn thực hành, kỹ năng nghề nghiệp' },
  { value: 'RESEARCH', label: 'Research', hint: 'Ưu tiên môn nghiên cứu, đồ án, thực tập nghiên cứu' },
  { value: 'ENTREPRENEURIAL', label: 'Entrepreneurial', hint: 'Ưu tiên môn khởi nghiệp, quản trị, dự án' },
];

export function RoadmapPanel() {
  const roadmapQuery = useStudyRoadmap();
  const generate = useGenerateRoadmap();

  // Danh sách kỳ học để chọn "kỳ dự kiến tốt nghiệp".
  const semestersQuery = useQuery({
    queryKey: ['student', 'semesters'],
    queryFn: studentAcademicService.semesters,
    staleTime: 5 * 60 * 1000,
  });

  const [goal, setGoal] = useState('');
  const [maxCredits, setMaxCredits] = useState('');
  const [expectedGraduationSemesterId, setExpectedGraduationSemesterId] = useState('');
  const [orientation, setOrientation] = useState<RoadmapOrientation | ''>('');
  const [targetGpa, setTargetGpa] = useState('');

  const roadmap = roadmapQuery.data ?? null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const credits = Number(maxCredits);
    const gpa = Number(targetGpa);
    generate.mutate({
      goal: goal.trim() ? goal.trim() : undefined,
      maxCreditsPerSemester:
        maxCredits.trim() && Number.isFinite(credits) && credits > 0 ? Math.round(credits) : undefined,
      expectedGraduationSemesterId: expectedGraduationSemesterId || undefined,
      orientation: orientation || undefined,
      targetGpa:
        targetGpa.trim() && Number.isFinite(gpa) && gpa >= 0 && gpa <= 10
          ? Math.round(gpa * 100) / 100
          : undefined,
    });
  };

  const semesters = semestersQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Form sinh roadmap */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#151c27]">
          <Sparkles className="size-4 text-[#F26F21]" />
          Generate a Curriculum Study Roadmap
        </h2>
        <p className="mt-0.5 text-[13px] text-[#555f6f]">
          This roadmap organizes curriculum courses by semester and credit limit. Review it before submitting a study plan.
        </p>

        <form onSubmit={handleGenerate} className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto]">
          <div>
            <label htmlFor="roadmap-goal" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]">
              Academic Goal
            </label>
            <input
              id="roadmap-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              maxLength={MAX_GOAL}
              placeholder="Example: Graduate on time with a GPA of at least 8.0"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="roadmap-credits" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]">
              Maximum Credits per Semester
            </label>
            <input
              id="roadmap-credits"
              value={maxCredits}
              onChange={(e) => setMaxCredits(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
              inputMode="numeric"
              placeholder="e.g. 21"
              className={field}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={generate.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              <Route className="size-4" />
              {generate.isPending ? 'Generating...' : roadmap ? 'Regenerate' : 'Generate Roadmap'}
            </button>
          </div>
        </form>

        {/* ── Tham số nâng cao: kỳ tốt nghiệp, định hướng, GPA mục tiêu ── */}
        <div className="mt-4 grid gap-3 border-t border-[#f1f5f9] pt-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="roadmap-graduation-semester"
              className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]"
            >
              Expected Graduation Semester
            </label>
            <select
              id="roadmap-graduation-semester"
              value={expectedGraduationSemesterId}
              onChange={(e) => setExpectedGraduationSemesterId(e.target.value)}
              disabled={semestersQuery.isLoading || semesters.length === 0}
              className={`${field} disabled:cursor-not-allowed disabled:bg-[#f7f8fa] disabled:opacity-70`}
            >
              <option value="">
                {semestersQuery.isLoading ? 'Loading semesters...' : 'Select a semester'}
              </option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.name}
                </option>
              ))}
            </select>
            {semestersQuery.isError && (
              <p className="mt-1 text-[11px] text-amber-700">Could not load semesters — leave this blank.</p>
            )}
          </div>

          <div>
            <label
              htmlFor="roadmap-orientation"
              className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]"
            >
              Orientation
            </label>
            <select
              id="roadmap-orientation"
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as RoadmapOrientation | '')}
              className={field}
            >
              <option value="">Not specified</option>
              {ORIENTATIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[#98a2b3]">
              {ORIENTATIONS.find((o) => o.value === orientation)?.hint ?? 'Pick the focus of your roadmap.'}
            </p>
          </div>

          <div>
            <label
              htmlFor="roadmap-target-gpa"
              className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]"
            >
              Target GPA (0 - 10)
            </label>
            <input
              id="roadmap-target-gpa"
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={targetGpa}
              onChange={(e) => setTargetGpa(e.target.value)}
              placeholder="e.g. 8.0"
              className={field}
            />
            <p className="mt-1 text-[11px] text-[#98a2b3]">
              {targetGpa.trim() && (Number(targetGpa) < 0 || Number(targetGpa) > 10)
                ? 'Must be between 0 and 10.'
                : 'The GPA you aim to graduate with.'}
            </p>
          </div>
        </div>
      </section>

      {/* Kết quả */}
      {roadmapQuery.isLoading || generate.isPending ? (
        <section className="rounded-xl bg-white p-5 shadow-sm" aria-label="Loading roadmap">
          <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          <div className="mt-3 h-20 animate-pulse rounded-lg bg-gray-100" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </section>
      ) : roadmapQuery.isError ? (
        <section className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#151c27]">Unable to load the study roadmap</p>
          <p className="text-[13px] text-[#555f6f]">An error occurred while loading data.</p>
          <button
            type="button"
            onClick={() => roadmapQuery.refetch()}
            className="mt-1 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Try again
          </button>
        </section>
      ) : !roadmap ? (
        <section className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-full bg-orange-100 text-[#F26F21]">
            <Route className="size-5" />
          </span>
          <p className="text-sm font-semibold text-[#151c27]">No study roadmap yet</p>
          <p className="max-w-md text-[13px] text-[#555f6f]">
            Enter your goal above, then select “Generate Roadmap” for an AI-generated semester timeline.
          </p>
        </section>
      ) : (
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <RoadmapTimeline roadmap={roadmap} />
        </section>
      )}
    </div>
  );
}
