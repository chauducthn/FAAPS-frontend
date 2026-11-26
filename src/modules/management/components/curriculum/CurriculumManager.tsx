// Unified list + create / edit / activate / import / delete for Curriculum and Cohorts pages.
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Pagination } from '../Pagination';
import CurriculumTable from './CurriculumTable';
import type { CurriculumItem } from '../../../academic/types/curriculum';
import type { CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { CurriculumManagerTopBar } from './CurriculumManagerKpis';
import { CurriculumManagerFilters } from './CurriculumManagerFilters';
import { CurriculumListEmpty, CurriculumListError, CurriculumListSkeleton } from './CurriculumManagerStates';
import { CurriculumManagerModals } from './CurriculumManagerModals';
import { CURRICULUM_PAGE_SIZE, useCurriculumManagerState } from './useCurriculumManagerState';
import { useCohortSheetImport } from './useCohortSheetImport';
import { ImportCheckDialog } from '../ImportCheckDialog';

const COPY = {
  cohort: {
    noun: 'Cohort' as const,
    create: 'Create cohort',
    search: 'Search by cohort (e.g. SE18), major, or semester...',
    plural: 'cohorts',
  },
  curriculum: {
    noun: 'Curriculum' as const,
    create: 'Create curriculum',
    search: 'Search by name, cohort (e.g. SE18), major, or semester...',
    plural: 'curriculums',
  },
};

export default function CurriculumManager({
  kind,
  headerLeft,
  onOpenCohort,
}: {
  kind: CurriculumKind;
  headerLeft?: ReactNode;
  onOpenCohort?: (item: CurriculumItem) => void;
}) {
  const copy = COPY[kind];
  const navigate = useNavigate();
  const s = useCurriculumManagerState(kind);
  const cohortImport = useCohortSheetImport(s.majors, s.semesters);
  const { data, isLoading, isError, refetch, isFetching } = s.query;
  const { create, update, remove, updateStatus, isCreating, isUpdating, isRemoving, isPreviewingImport, isConfirmingImport } = s.mutations;

  const openCreate = () => {
    s.setEditing(null);
    s.setFormOpen(true);
  };

  const activeOnPage = s.items.filter((i) => i.status === 'ACTIVE').length;
  const inactiveOnPage = s.items.length - activeOnPage;

  return (
    <div className="w-full min-w-0 space-y-4">
      <CurriculumManagerTopBar
        kind={kind}
        headerLeft={headerLeft}
        plural={copy.plural}
        createLabel={copy.create}
        totalElements={data?.totalElements}
        shownCount={s.items.length}
        activeOnPage={activeOnPage}
        inactiveOnPage={inactiveOnPage}
        creditsOnPage={s.items.reduce((sum, i) => sum + i.totalCredits, 0)}
        activeStatus={s.status}
        disableImport={s.items.length === 0}
        isImportingCohort={cohortImport.isImporting}
        onSelectStatus={s.setStatus}
        onClearAll={s.clearFilters}
        onOpenImport={() => {
          s.setImportTargetId(s.selectedItems.length === 1 ? s.selectedItems[0].id : s.items[0]?.id ?? '');
          s.setImportChooserOpen(true);
        }}
        cohortExamples={cohortImport.examples}
        onImportCohortFile={(file) => void cohortImport.handleImportFile(file)}
        onOpenCreate={openCreate}
      />

      <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
        <CurriculumManagerFilters
          kind={kind} searchPlaceholder={copy.search} search={s.search} majorId={s.majorId} version={s.version}
          startSemesterId={s.startSemesterId} status={s.status} current={s.current} majors={s.majors}
          versions={s.versionOptions} semesters={s.semesters} hasFilters={s.hasFilters}
          selectedCount={s.selectedItems.length} totalCount={data?.totalElements ?? 0} selectingAll={s.selectingAll}
          onSelectAll={() => void s.selectAllMatching()} onSearchChange={s.setSearch} onMajorChange={s.setMajorId}
          onVersionChange={s.setVersion} onStartSemesterChange={s.setStartSemesterId} onStatusChange={s.setStatus}
          onCurrentChange={s.setCurrent} onClearFilters={s.clearFilters} onBulkAction={s.setBulkAction}
          onClearSelection={s.clearSelection}
        />

        {isLoading ? (
          <CurriculumListSkeleton />
        ) : isError ? (
          <CurriculumListError plural={copy.plural} onRetry={() => refetch()} />
        ) : s.items.length === 0 ? (
          <CurriculumListEmpty plural={copy.plural} noun={copy.noun} hasFilters={s.hasFilters} onClearFilters={s.clearFilters} />
        ) : (
          <div className="relative flex h-[calc(100vh-295px)] min-h-[460px] flex-col">
            {isFetching && (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
              </div>
            )}
            <CurriculumTable
              kind={kind}
              data={s.items}
              onOpen={(item) => (onOpenCohort ? onOpenCohort(item) : navigate(`/admin/curriculum/${item.id}`))}
              onEdit={(item) => {
                s.setEditing(item);
                s.setFormOpen(true);
              }}
              onImportFor={kind === 'curriculum' ? (item) => {
                s.setImportTargetId(item.id);
                s.setImportChooserOpen(true);
              } : undefined}
              onToggleStatus={(item) => updateStatus({ id: item.id, status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }).catch(() => undefined)}
              onDelete={s.setDeleting}
              selectedIds={s.selectedIds}
              onSelect={s.selectOne}
              onSelectPage={s.selectPage}
            />
            <Pagination page={s.page} pageSize={CURRICULUM_PAGE_SIZE} total={data?.totalElements ?? 0} noun={copy.plural} onChange={s.changePage} />
          </div>
        )}
      </section>

      <CurriculumManagerModals
        noun={copy.noun}
        items={s.items}
        formOpen={s.formOpen}
        editing={s.editing}
        deleting={s.deleting}
        bulkAction={s.bulkAction}
        selectedCount={s.selectedItems.length}
        isSubmittingForm={isCreating || isUpdating}
        isRemoving={isRemoving}
        bulkSaving={s.bulkSaving}
        importChooserOpen={s.importChooserOpen}
        importTargetId={s.importTargetId}
        importFile={s.importFile}
        importPreview={s.importPreview}
        importProblems={s.importProblems}
        isPreviewingImport={isPreviewingImport}
        isConfirmingImport={isConfirmingImport}
        onCloseForm={() => s.setFormOpen(false)}
        onSubmitForm={async (body) => {
          if (s.editing) await update({ id: s.editing.id, body });
          else await create(body);
          s.setFormOpen(false);
        }}
        onCancelDelete={() => s.setDeleting(null)}
        onConfirmDelete={async () => {
          if (!s.deleting) return;
          try {
            await remove(s.deleting.id);
          } catch {
            s.setDeleting(null);
            return;
          }
          s.setDeleting(null);
        }}
        onCancelBulk={() => s.setBulkAction(null)}
        onConfirmBulk={() => void s.handleBulkAction()}
        onCloseImportChooser={() => s.setImportChooserOpen(false)}
        onChangeImportTarget={s.setImportTargetId}
        onDownloadExample={s.downloadExample}
        onPickImportFile={(file) => void s.handleImportFile(file)}
        onCloseImportPreview={() => {
          s.setImportFile(null);
          s.setImportPreview(null);
        }}
        onConfirmImport={() => void s.handleConfirmImport()}
        onCloseImportProblems={() => s.setImportProblems(null)}
      />

      <ImportCheckDialog
        open={!!cohortImport.problems}
        fileName={cohortImport.problems?.fileName ?? ''}
        problems={cohortImport.problems?.problems ?? []}
        examples={cohortImport.examples}
        onClose={cohortImport.clearProblems}
      />

      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>
    </div>
  );
}
