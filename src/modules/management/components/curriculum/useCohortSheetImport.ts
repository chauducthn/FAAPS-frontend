import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CURRICULUM_QUERY_KEYS } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { MAJOR_QUERY_KEYS } from '../../../academic/hooks/queries/useMajorsQuery';
import { courseService } from '../../services/course.service';
import { downloadBlob } from '../../../learning/utils/studyPlanXlsx';
import type { ExampleSheet } from '../ImportCheckDialog';
import type { ImportProblem } from '../../utils/importChecks';
import {
  cohortCurriculumExample,
  cohortExample,
  majorCohortExample,
  parseStructureImport,
} from '../../utils/structureImport';
import { executeStructureImport } from '../../utils/structureImportExecutor';

export function useCohortSheetImport(
  majors: { id: string; code: string; name: string }[],
  semesters: { id: string; code: string }[],
) {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [problems, setProblems] = useState<{ fileName: string; problems: ImportProblem[] } | null>(null);

  const examples: ExampleSheet[] = [
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
      const firstPage = await courseService.list({ status: 'ACTIVE', page: 0, size: 100 });
      const extraPages = firstPage.totalPages > 1
        ? await Promise.all(
            Array.from({ length: firstPage.totalPages - 1 }, (_, i) =>
              courseService.list({ status: 'ACTIVE', page: i + 1, size: 100 }),
            ),
          )
        : [];
      const activeCourses = [...firstPage.items, ...extraPages.flatMap((p) => p.items)];
      const parsed = await parseStructureImport(file, 'cohorts', majors, semesters, activeCourses);
      if (parsed.problems.length > 0) {
        setProblems({ fileName: file.name, problems: parsed.problems });
        return;
      }
      const summary = await executeStructureImport(parsed, majors);
      const parts = [
        summary.majorsCreated > 0 ? `${summary.majorsCreated} major(s)` : '',
        summary.cohortsCreated > 0 ? `${summary.cohortsCreated} cohort(s)` : '',
        summary.coursesLinked > 0 ? `${summary.coursesLinked} curriculum course(s)` : '',
      ].filter(Boolean);
      if (parts.length > 0) {
        toast.success(`Imported ${parts.join(', ')}.`);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: MAJOR_QUERY_KEYS.all }),
          queryClient.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all }),
        ]);
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
    problems,
    examples,
    clearProblems: () => setProblems(null),
    handleImportFile,
  };
}
