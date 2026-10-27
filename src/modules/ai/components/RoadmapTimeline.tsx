// src/components/ai/RoadmapTimeline.tsx
// Hiển thị Lộ trình học do AI sinh — dạng Timeline dọc theo học kỳ.
// Dữ liệu là JSON cấu trúc từ backend (StudyRoadmap), mỗi kỳ là một node,
// mỗi môn là một thẻ con với tín chỉ / trạng thái / môn tiên quyết.

import { BookOpen, CheckCircle2, CircleDashed, Clock3, Flag, LoaderCircle, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type {
  RoadmapCourse,
  RoadmapCourseStatus,
  RoadmapSemester,
  RoadmapSemesterStatus,
  StudyRoadmap,
} from '../types/ai-student';

const SEMESTER_STYLES: Record<RoadmapSemesterStatus, { label: string; dot: string; badge: string }> = {
  COMPLETED: { label: 'Completed', dot: 'bg-green-500', badge: 'bg-green-100 text-green-800 ring-green-200' },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-[#F26F21]', badge: 'bg-orange-100 text-orange-800 ring-orange-200' },
  PLANNED: { label: 'Planned', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 ring-blue-200' },
  SUGGESTED: { label: 'AI Suggested', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800 ring-purple-200' },
};

const COURSE_STYLES: Record<RoadmapCourseStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  PASSED: { label: 'Passed', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  IN_PROGRESS: { label: 'In Progress', icon: LoaderCircle, className: 'bg-orange-100 text-orange-700' },
  PLANNED: { label: 'Planned', icon: Clock3, className: 'bg-blue-100 text-blue-700' },
  SUGGESTED: { label: 'Suggested', icon: Sparkles, className: 'bg-purple-100 text-purple-700' },
  FAILED: { label: 'Not Passed', icon: CircleDashed, className: 'bg-red-100 text-red-700' },
};

const PRIORITY_LABEL: Record<RoadmapCourse['priority'], string> = {
  HIGH: 'High priority',
  MEDIUM: 'Medium priority',
  LOW: 'Low priority',
};

function CourseCard({ course }: { course: RoadmapCourse }) {
  const style = COURSE_STYLES[course.status];
  const Icon = style.icon;

  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 transition-shadow hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#151c27]">
            <span className="text-[#F26F21]">{course.courseCode}</span>
            {' · '}
            {course.courseName}
          </p>
          <p className="mt-0.5 text-[12px] text-[#555f6f]">
            {course.credits} credits
            {course.categoryName ? ` · ${course.categoryName}` : ''}
            {course.isMandatory ? ' · Required' : ' · Elective'}
            {' · '}
            {PRIORITY_LABEL[course.priority]}
          </p>
        </div>
        <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', style.className)}>
          <Icon className="size-3" />
          {style.label}
        </span>
      </div>
      {course.reason && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-[#555f6f]">
          <span className="font-semibold text-[#151c27]">Why AI suggested this: </span>
          {course.reason}
        </p>
      )}
      {course.prerequisites.length > 0 && (
        <p className="mt-1 text-[11px] text-[#98a2b3]">
          Prerequisites: <span className="font-semibold text-[#555f6f]">{course.prerequisites.join(', ')}</span>
        </p>
      )}
    </div>
  );
}

function SemesterNode({ semester, isLast }: { semester: RoadmapSemester; isLast: boolean }) {
  const style = SEMESTER_STYLES[semester.status];

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Trục timeline */}
      {!isLast && <span className="absolute bottom-0 left-[15px] top-9 w-0.5 bg-[#e5e7eb]" aria-hidden="true" />}
      <span className={cn('z-10 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm', style.dot)}>
        {semester.status === 'COMPLETED' ? (
          <CheckCircle2 className="size-4" />
        ) : semester.status === 'IN_PROGRESS' ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : semester.status === 'SUGGESTED' ? (
          <Sparkles className="size-4" />
        ) : (
          <Flag className="size-4" />
        )}
      </span>

      <div className="min-w-0 flex-1 rounded-xl border border-[#e5e7eb] bg-[#f7f8fa] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#151c27]">
              Semester {semester.semesterNumber} · {semester.title}
            </h3>
            <p className="mt-0.5 text-[12px] text-[#555f6f]">
              {semester.semesterCode ? `${semester.semesterCode} · ` : ''}
              {semester.totalCredits} credits · {semester.courses.length} courses
            </p>
          </div>
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', style.badge)}>
            {style.label}
          </span>
        </div>

        {semester.note && (
          <p className="mt-2 rounded-lg bg-white px-3 py-2 text-[12px] leading-relaxed text-[#555f6f] ring-1 ring-inset ring-[#e5e7eb]">
            {semester.note}
          </p>
        )}

        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
          {semester.courses.map((c) => (
            <CourseCard key={c.courseId} course={c} />
          ))}
        </div>
      </div>
    </li>
  );
}

export function RoadmapTimeline({ roadmap }: { roadmap: StudyRoadmap }) {
  return (
    <div>
      {/* Tóm tắt do AI sinh */}
      <div className="rounded-xl border border-orange-200 bg-[#fff7ed] p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#b45309]">
          <Sparkles className="size-3.5" />
          AI Summary {roadmap.modelName ? `· ${roadmap.modelName}` : ''}
          {typeof roadmap.confidenceScore === 'number' ? ` · Confidence ${Math.round(roadmap.confidenceScore * 100)}%` : ''}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#151c27]">{roadmap.summary}</p>
        <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-semibold text-[#555f6f]">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3.5" />
            {roadmap.totalSemesters} semesters · {roadmap.totalCredits} credits
          </span>
          <span>Generated {new Date(roadmap.generatedAt).toLocaleString('en-GB')}</span>
        </p>
      </div>

      {/* Timeline các học kỳ */}
      <ol className="mt-5">
        {roadmap.semesters.map((s, i) => (
          <SemesterNode key={`${s.semesterNumber}-${s.semesterCode ?? 'plan'}`} semester={s} isLast={i === roadmap.semesters.length - 1} />
        ))}
      </ol>
    </div>
  );
}
