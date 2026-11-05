// src/modules/management/pages/CurriculumDetail.tsx
// /admin/curriculum/:id - the Academic Roadmap of one curriculum: one column per semester,
// one card per course.
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Archive, ArrowUpRight, ChevronRight, Pencil, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { curriculumService } from '../services/curriculum.service';
import AddCoursesModal from '../components/curriculum/AddCoursesModal';
import CurriculumFormModal from '../components/curriculum/CurriculumFormModal';
import RoadmapBoard from '../components/curriculum/RoadmapBoard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { buildRoadmap } from '../../academic/roadmap/buildRoadmap';
import { resolveMilestone } from '../../academic/roadmap/milestones';
import { StatusBadge } from '../components/StatusBadge';
import { useCurriculum, useCurriculumCourses } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useAcademicRulesQuery } from '../../academic/hooks/queries/useAcademicRulesQuery';
import { useRoadmapCourseDetails } from '../../academic/hooks/queries/useRoadmapCourseDetails';
import { useCurriculumMutations } from '../../academic/hooks/mutations/useCurriculumMutations';
import type { CurriculumInput } from '../../academic/types/curriculum';
import type { RoadmapCourse } from '../../academic/types/roadmap';

export default function CurriculumDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const curriculum = useCurriculum(id);
  const courses = useCurriculumCourses(id);
  const { addCourses, isAddingCourses, updateCourse, removeCourse, updateStatus, isUpdatingStatus } =
    useCurriculumMutations('curriculum');
  const [picker, setPicker] = useState<{ semester: number } | null>(null);
  const [importing, setImporting] = useState(false);
  // The preview of a spreadsheet that has invalid rows; the valid rows can still be imported.
  const [importPreview, setImportPreview] = useState<Awaited<ReturnType<typeof curriculumService.previewImport>> | null>(null);
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);

  // The rules carry the milestone thresholds (how many credits an internship needs).
  const rules = useAcademicRulesQuery({ curriculumVersionId: id, size: 100 });

  const list = courses.data ?? [];
  const placed = useMemo(() => new Map(list.map((c) => [c.courseId, c.semesterNumber])), [list]);

  // Course details add the category line and the prerequisite codes to each card.
  const details = useRoadmapCourseDetails(list.map((c) => c.courseId));

  const semesters = useMemo(() => {
    const withDetails = list.map((course) => {
      const detail = details.get(course.courseId);
      const prerequisites = (detail?.relations ?? [])
        .filter((relation) => relation.kind === 'PREREQUISITE')
        .map((relation) => ({
          code: relation.otherCourseCode,
          minimumScore: relation.minimumScore,
        }));

      const categoryLabel = detail
        ? `${detail.categoryCode} | ${detail.categoryName}`
        : course.groupName;

      return {
        ...course,
        categoryLabel,
        prerequisites,
        milestone: resolveMilestone(course, rules.data?.items ?? []),
      };
    });
    return buildRoadmap(withDetails);
  }, [list, details, rules.data?.items]);

  if (curriculum.isLoading) return <p className="text-xs text-gray-500">Loading curriculum...</p>;
  if (curriculum.isError || !curriculum.data) {
    return <p className="text-xs text-red-600">Could not load this curriculum. Check that the link is valid.</p>;
  }
  const data = curriculum.data;
  const isPublished = data.status === 'ACTIVE';

  const handleMove = (course: RoadmapCourse, semesterNumber: number) => {
    void updateCourse({
      id,
      courseId: course.courseId,
      semesterNumber,
      isMandatory: course.kind === 'MANDATORY',
    });
  };

  // A card dropped into another column: move the course to that semester.
  const handleDropCourse = (courseId: string, semesterNumber: number) => {
    const course = list.find((c) => c.id === courseId);
    if (!course || course.semesterNumber === semesterNumber) return;

    void updateCourse({
      id,
      courseId: course.courseId,
      semesterNumber,
      isMandatory: course.isMandatory,
    });
  };

  const handleEdit = async (body: CurriculumInput) => {
    await curriculumService.update(id, body);
    toast.success('Curriculum updated');
    await curriculum.refetch();
  };

  return (
    <div className="w-full space-y-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
          <li>
            <button
              type="button"
              onClick={() => navigate('/admin/curriculum')}
              className="rounded transition-colors hover:text-[#C2410C]"
            >
              Academic Data
            </button>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3 text-gray-300" />
          </li>
          <li className="font-semibold text-gray-900" aria-current="page">
            Curriculum
          </li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold tracking-tight text-gray-900">{data.name}</h1>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Edit ${data.name}`}
              className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={data.status} />
            <span className="text-[11px] text-gray-500">
              {data.majorCode} · Cohort {data.version} · Start semester {data.effectiveFromSemesterCode}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
          >
            <Pencil className="size-3.5" /> Edit Draft
          </button>
          <button
            type="button"
            onClick={() => setArchiving(true)}
            disabled={!isPublished}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Archive className="size-3.5" /> Archive
          </button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-xs transition-colors hover:bg-gray-50">
            <Upload className="size-3.5" /> Import XLSX
            <input type="file" accept=".xlsx" className="hidden" disabled={importing} onChange={async (event) => {
              const file = event.target.files?.[0]; if (!file) return; setImporting(true);
              try { const preview = await curriculumService.previewImport(id, file);
                if (preview.errorRows) {
                  setImportPreview(preview);
                  toast.warning(preview.validRows
                    ? `${preview.errorRows} invalid row(s). Import the ${preview.validRows} valid row(s) or fix the spreadsheet and retry.`
                    : `${preview.errorRows} invalid row(s) and no valid row to import. Fix the spreadsheet and retry.`);
                } else {
                  setImportPreview(null);
                  const count = await curriculumService.confirmImport(id, preview); toast.success(`Imported ${count} curriculum course(s)`); await courses.refetch();
                }
              } finally { setImporting(false); event.target.value = ''; }
            }} />
          </label>
          <button
            type="button"
            disabled={isPublished || isUpdatingStatus}
            onClick={async () => {
              try {
                await updateStatus({ id, status: 'ACTIVE' });
                await curriculum.refetch();
              } catch {
                // The error toast is shown by the mutation / global handler.
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Publish Version <ArrowUpRight className="size-3.5" />
          </button>
        </div>
      </header>

      {importPreview?.errorRows ? (
        <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span>
              <strong>{importPreview.errorRows}</strong> invalid row(s) found in the spreadsheet
              {importPreview.validRows ? <>, <strong>{importPreview.validRows}</strong> valid.</> : '.'}
            </span>
            <div className="flex items-center gap-4">
              {importPreview.validRows ? (
                <button
                  type="button"
                  disabled={importing}
                  className="rounded-lg bg-[#F26F21] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#e05f14] disabled:opacity-60"
                  onClick={async () => {
                    setImporting(true);
                    try {
                      // The backend refuses a preview that still contains invalid rows, so send the valid ones only.
                      const valid = { ...importPreview, items: importPreview.items.filter((item) => item.errors.length === 0) };
                      const count = await curriculumService.confirmImport(id, valid);
                      toast.success(`Imported ${count} curriculum course(s)`);
                      setImportPreview(null);
                      await courses.refetch();
                    } catch {
                      toast.error('Unable to import the valid rows.');
                    } finally {
                      setImporting(false);
                    }
                  }}
                >
                  Import {importPreview.validRows} valid row(s)
                </button>
              ) : null}
              <button type="button" className="font-semibold text-red-700 underline" onClick={() => setImportPreview(null)}>
                Dismiss
              </button>
            </div>
          </div>
          <ul className="list-disc pl-5 text-xs text-red-800">
            {importPreview.items
              .filter((item) => item.errors.length > 0)
              .slice(0, 5)
              .map((item) => (
                <li key={item.rowNumber}>
                  Row {item.rowNumber} ({item.courseCode}): {item.errors.join('; ')}
                </li>
              ))}
            {importPreview.errorRows > 5 ? <li>and {importPreview.errorRows - 5} more...</li> : null}
          </ul>
        </div>
      ) : null}

      {courses.isLoading ? (
        <p className="text-xs text-gray-500">Loading courses...</p>
      ) : courses.isError ? (
        <p className="text-xs text-red-600">Could not load the courses of this curriculum.</p>
      ) : (
        <RoadmapBoard
          semesters={semesters}
          onAdd={(semester) => setPicker({ semester })}
          onMove={handleMove}
          onRemove={(course) => removeCourse({ id, courseId: course.courseId })}
          onDropCourse={handleDropCourse}
        />
      )}

      <AddCoursesModal
        open={!!picker}
        defaultSemester={picker?.semester ?? 1}
        placedCourses={placed}
        isSubmitting={isAddingCourses}
        onClose={() => setPicker(null)}
        onSubmit={(body) => addCourses({ id, body })}
      />

      <CurriculumFormModal
        open={editing}
        noun="Curriculum"
        initial={data}
        isSubmitting={isUpdatingStatus}
        onClose={() => setEditing(false)}
        onSubmit={handleEdit}
      />

      <ConfirmDialog
        open={archiving}
        title="Archive this curriculum?"
        message={`Archive ${data.name}? It stays in the list for reporting but stops being the active version of ${data.majorCode}.`}
        confirmLabel="Archive"
        isLoading={isUpdatingStatus}
        onCancel={() => setArchiving(false)}
        onConfirm={async () => {
          try {
            await updateStatus({ id, status: 'INACTIVE' });
            await curriculum.refetch();
          } catch {
            // The error toast is shown by the mutation / global handler.
          }
          setArchiving(false);
        }}
      />
    </div>
  );
}
