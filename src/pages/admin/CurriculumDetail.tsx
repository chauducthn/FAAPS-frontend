// src/pages/admin/CurriculumDetail.tsx
// /admin/curriculum/:id → Semester planner + add/remove courses

import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { SemesterPlanner } from '../../components/admin/curriculum';
import { useCurriculum } from '../../hooks/queries/useCurriculumsQuery';

export default function CurriculumDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useCurriculum(id);

  if (isLoading) return <p className="text-xs text-gray-500">Loading curriculum...</p>;
  if (isError || !data) {
    return (
      <p className="text-xs text-red-600">
        Could not load this curriculum. Check that the link is valid.
      </p>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="size-3.5" /> Back to list
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight mt-1">{data.name}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.majorCode} - {data.majorName} · {data.totalCourses} courses ·{' '}
            {data.totalCredits} credits
          </p>
        </div>
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
            data.status === 'ACTIVE'
              ? 'bg-emerald-100/70 text-emerald-700'
              : data.status === 'ARCHIVED'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-amber-100/80 text-amber-700'
          }`}
        >
          {data.status}
        </span>
      </div>

      <SemesterPlanner
        semesters={data.semesters}
        readonly
      />
    </div>
  );
}
