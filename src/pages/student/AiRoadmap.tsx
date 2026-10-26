// src/pages/student/AiRoadmap.tsx
// Trang "Lộ trình học" của sinh viên: form sinh roadmap + timeline đồ họa từ JSON AI trả về.

import { RoadmapPanel } from '../../components/ai/RoadmapPanel';


export default function StudentAiRoadmap() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Sinh viên / Lộ trình học</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Lộ trình học của bạn</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          AI sinh tự động từ GPA, tín chỉ đã tích lũy và chương trình đào tạo — hiển thị dạng timeline từng học kỳ.
        </p>
      </div>



      <RoadmapPanel />
    </div>
  );
}
