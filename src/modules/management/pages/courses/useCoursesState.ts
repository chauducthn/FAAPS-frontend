import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { courseService } from '../../services/course.service';
import type { ExampleSheet } from '../../components/ImportCheckDialog';
import {
  checkCourseImport,
  courseTableExample,
  type ImportProblem,
} from '../../utils/importChecks';
import { downloadBlob } from '../../../learning/utils/studyPlanXlsx';
import {
  useCoursesQuery,
  useCourse,
  useCourseCategoriesQuery,
  COURSE_QUERY_KEYS,
} from '../../../academic/hooks/queries/useCoursesQuery';
import { useCourseMutations } from '../../../academic/hooks/mutations/useCourseMutations';
import type {
  CourseFilterParams,
  CourseImportPreview,
  CourseStatus,
  CourseSummary,
} from '../../../academic/types/course';
import {
  COURSE_PAGE_SIZE,
  downloadFile,
  toCourseSort,
  withCreditLimit,
} from './courseHelpers';

export function useCoursesState() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [categoryId, setCategoryId] = useState('ALL');
  const [credits, setCredits] = useState<number | 'ALL'>('ALL');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: COURSE_PAGE_SIZE });
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CourseSummary | null>(null);
  const [deleting, setDeleting] = useState<CourseSummary | null>(null);
  const [bulkTargets, setBulkTargets] = useState<CourseSummary[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importFileName, setImportFileName] = useState('spreadsheet.xlsx');
  const [importPreview, setImportPreview] = useState<CourseImportPreview | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importProblems, setImportProblems] = useState<ImportProblem[]>([]);
  const [bulkStatus, setBulkStatus] = useState<{ rows: CourseSummary[]; status: CourseStatus } | null>(null);
  const [bulkStatusSaving, setBulkStatusSaving] = useState(false);
  const queryClient = useQueryClient();

  const params: CourseFilterParams = useMemo(
    () => ({
      search: search || undefined,
      status: status === 'ALL' ? undefined : status,
      categoryId: categoryId === 'ALL' ? undefined : categoryId,
      credits: credits === 'ALL' ? undefined : credits,
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort: toCourseSort(sorting),
    }),
    [search, status, categoryId, credits, pagination.pageIndex, pagination.pageSize, sorting],
  );

  const query = useCoursesQuery(params);
  const categoriesQuery = useCourseCategoriesQuery();
  const viewingQuery = useCourse(viewingId);
  const editingQuery = useCourse(formOpen && editing ? editing.id : null);
  const mutations = useCourseMutations();

  const visibleItems = useMemo(() => query.data?.items ?? [], [query.data]);
  const totalItems = query.data?.totalItems ?? 0;
  const categories = categoriesQuery.data ?? [];
  const hasFilters = search !== '' || status !== 'ALL' || categoryId !== 'ALL' || credits !== 'ALL';

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setCategoryId('ALL');
    setCredits('ALL');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const examples: ExampleSheet[] = [
    { label: 'Course template (.xlsx)', download: () => downloadBlob(courseTableExample(categories), 'course-import-example.xlsx') },
  ];

  const handlePickFile = async (file: File | undefined) => {
    if (!file) return;
    setImportFileName(file.name);
    setImportPreview(null);
    setImporting(true);
    const check = await checkCourseImport(file, categories);
    if (check.problems.length > 0) {
      setImportProblems(check.problems);
      setImporting(false);
      return;
    }
    setImportOpen(true);
    try {
      const preview = withCreditLimit(await courseService.previewImport(file));
      setImportPreview(preview);
      if (preview.errorRows > 0) {
        toast.warning(`${preview.errorRows} invalid row(s) found`, {
          description: 'Review them in the preview — valid rows can still be imported.',
        });
      }
    } catch {
      setImportOpen(false);
      setImportPreview(null);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setImporting(true);
    try {
      const count = await courseService.confirmImport(importPreview.items);
      toast.success(`Imported ${count} course(s)`);
      setImportOpen(false);
      setImportPreview(null);
      await query.refetch();
    } catch {
      // Error toast shown by the global handler.
    } finally {
      setImporting(false);
    }
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus) return;
    setBulkStatusSaving(true);
    const targets = bulkStatus.rows.filter((c) => c.status !== bulkStatus.status);
    const results = await Promise.allSettled(targets.map((c) => courseService.update(c.id, { status: bulkStatus.status })));
    const failed = targets.filter((_, i) => results[i].status === 'rejected').map((c) => c.code);
    const done = targets.length - failed.length;
    const label = bulkStatus.status === 'ACTIVE' ? 'active' : 'inactive';
    if (failed.length < targets.length || targets.length === 0) toast.success(`${done} course${done === 1 ? '' : 's'} set to ${label}`);
    if (failed.length > 0) toast.error(`Could not update ${failed.join(', ')}`);
    await queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    setBulkStatusSaving(false);
    setBulkStatus(null);
  };

  const handleDownloadErrors = async () => {
    if (!importPreview) return;
    try {
      downloadFile(await courseService.downloadImportErrors(importPreview.items), 'course-import-errors.csv');
    } catch {
      toast.error('Unable to download the course error report.');
    }
  };

  return {
    search, setSearch, status, setStatus, categoryId, setCategoryId, credits, setCredits,
    pagination, setPagination, sorting, setSorting,
    formOpen, setFormOpen, editing, setEditing, deleting, setDeleting,
    bulkTargets, setBulkTargets, bulkDeleting, setBulkDeleting,
    viewingId, setViewingId, importing, importFileName, importPreview, setImportPreview,
    importOpen, setImportOpen, importProblems, setImportProblems,
    bulkStatus, setBulkStatus, bulkStatusSaving,
    query, viewingQuery, editingQuery, mutations,
    visibleItems, totalItems, categories, hasFilters, examples,
    resetPage, clearFilters, handlePickFile, handleConfirmImport, handleBulkStatus, handleDownloadErrors,
  };
}
