// List + create / edit / activate / delete, shared by the Cohorts and Curriculum pages.
import { useNavigate } from 'react-router';
import { Pagination } from '../Pagination';
import CurriculumTable from './CurriculumTable';
import type { CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { CurriculumManagerHeader, CurriculumManagerKpis } from './CurriculumManagerKpis';
import { CurriculumManagerFilters } from './CurriculumManagerFilters';
import { CurriculumListEmpty, CurriculumListError, CurriculumListSkeleton } from './CurriculumManagerStates';
import { CurriculumManagerModals } from './CurriculumManagerModals';
import { CURRICULUM_PAGE_SIZE, useCurriculumManagerState } from './useCurriculumManagerState';

const COPY = {
  cohort: {
    title: 'Cohorts',
    subtitle: 'Each cohort is one version of a major (for example SE K19) with its starting semester',
    noun: 'Cohort' as const,
    create: 'Create cohort',
    search: 'Search by cohort, name, or major...',
    plural: 'cohorts',
  },
  curriculum: {
    title: 'Curriculum',
    subtitle: 'Manage curriculum versions, semester courses, and imports in one place',
    noun: 'Curriculum' as const,
    create: 'Create curriculum',
    search: 'Search by curriculum code, name, or major...',
    plural: 'curriculums',
  },
};

export default function CurriculumManager({ kind }: { kind: CurriculumKind }) {
  const copy = COPY[kind];
  const navigate = useNavigate();
  const s = useCurriculumManagerState(kind);
  const { data, isLoading, isError, refetch, isFetching } = s.query;
  const { create, update, remove, updateStatus, isCreating, isUpdating, isRemoving, isPreviewingImport, isConfirmingImport } = s.mutations;

  const openCreate = () => {
    s.setEditing(null);
    s.setFormOpen(true);
  };

  return (
    <div className="w-full space-y-5">
      <CurriculumManagerHeader
        kind={kind}
        title={copy.title}
        subtitle={copy.subtitle}
        createLabel={copy.create}
        disableImport={s.items.length === 0}
        onOpenImport={() => {
          s.setImportTargetId(s.selectedItems.length === 1 ? s.selectedItems[0].id : s.items[0]?.id ?? '');
          s.setImportChooserOpen(true);
        }}
        onOpenCreate={openCreate}
      />

      <CurriculumManagerKpis
        plural={copy.plural}
        totalElements={data?.totalElements}
        totalPages={data?.totalPages}
        page={s.page}
        isFetching={isFetching}
        shownCount={s.items.length}
        activeOnPage={s.items.filter((i) => i.status === 'ACTIVE').length}
        creditsOnPage={s.items.reduce((sum, i) => sum + i.totalCredits, 0)}
      />

      <CurriculumManagerFilters
        kind={kind}
        searchPlaceholder={copy.search}
        search={s.search}
        majorId={s.majorId}
        status={s.status}
        current={s.current}
        majors={s.majors}
        hasFilters={s.hasFilters}
        selectedCount={s.selectedItems.length}
        onSearchChange={s.setSearch}
        onMajorChange={s.setMajorId}
        onStatusChange={s.setStatus}
        onCurrentChange={s.setCurrent}
        onClearFilters={s.clearFilters}
        onBulkAction={s.setBulkAction}
        onClearSelection={() => s.setSelectedIds(new Set())}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-white to-orange-50/40 px-5 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">{kind === 'curriculum' ? 'Curriculum catalog' : 'Cohort catalog'}</h2>
            <p className="mt-0.5 text-xs text-gray-500">{data?.totalElements ?? 0} records{kind === 'curriculum' ? ' · select rows on this page for bulk actions' : ''}</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600">Page {s.page + 1} / {Math.max(1, data?.totalPages ?? 1)}</span>
        </div>
        {isLoading ? (
          <CurriculumListSkeleton />
        ) : isError ? (
          <CurriculumListError plural={copy.plural} onRetry={() => refetch()} />
        ) : s.items.length === 0 ? (
          <CurriculumListEmpty plural={copy.plural} noun={copy.noun} createLabel={copy.create} hasFilters={s.hasFilters} onClearFilters={s.clearFilters} onCreate={openCreate} />
        ) : (
          <>
            <div className="relative">
              {isFetching && (
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                  <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
                </div>
              )}
              <CurriculumTable
                kind={kind}
                data={s.items}
                onOpen={(item) => navigate(`/admin/curriculum/${item.id}`)}
                onEdit={(item) => {
                  s.setEditing(item);
                  s.setFormOpen(true);
                }}
                onToggleStatus={(item) => updateStatus({ id: item.id, status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }).catch(() => undefined)}
                onDelete={s.setDeleting}
                selectedIds={kind === 'curriculum' ? s.selectedIds : undefined}
                onSelect={kind === 'curriculum' ? s.selectOne : undefined}
                onSelectPage={kind === 'curriculum' ? s.selectPage : undefined}
              />
            </div>
            <Pagination page={s.page} pageSize={CURRICULUM_PAGE_SIZE} total={data?.totalElements ?? 0} noun={copy.plural} onChange={s.changePage} />
          </>
        )}
      </div>

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

      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>
    </div>
  );
}
