import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CURRICULUM_QUERY_KEYS } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { semesterService } from '../../../academic/services/semesterService';
import { majorService } from '../../services/major.service';
import { downloadBlob } from '../../../learning/utils/studyPlanXlsx';
import type { ExampleSheet } from '../ImportCheckDialog';
import type { ImportProblem } from '../../utils/importChecks';
import { majorCohortExample, majorExample, parseStructureImport } from '../../utils/structureImport';
import { executeStructureImport } from '../../utils/structureImportExecutor';

export function useMajorImport(onImported: () => Promise<void>) {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [importProblems, setImportProblems] = useState<{ fileName: string; problems: ImportProblem[] } | null>(null);

  const examples: ExampleSheet[] = [
    { label: 'Majors only (.xlsx)', download: () => downloadBlob(majorExample(), 'majors-import-example.xlsx') },
    { label: 'Majors + Cohorts (.xlsx)', download: () => downloadBlob(majorCohortExample(), 'majors-cohorts-import-example.xlsx') },
  ];

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    setIsImporting(true);
    try {
      const [majorsPage, semesters] = await Promise.all([
        majorService.getMajors({ page: 0, size: 200 }),
        semesterService.list(),
      ]);
      const parsed = await parseStructureImport(file, 'majors', majorsPage.items, semesters);
      if (parsed.problems.length > 0) {
        setImportProblems({ fileName: file.name, problems: parsed.problems });
        return;
      }
      const summary = await executeStructureImport(parsed, majorsPage.items);
      const parts = [
        summary.majorsCreated > 0 ? `${summary.majorsCreated} major(s)` : '',
        summary.cohortsCreated > 0 ? `${summary.cohortsCreated} cohort(s)` : '',
      ].filter(Boolean);
      if (parts.length > 0) {
        toast.success(`Imported ${parts.join(', ')}.`);
        await onImported();
        await queryClient.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
      } else if (summary.skipped === 0) {
        toast.info('All majors and cohorts in this file already exist.');
      }
      if (summary.skipped > 0) {
        toast.warning(`${summary.skipped} record(s) could not be imported.`);
      }
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
