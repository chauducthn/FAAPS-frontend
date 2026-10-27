// src/pages/management/CurriculumDetail.tsx
// /admin/curriculum/:id - courses of one curriculum by semester, with a check-box picker to add more.
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { curriculumService } from '../../services/management/curriculum.service';
import AddCoursesModal from '../../components/management/curriculum/AddCoursesModal';
import SemesterPlanner from '../../components/management/curriculum/SemesterPlanner';
import { StatusBadge } from '../../components/management/StatusBadge';
import { useCurriculum, useCurriculumCourses } from '../../hooks/queries/useCurriculumsQuery';
import { useCurriculumMutations } from '../../hooks/mutations/useCurriculumMutations';

export default function CurriculumDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const curriculum = useCurriculum(id);
  const courses = useCurriculumCourses(id);
  const { addCourses, isAddingCourses, updateCourse, removeCourse } = useCurriculumMutations('curriculum');
  const [picker, setPicker] = useState<{ semester: number } | null>(null);
  const [importing, setImporting] = useState(false);

  const list = courses.data ?? [];
  const placed = useMemo(() => new Map(list.map((c) => [c.courseId, c.semesterNumber])), [list]);
  const totalCredits = list.reduce((sum, c) => sum + c.credits, 0);
  const mandatory = list.filter((c) => c.isMandatory).length;

  if (curriculum.isLoading) return <p className="text-xs text-gray-500">Loading curriculum...</p>;
  if (curriculum.isError || !curriculum.data) {
    return <p className="text-xs text-red-600">Could not load this curriculum. Check that the link is valid.</p>;
  }
  const data = curriculum.data;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button type="button" onClick={() => navigate('/admin/curriculum')} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900">
            <ArrowLeft className="size-3.5" /> Back to curriculum list
          </button>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900">{data.name}</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            {data.majorCode} - {data.majorName} · Cohort {data.version} · Start semester {data.effectiveFromSemesterCode}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={data.status} />
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold">
            <Upload className="size-4" /> Import XLSX
            <input type="file" accept=".xlsx" className="hidden" disabled={importing} onChange={async (event) => {
              const file = event.target.files?.[0]; if (!file) return; setImporting(true);
              try { const preview = await curriculumService.previewImport(id, file);
                if (preview.errorRows) toast.error(`${preview.errorRows} invalid row(s). Fix the spreadsheet and retry.`);
                else { const count = await curriculumService.confirmImport(id, preview); toast.success(`Imported ${count} curriculum course(s)`); await courses.refetch(); }
              } finally { setImporting(false); event.target.value = ''; }
            }} />
          </label>
          <button
            type="button"
            onClick={() => setPicker({ semester: 1 })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e05f14]"
          >
            <Plus className="size-4" /> Add courses
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Courses" value={list.length} />
        <Stat label="Total credits" value={totalCredits} />
        <Stat label="Mandatory" value={mandatory} />
        <Stat label="Elective" value={list.length - mandatory} />
      </div>

      {data.description && <p className="rounded-xl border border-gray-200/80 bg-white p-4 text-xs leading-relaxed text-gray-700">{data.description}</p>}

      {courses.isLoading ? (
        <p className="text-xs text-gray-500">Loading courses...</p>
      ) : courses.isError ? (
        <p className="text-xs text-red-600">Could not load the courses of this curriculum.</p>
      ) : (
        <SemesterPlanner courses={list} onAdd={(semester) => setPicker({ semester })}
          onMove={(course, semesterNumber) => updateCourse({ id, courseId: course.courseId, semesterNumber, isMandatory: course.isMandatory })}
          onRemove={(course) => removeCourse({ id, courseId: course.courseId })} />
      )}

      <AddCoursesModal
        open={!!picker}
        defaultSemester={picker?.semester ?? 1}
        placedCourses={placed}
        isSubmitting={isAddingCourses}
        onClose={() => setPicker(null)}
        onSubmit={(body) => addCourses({ id, body })}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
