import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CURRICULUM_QUERY_KEYS } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { semesterService } from '../../../academic/services/semesterService';
import { courseService } from '../../services/course.service';
import { majorService } from '../../services/major.service';
import { downloadBlob } from '../../../learning/utils/studyPlanXlsx';
import type { ExampleSheet } from '../ImportCheckDialog';
import type { ImportProblem } from '../../utils/importChecks';
import {
  cohortCurriculumExample,
  cohortExample,
  majorCohortExample,
  majorExample,
  parseStructureImport,
} from '../../utils/structureImport';
import { executeStructureImport } from '../../utils/structureImportExecutor';

export function useMajorImport(onImported: () => Promise<void>) {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [importProblems, setImportProblems] = useState<{ fileName: string; problems: ImportProblem[] } | null>(null);

  const examples: ExampleSheet[] = [
    { label: 'Majors only (.xlsx)', download: () => downloadBlob(majorExample(), 'majors-import-example.xlsx') },
    { label: 'Cohorts only (.xlsx)', download: () => downloadBlob(cohortExample(), 'cohorts-import-example.xlsx') },
    { label: 'Majors + Cohorts (.xlsx)', download: () => downloadBlob(majorCohortExample(), 'majors-cohorts-import-example.xlsx') },
    {
      label: 'Majors + Cohorts + Curriculum (.xlsx)',
      download: () => downloadBlob(cohortCurriculumExample(), 'cohorts-curriculum-import-example.xlsx'),
    },
  ];

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    setIsImporting(true);
    try {
      const [majorsFirst, semesters, coursesFirst] = await Promise.all([
        majorService.getMajors({ page: 0, size: 100 }),
        semesterService.list(),
        courseService.list({ status: 'ACTIVE', page: 0, size: 100 }),
      ]);
      const extraMajors = majorsFirst.totalPages > 1
        ? await Promise.all(
            Array.from({ length: majorsFirst.totalPages - 1 }, (_, i) =>
              majorService.getMajors({ page: i + 1, size: 100 }),
            ),
          )
        : [];
      const extraCourses = coursesFirst.totalPages > 1
        ? await Promise.all(
            Array.from({ length: coursesFirst.totalPages - 1 }, (_, i) =>
              courseService.list({ status: 'ACTIVE', page: i + 1, size: 100 }),
            ),
          )
        : [];
      const allMajors = [...majorsFirst.items, ...extraMajors.flatMap((p) => p.items)];
      const activeCourses = [...coursesFirst.items, ...extraCourses.flatMap((p) => p.items)];

      const parsed = await parseStructureImport(file, 'majors', allMajors, semesters, activeCourses);
      if (parsed.problems.length > 0) {
        setImportProblems({ fileName: file.name, problems: parsed.problems });
        return;
      }
      const summary = await executeStructureImport(parsed, allMajors);
      const parts = [
        summary.majorsCreated > 0 ? `${summary.majorsCreated} major(s)` : '',
        summary.cohortsCreated > 0 ? `${summary.cohortsCreated} cohort(s)` : '',
        summary.coursesLinked > 0 ? `${summary.coursesLinked} curriculum course(s)` : '',
        summary.groupsSaved > 0 ? `${summary.groupsSaved} combo/elective group(s) (${summary.groupCoursesLinked} courses)` : '',
      ].filter(Boolean);
      if (parts.length > 0) {
        toast.success(`Imported ${parts.join(', ')}.`);
        await onImported();
        await queryClient.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
      } else if (summary.skipped === 0) {
        toast.info('All items in this file already exist.');
      }
      if (summary.skipped > 0) {
        toast.warning(`${summary.skipped} record(s) could not be imported.`);
      }
    } catch {
      toast.error('Could not import Excel file. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importProblems,
    examples,
    clearImportProblems: () => setImportProblems(null),
    handleImportFile,
  };
}
