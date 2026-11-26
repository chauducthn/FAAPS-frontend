import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../../shared/lib/csrf';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { downloadBlob } from '../../../learning/utils/studyPlanXlsx';
import type { ExampleSheet } from '../../components/ImportCheckDialog';
import type { ImportProblem } from '../../utils/importChecks';
import {
  advisorImportExample,
  parseAdvisorImport,
  parseStudentImport,
  studentImportExample,
} from '../../utils/userImport';

type ImportKind = 'STUDENT' | 'ADVISOR';

interface ImportUsersSummary {
  created: number;
  studentsCreated: number;
  advisorsCreated: number;
  skipped: number;
}

export function useUserImport() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef<ImportKind>('STUDENT');
  const [isImporting, setIsImporting] = useState(false);
  const [issues, setIssues] = useState<{ fileName: string; problems: ImportProblem[] } | null>(null);

  const examples = useMemo<ExampleSheet[]>(
    () => [
      {
        label: 'Students example (.xlsx)',
        download: () => downloadBlob(studentImportExample(), 'students-import-example.xlsx'),
      },
      {
        label: 'Advisors example (.xlsx)',
        download: () => downloadBlob(advisorImportExample(), 'advisors-import-example.xlsx'),
      },
    ],
    [],
  );

  const openPicker = (kind: ImportKind) => {
    kindRef.current = kind;
    inputRef.current?.click();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setIsImporting(true);
    const kind = kindRef.current;
    try {
      const parsed = kind === 'STUDENT' ? await parseStudentImport(file) : await parseAdvisorImport(file);
      if (parsed.problems.length > 0) {
        setIssues({ fileName: file.name, problems: parsed.problems });
        return;
      }
      const headers = await getCsrfHeaders();
      const { data } = await apiClient.post<ImportUsersSummary>(
        '/admin/users/import',
        { items: parsed.items },
        { headers },
      );
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      const noun = kind === 'STUDENT' ? 'student' : 'advisor';
      const skipNote = data.skipped > 0 ? ` ${data.skipped} existing ${noun}${data.skipped === 1 ? '' : 's'} skipped.` : '';
      if (data.created === 0) {
        toast.info(`No new ${noun}s imported.${skipNote}`);
      } else {
        toast.success(`Imported ${data.created} ${noun}${data.created === 1 ? '' : 's'}.${skipNote}`);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsImporting(false);
    }
  };

  return {
    inputRef,
    isImporting,
    issues,
    clearIssues: () => setIssues(null),
    examples,
    openStudentPicker: () => openPicker('STUDENT'),
    openAdvisorPicker: () => openPicker('ADVISOR'),
    handleFile,
  };
}
