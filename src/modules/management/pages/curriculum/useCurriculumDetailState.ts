import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { apiMessage } from '../../../../shared/lib/apiMessage';
import { checkCurriculumImport, curriculumExample, type ImportProblem } from '../../utils/importChecks';
import { downloadBlob } from '../../../learning/utils/studyPlanXlsx';
import { buildRoadmap } from '../../../academic/roadmap/buildRoadmap';
import { resolveMilestone } from '../../../academic/roadmap/milestones';
import { useCurriculum, useCurriculumCourses } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { useAcademicRulesQuery } from '../../../academic/hooks/queries/useAcademicRulesQuery';
import { useRoadmapCourseDetails } from '../../../academic/hooks/queries/useRoadmapCourseDetails';
import { useCurriculumMutations } from '../../../academic/hooks/mutations/useCurriculumMutations';
import { useCourse } from '../../../academic/hooks/queries/useCoursesQuery';
import { useCourseMutations } from '../../../academic/hooks/mutations/useCourseMutations';
import type { CurriculumImportPreview, CurriculumInput } from '../../../academic/types/curriculum';
import type { RoadmapCourse } from '../../../academic/types/roadmap';

export function useCurriculumDetailState(id: string) {
  const curriculum = useCurriculum(id);
  const courses = useCurriculumCourses(id);
  const mutations = useCurriculumMutations('curriculum');
  const [picker, setPicker] = useState<{ semester: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<CurriculumImportPreview | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importProblems, setImportProblems] = useState<{ fileName: string; problems: ImportProblem[] } | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const downloadExample = () => downloadBlob(curriculumExample(), 'curriculum-import-example.xlsx');
  // Rules carry the milestone thresholds (how many credits an internship needs).
  const rules = useAcademicRulesQuery({ size: 100 });
  const list = courses.data ?? [];
  const placed = useMemo(() => new Map(list.map((c) => [c.courseId, c.semesterNumber])), [list]);
  const viewingQuery = useCourse(viewingId);
  const courseMutations = useCourseMutations();
  // Course details add the category line and prerequisite codes to each card.
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
      const categoryLabel = detail ? `${detail.categoryCode} | ${detail.categoryName}` : course.groupName;
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

  const handleMove = (course: RoadmapCourse, semesterNumber: number) => {
    if (course.semesterNumber === semesterNumber) return;
    void mutations.updateCourse({ id, courseId: course.courseId, semesterNumber }).catch((error) => {
      toast.error(apiMessage(error), { description: 'The course was not moved.' });
    });
  };

  const handleDropCourse = (courseId: string, semesterNumber: number) => {
    const course = list.find((c) => c.id === courseId);
    if (!course || course.semesterNumber === semesterNumber) return;
    void mutations.updateCourse({ id, courseId: course.courseId, semesterNumber }).catch((error) => {
      toast.error(apiMessage(error), { description: 'The course was not moved.' });
    });
  };

  const handleEdit = async (body: CurriculumInput) => {
    await mutations.update({ id, body });
    setEditing(false);
  };

  const handlePickFile = async (file: File | undefined) => {
    if (!file) return;
    const check = await checkCurriculumImport(file);
    if (check.problems.length > 0) {
      setImportProblems({ fileName: file.name, problems: check.problems });
      return;
    }
    setImportFile(file);
    setImportPreview(null);
    setImportOpen(true);
    try {
      const preview = (await mutations.previewImport({ id, file })) as unknown as CurriculumImportPreview;
      setImportPreview(preview);
      if (preview.errorRows > 0) {
        toast.warning(`${preview.errorRows} invalid row(s) found`, {
          description: 'Review them in the preview — valid rows can still be imported.',
        });
      }
    } catch {
      setImportOpen(false);
      setImportFile(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    try {
      await mutations.confirmImport({ id, preview: importPreview });
      setImportOpen(false);
      setImportPreview(null);
      setImportFile(null);
      await courses.refetch();
    } catch {
      // Error toast comes from the mutation handler; keep the modal open.
      return;
    }
  };

  return {
    curriculum,
    courses,
    list,
    placed,
    semesters,
    totalCredits: list.reduce((sum, c) => sum + c.credits, 0),
    usedSemesters: new Set(list.map((c) => c.semesterNumber)).size,
    mutations,
    courseMutations,
    viewingId,
    setViewingId,
    viewingQuery,
    picker,
    setPicker,
    editing,
    setEditing,
    archiving,
    setArchiving,
    importFile,
    setImportFile,
    importPreview,
    setImportPreview,
    importOpen,
    setImportOpen,
    importProblems,
    setImportProblems,
    downloadExample,
    handleMove,
    handleDropCourse,
    handleEdit,
    handlePickFile,
    handleConfirmImport,
  };
}
