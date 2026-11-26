import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CURRICULUM_QUERY_KEYS, useCurriculumsQuery, useCurriculumVersionOptions, useSemesterOptions, type CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { useCurriculumMutations } from '../../../academic/hooks/mutations/useCurriculumMutations';
import { useMajorsQuery } from '../../../academic/hooks/queries/useMajorsQuery';
import { createCurriculumApi, curriculumService } from '../../services/curriculum.service';
import { checkCurriculumImport, curriculumExample, type ImportProblem } from '../../utils/importChecks';
import { runCurriculumBulkAction, type CurriculumBulkAction } from '../../utils/curriculumBulk';
import { downloadBlob } from '../../../learning/utils/studyPlanXlsx';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { fetchAllPages } from '@/shared/lib/fetchAllPages';
import { apiErrorMessage } from '@/shared/lib/apiError';
import type { CurriculumFilterParams, CurriculumImportPreview, CurriculumItem, CurriculumStatus } from '../../../academic/types/curriculum';

export const CURRICULUM_PAGE_SIZE = 10;

export function useCurriculumManagerState(kind: CurriculumKind) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [majorId, setMajorId] = useState('');
  const [version, setVersion] = useState('');
  const [startSemesterId, setStartSemesterId] = useState('');
  const [status, setStatus] = useState('');
  const [current, setCurrent] = useState('');
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [allSelectedItems, setAllSelectedItems] = useState<CurriculumItem[] | null>(null);
  const [selectingAll, setSelectingAll] = useState(false);
  const [bulkAction, setBulkAction] = useState<CurriculumBulkAction | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [importTargetId, setImportTargetId] = useState('');
  const [importChooserOpen, setImportChooserOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<CurriculumImportPreview | null>(null);
  const [importProblems, setImportProblems] = useState<{ fileName: string; problems: ImportProblem[] } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CurriculumItem | null>(null);
  const [deleting, setDeleting] = useState<CurriculumItem | null>(null);
  const debounced = useDebounce(search, 300);

  const params: CurriculumFilterParams = useMemo(
    () => ({
      search: debounced || undefined,
      majorId: majorId || undefined,
      version: version || undefined,
      startSemesterId: startSemesterId || undefined,
      status: (status || undefined) as CurriculumStatus | undefined,
      isCurrent: current === '' ? undefined : current === 'true',
      page,
      size: CURRICULUM_PAGE_SIZE,
    }),
    [debounced, majorId, version, startSemesterId, status, current, page],
  );

  const query = useCurriculumsQuery(kind, params);
  const versionOptionsQuery = useCurriculumVersionOptions(kind);
  const majors = useMajorsQuery({ page: 0, size: 100 });
  const semesters = useSemesterOptions(true);
  const mutations = useCurriculumMutations(kind);

  const versionOptions = useMemo(
    () => versionOptionsQuery.data ?? Array.from(new Set((query.data?.items ?? []).map((i) => i.version))).sort(),
    [versionOptionsQuery.data, query.data],
  );

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
    setSelectedIds(new Set());
    setAllSelectedItems(null);
  };

  const hasFilters = search.trim() !== '' || majorId !== '' || version !== '' || startSemesterId !== '' || status !== '' || current !== '';
  const clearFilters = () => {
    setSearch(''); setMajorId('');
    setVersion(''); setStartSemesterId('');
    setStatus(''); setCurrent('');
    setPage(0); setSelectedIds(new Set());
    setAllSelectedItems(null);
  };

  const items = query.data?.items ?? [];
  const selectedItems = allSelectedItems ?? items.filter((item) => selectedIds.has(item.id));
  const clearSelection = () => {
    setSelectedIds(new Set());
    setAllSelectedItems(null);
  };
  const selectOne = (id: string, selected: boolean) => {
    setAllSelectedItems(null);
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const selectPage = (selected: boolean) => {
    setAllSelectedItems(null);
    setSelectedIds(selected ? new Set(items.map((item) => item.id)) : new Set());
  };
  const selectAllMatching = async () => {
    setSelectingAll(true);
    try {
      const api = createCurriculumApi(kind === 'cohort' ? '/admin/cohorts' : '/admin/curriculums');
      const all = await fetchAllPages((p, size) =>
        api.list({
          search: debounced || undefined,
          majorId: majorId || undefined,
          version: version || undefined,
          startSemesterId: startSemesterId || undefined,
          status: (status || undefined) as CurriculumStatus | undefined,
          isCurrent: current === '' ? undefined : current === 'true',
          page: p,
          size,
        }),
      );
      setAllSelectedItems(all);
      setSelectedIds(new Set(all.map((item) => item.id)));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSelectingAll(false);
    }
  };
  const changePage = (next: number) => {
    clearSelection();
    setPage(next);
  };
  const downloadExample = () => downloadBlob(curriculumExample(), 'curriculum-import-example.xlsx');

  const handleImportFile = async (file: File | undefined) => {
    if (!file || !importTargetId) return;
    const check = await checkCurriculumImport(file);
    if (check.problems.length > 0) {
      setImportProblems({ fileName: file.name, problems: check.problems });
      return;
    }
    setImportFile(file);
    setImportPreview(null);
    setImportChooserOpen(false);
    try {
      setImportPreview(await mutations.previewImport({ id: importTargetId, file }));
    } catch {
      setImportFile(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview || !importTargetId) return;
    try {
      await mutations.confirmImport({ id: importTargetId, preview: importPreview });
      setImportPreview(null);
      setImportFile(null);
    } catch {
      return;
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;
    setBulkSaving(true);
    const result = await runCurriculumBulkAction(selectedItems, bulkAction, curriculumService);
    await queryClient.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
    setSelectedIds(new Set(result.failed.map((item) => item.id)));
    setAllSelectedItems(result.failed.length > 0 ? result.failed : null);
    setBulkSaving(false);
    setBulkAction(null);
    const noun = kind === 'cohort' ? 'cohort' : 'curriculum';
    if (result.succeeded.length) toast.success(`${result.succeeded.length} ${noun}${result.succeeded.length === 1 ? '' : 's'} updated`);
    if (result.failed.length) toast.error(`${result.failed.length} ${noun}${result.failed.length === 1 ? '' : 's'} could not be changed. They remain selected for retry.`);
  };

  return {
    query, majors: majors.data?.items ?? [], semesters: semesters.data ?? [], versionOptions, mutations,
    items, selectedItems, search, majorId, version, startSemesterId, status, current, page, selectedIds,
    selectingAll, bulkAction, bulkSaving, importTargetId, importChooserOpen, importFile, importPreview,
    importProblems, formOpen, editing, deleting, hasFilters,
    setSearch: resetPage(setSearch), setMajorId: resetPage(setMajorId), setVersion: resetPage(setVersion),
    setStartSemesterId: resetPage(setStartSemesterId), setStatus: resetPage(setStatus), setCurrent: resetPage(setCurrent),
    setSelectedIds, setBulkAction, setImportTargetId, setImportChooserOpen, setImportFile, setImportPreview,
    setImportProblems, setFormOpen, setEditing, setDeleting, clearFilters, clearSelection, selectOne,
    selectPage, selectAllMatching, changePage, downloadExample, handleImportFile, handleConfirmImport, handleBulkAction,
  };
}
