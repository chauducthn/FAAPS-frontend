// src/pages/learning/AiRoadmap.tsx
// Trang "Lộ trình học" của sinh viên: form sinh roadmap + timeline đồ họa từ JSON AI trả về.

import { RoadmapPanel } from '../../ai/components/RoadmapPanel';


export default function StudentAiRoadmap() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Student / Study Roadmap</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Your Study Roadmap</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Generated from your GPA, earned credits, and curriculum as a semester-by-semester timeline.
        </p>
      </div>



      <RoadmapPanel />
    </div>
  );
}
