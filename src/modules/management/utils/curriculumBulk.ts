import type { CurriculumItem, CurriculumStatus } from '../../academic/types/curriculum';

export type CurriculumBulkAction = CurriculumStatus | 'DELETE';

/** Run in order so a failure cannot hide which curriculum was changed. */
export async function runCurriculumBulkAction(
  items: CurriculumItem[],
  action: CurriculumBulkAction,
  operations: { updateStatus: (id: string, status: CurriculumStatus) => Promise<unknown>; remove: (id: string) => Promise<unknown> },
) {
  const succeeded: CurriculumItem[] = [];
  const failed: CurriculumItem[] = [];
  for (const item of items) {
    try {
      if (action === 'DELETE') await operations.remove(item.id);
      else if (item.status !== action) await operations.updateStatus(item.id, action);
      succeeded.push(item);
    } catch {
      failed.push(item);
    }
  }
  return { succeeded, failed };
}
