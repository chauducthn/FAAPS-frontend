import { useMemo } from 'react';
import { CheckCircle2, CircleOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../../shared/components/common/DataTable';
import type { CourseDetail } from '../../academic/types/course';
import type { CreateCourseFormValues } from '../../academic/validations/course.schema';
import { toCourseBody } from './courses/courseHelpers';
import { createCourseColumns } from './courses/courseColumns';
import { CoursesTopBar } from './courses/CoursesHeaderAndFilters';
import { CoursesFilterBar } from './courses/CoursesFilterBar';
import { CoursesEmptyState, CoursesErrorState, CoursesListSkeleton } from './courses/CoursesStates';
import { CoursesModals } from './courses/CoursesModals';
import { useCoursesState } from './courses/useCoursesState';

export default function CoursesPage() {
  const s = useCoursesState();
  const { query, mutations, visibleItems, totalItems } = s;

  const columns = useMemo(
    () =>
      createCourseColumns({
        onView: s.setViewingId,
        onEdit: (course) => {
          s.setEditing(course);
          s.setFormOpen(true);
        },
        onDelete: s.setDeleting,
      }),
    [],
  );

  const handleSubmitForm = async (values: CreateCourseFormValues) => {
    try {
      if (s.editing) {
        await mutations.update({ id: s.editing.id, body: toCourseBody(values, false) });
        const existingPrereqs = (s.editingQuery.data?.relations ?? []).filter((r) => r.kind === 'PREREQUISITE');
        const nextIds = values.prerequisiteIds ?? [];
        const existingIdSet = new Set(existingPrereqs.map((r) => r.otherCourseId));
        const nextIdSet = new Set(nextIds);
        for (const otherCourseId of nextIds) {
          if (!existingIdSet.has(otherCourseId)) {
            await mutations.addRelation({
              courseId: s.editing.id,
              body: { kind: 'PREREQUISITE', groupNo: 1, otherCourseId, minimumScore: null },
            });
          }
        }
        for (const rel of existingPrereqs) {
          if (!nextIdSet.has(rel.otherCourseId)) {
            await mutations.removeRelation({ courseId: s.editing.id, relationId: rel.relationId });
          }
        }
      } else {
        await mutations.create(toCourseBody(values, true));
      }
      s.setFormOpen(false);
    } catch {
      return;
    }
  };

  const handleConfirmDelete = async () => {
    if (!s.deleting) return;
    try {
      await mutations.remove(s.deleting.id);
    } catch {
      s.setDeleting(null);
      return;
    }
    s.setDeleting(null);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await mutations.bulkRemove(s.bulkTargets.map((c) => c.id));
    } catch {
      s.setBulkTargets([]);
      s.setBulkDeleting(false);
      return;
    }
    s.setBulkTargets([]);
    s.setBulkDeleting(false);
  };

  return (
    <div className="w-full space-y-4">
      <CoursesTopBar
        totalItems={query.data?.totalItems}
        isFetching={query.isFetching}
        pageIndex={s.pagination.pageIndex}
        totalPages={query.data?.totalPages ?? 1}
        activeOnPage={visibleItems.filter((c) => c.status === 'ACTIVE').length}
        shownCount={visibleItems.length}
        creditsOnPage={visibleItems.reduce((sum, c) => sum + c.credits, 0)}
        activeStatus={s.status}
        examples={s.examples}
        importing={s.importing}
        importOpen={s.importOpen}
        onToggleActive={() => s.resetPage(s.setStatus)(s.status === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
        onClearStatus={() => s.resetPage(s.setStatus)('ALL')}
        onPickFile={(f) => void s.handlePickFile(f)}
        onCreate={() => {
          s.setEditing(null);
          s.setFormOpen(true);
        }}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
        <CoursesFilterBar
          search={s.search}
          status={s.status}
          categoryId={s.categoryId}
          credits={s.credits}
          categories={s.categories}
          hasFilters={s.hasFilters}
          onSearchChange={s.resetPage(s.setSearch)}
          onStatusChange={s.resetPage(s.setStatus)}
          onCategoryChange={s.resetPage(s.setCategoryId)}
          onCreditsChange={s.resetPage(s.setCredits)}
          onClear={s.clearFilters}
        />

        <div className="h-[520px]">
          {query.isLoading ? (
            <CoursesListSkeleton />
          ) : query.isError ? (
            <CoursesErrorState onRetry={() => query.refetch()} />
          ) : visibleItems.length === 0 ? (
            <CoursesEmptyState
              hasFilters={s.hasFilters}
              onClear={s.clearFilters}
            />
          ) : (
            <div className="relative h-full">
              {query.isFetching && (
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                  <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
                </div>
              )}
              <DataTable
                className="h-full"
                manual columns={columns} data={visibleItems} searchKey="name" searchValue={s.search}
                searchPlaceholder="Search by code or name..." emptyText={s.hasFilters ? 'No courses match your filters.' : 'No courses yet.'}
                getRowId={(row) => row.id} isLoading={false} totalRowCount={totalItems}
                pagination={s.pagination} onPaginationChange={s.setPagination} sorting={s.sorting} onSortingChange={s.setSorting}
                onSearchChange={s.resetPage(s.setSearch)} showSearch={false}
                bulkActions={(selectedRows) => (
                  <>
                    <button type="button" onClick={() => s.setBulkStatus({ rows: selectedRows, status: 'ACTIVE' })} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"><CheckCircle2 className="size-3.5" /> Set active</button>
                    <button type="button" onClick={() => s.setBulkStatus({ rows: selectedRows, status: 'INACTIVE' })} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-50"><CircleOff className="size-3.5" /> Set inactive</button>
                    <button type="button" onClick={() => {
                      const blocked = selectedRows.filter((c) => c.usedInCurriculumCount > 0);
                      if (blocked.length > 0) {
                        toast.error(`Cannot delete ${blocked.map((c) => c.code).join(', ')}: still used in a curriculum. Unselect them first.`);
                        return;
                      }
                      s.setBulkTargets(selectedRows);
                      s.setBulkDeleting(true);
                    }} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100"><Trash2 className="size-3.5" /> Delete selected</button>
                  </>
                )}
              />
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>

      <CoursesModals
        formOpen={s.formOpen} editing={s.editing} editingInitial={s.editing ? (s.editingQuery.data ?? null) : null}
        isLoadingInitial={!!s.editing && s.editingQuery.isLoading} categories={s.categories}
        isSavingCourse={mutations.isCreating || mutations.isUpdating} onCloseForm={() => s.setFormOpen(false)} onSubmitForm={handleSubmitForm}
        viewingId={s.viewingId} viewingCourse={(s.viewingQuery.data as CourseDetail | undefined) ?? null}
        isLoadingViewing={s.viewingQuery.isLoading}
        isSubmittingRelation={mutations.isAddingRelation || mutations.isRemovingRelation || mutations.isUpdatingRelation}
        onCloseViewing={() => s.setViewingId(null)} onNavigateViewing={s.setViewingId}
        onAddRelation={(rel) => mutations.addRelation({ courseId: s.viewingId as string, body: rel })}
        onUpdateRelation={(relationId, body) => mutations.updateRelation({ courseId: s.viewingId as string, relationId, body })}
        onRemoveRelation={(relationId) => mutations.removeRelation({ courseId: s.viewingId as string, relationId })}
        importOpen={s.importOpen} importFileName={s.importFileName} importPreview={s.importPreview} importing={s.importing}
        onCloseImport={() => { s.setImportOpen(false); s.setImportPreview(null); }}
        onConfirmImport={s.handleConfirmImport} onDownloadErrors={s.handleDownloadErrors}
        deleting={s.deleting} isRemoving={mutations.isRemoving} onCancelDelete={() => s.setDeleting(null)} onConfirmDelete={handleConfirmDelete}
        importProblems={s.importProblems} examples={s.examples} onCloseImportProblems={() => s.setImportProblems([])}
        bulkStatus={s.bulkStatus} bulkStatusSaving={s.bulkStatusSaving} onCancelBulkStatus={() => s.setBulkStatus(null)} onConfirmBulkStatus={s.handleBulkStatus}
        bulkDeleting={s.bulkDeleting} bulkTargets={s.bulkTargets} isBulkRemoving={mutations.isBulkRemoving}
        onCancelBulkDelete={() => s.setBulkDeleting(false)} onConfirmBulkDelete={handleConfirmBulkDelete}
      />
    </div>
  );
}
