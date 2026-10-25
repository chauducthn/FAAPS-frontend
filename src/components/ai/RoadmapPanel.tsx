// src/components/ai/RoadmapPanel.tsx
// Panel "Lộ trình học": form yêu cầu AI sinh roadmap + timeline đồ họa.
// Dùng cho trang /student/ai-roadmap của sinh viên.

import { useState } from 'react';
import { Route, Sparkles } from 'lucide-react';
import { useStudyRoadmap } from '../../hooks/queries/useAiStudentQueries';
import { useGenerateRoadmap } from '../../hooks/mutations/useAiStudentMutations';
import { RoadmapTimeline } from './RoadmapTimeline';

const MAX_GOAL = 500;
const field =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]';

export function RoadmapPanel() {
  const roadmapQuery = useStudyRoadmap();
  const generate = useGenerateRoadmap();

  const [goal, setGoal] = useState('');
  const [maxCredits, setMaxCredits] = useState('');

  const roadmap = roadmapQuery.data ?? null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const credits = Number(maxCredits);
    generate.mutate({
      goal: goal.trim() ? goal.trim() : undefined,
      maxCreditsPerSemester:
        maxCredits.trim() && Number.isFinite(credits) && credits > 0 ? Math.round(credits) : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Form sinh roadmap */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#151c27]">
          <Sparkles className="size-4 text-[#F26F21]" />
          Sinh lộ trình học bằng AI
        </h2>
        <p className="mt-0.5 text-[13px] text-[#555f6f]">
          AI phân tích GPA, tín chỉ đã tích lũy và chương trình đào tạo để gợi ý từng kỳ — trả về JSON cấu trúc hiển thị bên dưới.
        </p>

        <form onSubmit={handleGenerate} className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto]">
          <div>
            <label htmlFor="roadmap-goal" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]">
              Mục tiêu học tập
            </label>
            <input
              id="roadmap-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              maxLength={MAX_GOAL}
              placeholder="VD: Ra trường đúng hạn, GPA >= 8.0"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="roadmap-credits" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]">
              Tín chỉ tối đa / kỳ
            </label>
            <input
              id="roadmap-credits"
              value={maxCredits}
              onChange={(e) => setMaxCredits(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
              inputMode="numeric"
              placeholder="VD: 21"
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
              {generate.isPending ? 'Đang sinh...' : roadmap ? 'Sinh lại' : 'Sinh lộ trình'}
            </button>
          </div>
        </form>
      </section>

      {/* Kết quả */}
      {roadmapQuery.isLoading || generate.isPending ? (
        <section className="rounded-xl bg-white p-5 shadow-sm" aria-label="Đang tải lộ trình">
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
          <p className="text-sm font-semibold text-[#151c27]">Không tải được lộ trình học</p>
          <p className="text-[13px] text-[#555f6f]">Đã có lỗi xảy ra khi tải dữ liệu.</p>
          <button
            type="button"
            onClick={() => roadmapQuery.refetch()}
            className="mt-1 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Thử lại
          </button>
        </section>
      ) : !roadmap ? (
        <section className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-full bg-orange-100 text-[#F26F21]">
            <Route className="size-5" />
          </span>
          <p className="text-sm font-semibold text-[#151c27]">Chưa có lộ trình học nào</p>
          <p className="max-w-md text-[13px] text-[#555f6f]">
            Nhập mục tiêu ở trên rồi bấm “Sinh lộ trình” để AI gợi ý timeline từng học kỳ cho bạn.
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
