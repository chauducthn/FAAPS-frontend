// src/modules/management/pages/CurriculumDetail.tsx
// /admin/curriculum/:id - the Academic Roadmap of one curriculum: one column per semester,
// one card per course.
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Archive,
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  GraduationCap,
  Layers,
  Loader2,
  Pencil,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import AddCoursesModal from '../components/curriculum/AddCoursesModal';
import CurriculumFormModal from '../components/curriculum/CurriculumFormModal';
import ImportPreviewModal from '../components/curriculum/ImportPreviewModal';
import RoadmapBoard from '../components/curriculum/RoadmapBoard';
import { CourseDetailModal } from '../components/courses';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { buildRoadmap } from '../../academic/roadmap/buildRoadmap';
import { resolveMilestone } from '../../academic/roadmap/milestones';
import { StatusBadge } from '../components/StatusBadge';
import { useCurriculum, useCurriculumCourses } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useAcademicRulesQuery } from '../../academic/hooks/queries/useAcademicRulesQuery';
import { useRoadmapCourseDetails } from '../../academic/hooks/queries/useRoadmapCourseDetails';
import { useCurriculumMutations } from '../../academic/hooks/mutations/useCurriculumMutations';
import { useCourse } from '../../academic/hooks/queries/useCoursesQuery';
import { useCourseMutations } from '../../academic/hooks/mutations/useCourseMutations';
import type { CurriculumInput } from '../../academic/types/curriculum';
import type { RoadmapCourse } from '../../academic/types/roadmap';
import type { MockImportPreview } from '../mocks/curriculumMockApi';

export default function CurriculumDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const curriculum = useCurriculum(id);
  const courses = useCurriculumCourses(id);
  const {
    update,
    addCourses,
    isAddingCourses,
    updateCourse,
    removeCourse,
    updateStatus,
    isUpdatingStatus,
    previewImport,
    isPreviewingImport,
    confirmImport,
    isConfirmingImport,
  } = useCurriculumMutations('curriculum');
  const [picker, setPicker] = useState<{ semester: number } | null>(null);
<<<<<<< HEAD
=======
  const [importing, setImporting] = useState(false);
  // The preview of a spreadsheet that has invalid rows; the valid rows can still be imported.
  const [importPreview, setImportPreview] = useState<Awaited<ReturnType<typeof curriculumService.previewImport>> | null>(null);
>>>>>>> 20218a3992c0e9fe98bc6793f47fb6b63e00a23c
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<MockImportPreview | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  // The rules carry the milestone thresholds (how many credits an internship needs).
  const rules = useAcademicRulesQuery({ curriculumVersionId: id, size: 100 });

  const list = courses.data ?? [];
  const placed = useMemo(() => new Map(list.map((c) => [c.courseId, c.semesterNumber])), [list]);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewingQuery = useCourse(viewingId);
  const {
    addRelation,
    updateRelation,
    removeRelation,
    isAddingRelation,
    isUpdatingRelation,
    isRemovingRelation,
  } = useCourseMutations();

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
          courseId: relation.otherCourseId,
        }));

      const categoryLabel = detail
        ? `${detail.categoryCode} | ${detail.categoryName}`
        : course.groupName;

      return {
        ...course,
        categoryLabel,
        specialization: detail?.specialization ?? null,
        prerequisites,
        milestone: resolveMilestone(course, rules.data?.items ?? []),
      };
    });
    return buildRoadmap(withDetails);
  }, [list, details, rules.data?.items]);

  const totalCredits = list.reduce((sum, c) => sum + c.credits, 0);
  const usedSemesters = new Set(list.map((c) => c.semesterNumber)).size;

  if (curriculum.isLoading) return <DetailSkeleton />;
  if (curriculum.isError || !curriculum.data) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <CircleAlert className="size-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900">Could not load this curriculum</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
            The link may be invalid or the record was deleted. Go back to the list and pick another curriculum.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/curriculum')}
          className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
        >
          Back to curriculum list
        </button>
      </div>
    );
  }
  const data = curriculum.data;
  const isPublished = data.status === 'ACTIVE';

  const handleMove = (course: RoadmapCourse, semesterNumber: number) => {
    if (course.semesterNumber === semesterNumber) return;
    void updateCourse({
      id,
      courseId: course.courseId,
      semesterNumber,
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
    });
  };

  const handleEdit = async (body: CurriculumInput) => {
    await update({ id, body });
    setEditing(false);
  };

  const handlePickFile = async (file: File | undefined) => {
    if (!file) return;
    setImportFile(file);
    setImportPreview(null);
    setImportOpen(true);
    try {
      const preview = (await previewImport({ id, file })) as unknown as MockImportPreview;
      setImportPreview(preview);
      if (preview.errorRows > 0) {
        toast.warning(`${preview.errorRows} invalid row(s) found`, {
          description: 'Review them in the preview — valid rows can still be imported.',
        });
      }
    } catch {
      // Error toast comes from the mutation handler; keep the modal open with empty state.
      setImportOpen(false);
      setImportFile(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    try {
      await confirmImport({ id, preview: importPreview });
      setImportOpen(false);
      setImportPreview(null);
      setImportFile(null);
      await courses.refetch();
    } catch {
      // Error toast comes from the mutation handler; keep the modal open.
    }
  };

  return (
    <div className="w-full space-y-5">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
          <li>
            <button
              type="button"
              onClick={() => navigate('/admin/curriculum')}
              className="rounded transition-colors hover:text-[#C2410C]"
            >
              Curriculum List
            </button>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3 text-gray-300" />
          </li>
          <li className="font-bold text-gray-900" aria-current="page">
            {data.majorCode} {data.version}
          </li>
        </ol>
      </nav>

      {/* Header card */}
      <header className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="h-1.5 bg-gradient-to-r from-[#F26F21] via-[#f97316] to-[#C2410C]" />
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
              <GraduationCap className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-extrabold tracking-tight text-gray-900">{data.name}</h1>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label={`Edit ${data.name}`}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-orange-50 hover:text-[#C2410C]"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-medium text-gray-500">
                <StatusBadge status={data.status} />
                <span className="rounded-md bg-gray-900 px-2 py-0.5 font-mono font-bold text-white">
                  {data.majorCode}_{data.version}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3 text-gray-400" />
                  Start {data.effectiveFromSemesterCode}
                </span>
                {data.isCurrent && (
                  <span className="rounded-full bg-orange-100 px-2 py-px font-bold text-[#9a3412]">Current version</span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Stat icon={<Layers className="size-3.5" />} label={`${list.length} courses`} />
                <Stat icon={<BookOpenCheck className="size-3.5" />} label={`${totalCredits} credits`} accent />
                <Stat icon={<CalendarDays className="size-3.5" />} label={`${usedSemesters} semesters used`} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#9a3412]"
            >
              <Pencil className="size-3.5" /> Edit Draft
            </button>
            <button
              type="button"
              onClick={() => setArchiving(true)}
              disabled={!isPublished}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Archive className="size-3.5" /> Archive
            </button>
            <label
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#9a3412]',
                isPreviewingImport && 'pointer-events-none opacity-60',
              )}
            >
              {isPreviewingImport ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              {isPreviewingImport ? 'Reading…' : 'Import XLSX'}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                disabled={isPreviewingImport}
                onChange={(event) => {
                  void handlePickFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
            <button
              type="button"
              disabled={isPublished || isUpdatingStatus}
              onClick={() => {
                updateStatus({ id, status: 'ACTIVE' }).catch(() => undefined);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isUpdatingStatus ? <Loader2 className="size-3.5 animate-spin" /> : <>Publish Version <ArrowUpRight className="size-3.5" /></>}
            </button>
          </div>
<<<<<<< HEAD
=======
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
>>>>>>> 20218a3992c0e9fe98bc6793f47fb6b63e00a23c
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
        <DetailBoardSkeleton />
      ) : courses.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <CircleAlert className="size-6" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900">Could not load the courses of this curriculum</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
              The roadmap failed to load. Your curriculum header above is intact — retry to reload the course columns.
            </p>
          </div>
          <button
            type="button"
            onClick={() => courses.refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
          >
            <RotateCcw className="size-3.5" /> Retry loading courses
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
            <Layers className="size-6" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900">This roadmap is empty</p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500">
              Add courses to semesters to build the study plan, or import a spreadsheet to fill several semesters at once.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPicker({ semester: 1 })}
              className="rounded-xl bg-[#F26F21] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e05f14]"
            >
              Add the first course
            </button>
            <label className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50">
              Import XLSX instead
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(event) => {
                  void handlePickFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
          </div>
        </div>
      ) : (
        <RoadmapBoard
          semesters={semesters}
          onAdd={(semester) => setPicker({ semester })}
          onMove={handleMove}
          onRemove={(course) => removeCourse({ id, courseId: course.courseId })}
          onDropCourse={handleDropCourse}
          onViewCourse={(courseId) => setViewingId(courseId)}
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

      <ImportPreviewModal
        open={importOpen}
        fileName={importFile?.name ?? 'spreadsheet.xlsx'}
        preview={importPreview}
        isConfirming={isConfirmingImport}
        onClose={() => {
          setImportOpen(false);
          setImportPreview(null);
          setImportFile(null);
        }}
        onConfirm={handleConfirmImport}
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
          } catch {
            // The error toast is shown by the mutation / global handler.
          }
          setArchiving(false);
        }}
      />

      {/* Cross-navigation: course detail from the roadmap (name click or Requires [code]). */}
      <CourseDetailModal
        open={!!viewingId}
        course={viewingQuery.data ?? null}
        isSubmitting={isAddingRelation || isRemovingRelation || isUpdatingRelation}
        onClose={() => setViewingId(null)}
        onAddRelation={(rel) => addRelation({ courseId: viewingId as string, body: rel })}
        onUpdateRelation={(relationId, body) => updateRelation({ courseId: viewingId as string, relationId, body })}
        onRemoveRelation={(relationId) => removeRelation({ courseId: viewingId as string, relationId })}
      />
    </div>
  );
}

function Stat({ icon, label, accent }: { icon: ReactNode; label: string; accent?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tabular-nums ring-1',
        accent ? 'bg-orange-50 text-[#9a3412] ring-orange-200' : 'bg-gray-100 text-gray-600 ring-gray-200',
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function DetailBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden" aria-label="Loading courses">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="w-[280px] shrink-0 space-y-2.5 rounded-2xl border border-gray-200/80 bg-white p-3">
          <div className="h-8 animate-pulse rounded-xl bg-orange-50" style={{ animationDelay: `${i * 70}ms` }} />
          {[0, 1, 2].map((j) => (
            <div key={j} className="h-20 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${(i * 3 + j) * 60}ms` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="w-full space-y-5" aria-label="Loading curriculum">
      <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5">
        <div className="flex items-start gap-3.5">
          <div className="size-12 animate-pulse rounded-2xl bg-orange-100" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-[280px] shrink-0 space-y-2.5 rounded-2xl border border-gray-200/80 bg-white p-3">
            <div className="h-8 animate-pulse rounded-xl bg-orange-50" style={{ animationDelay: `${i * 70}ms` }} />
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-20 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${(i * 3 + j) * 60}ms` }} />
            ))}
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] font-medium text-gray-400">Loading roadmap… (mock delay 500ms)</p>
    </div>
  );
}
