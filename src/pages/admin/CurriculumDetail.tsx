// src/pages/admin/CurriculumDetail.tsx
// /admin/curriculum/:id → Semester planner + add/remove courses

import { useState } from 'react';
import { useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  SemesterPlanner,
  CoursePickerModal,
} from '../../components/admin/curriculum';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useCurriculum } from '../../hooks/queries/useCurriculumsQuery';
import { useCurriculumMutations } from '../../hooks/mutations/useCurriculumMutations';
import { useCoursesQuery } from '../../hooks/queries/useCoursesQuery';

export default function CurriculumDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useCurriculum(id);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSemester, setPickerSemester] = useState<number>(1);
  const [removing, setRemoving] = useState<{
    curriculumCourseId: string;
    semesterNumber: number;
  } | null>(null);

  const coursesQuery = useCoursesQuery({ size: 200 });
  const {
    addCourse,
    isAddingCourse,
    removeCourse,
    isRemovingCourse,
  } = useCurriculumMutations();

  if (isLoading) return <p className="text-xs text-gray-500">Loading curriculum...</p>;
  if (isError || !data) {
    return (
      <p className="text-xs text-red-600">
        Could not load this curriculum. Check that the link is valid.
      </p>
    );
  }

  const addedIds = data.semesters.flatMap((s) => s.courses.map((c) => c.courseId));

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => history.back()}
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
        onAddCourse={(semesterNumber) => {
          setPickerSemester(semesterNumber);
          setPickerOpen(true);
        }}
        onEditCourse={(c) => toast.info(`Edit row for ${c.courseCode} coming soon`)}
        onRemoveCourse={(c, sn) => setRemoving({ curriculumCourseId: c.curriculumCourseId, semesterNumber: sn })}
      />

      <CoursePickerModal
        open={pickerOpen}
        semesterNumber={pickerSemester}
        courses={coursesQuery.data?.items ?? []}
        alreadyAddedCourseIds={addedIds}
        isLoading={isAddingCourse}
        onClose={() => setPickerOpen(false)}
        onPick={async (course, meta) => {
          await addCourse({
            curriculumId: data.id,
            body: {
              courseId: course.id,
              semesterNumber: pickerSemester,
              isMandatory: meta.isMandatory,
              groupName: meta.groupName,
            },
          });
          setPickerOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!removing}
        title="Remove course from semester?"
        message="The course stays in the master catalogue, only its link to this curriculum is removed."
        confirmLabel="Remove"
        destructive
        isLoading={isRemovingCourse}
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          await removeCourse({
            curriculumId: data.id,
            curriculumCourseId: removing.curriculumCourseId,
          });
          setRemoving(null);
        }}
      />
    </div>
  );
}