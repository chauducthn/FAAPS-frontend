import { describe, expect, it, vi } from 'vitest';
import { runCurriculumBulkAction } from './curriculumBulk';
import type { CurriculumItem } from '../../academic/types/curriculum';

const item = (id: string, status: CurriculumItem['status'] = 'INACTIVE') => ({ id, status }) as CurriculumItem;

describe('curriculum bulk actions', () => {
  it('keeps failed rows available for retry after partial success', async () => {
    const updateStatus = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Conflict'));
    const result = await runCurriculumBulkAction([item('a'), item('b')], 'ACTIVE', {
      updateStatus, remove: vi.fn(),
    });
    expect(result.succeeded.map((row) => row.id)).toEqual(['a']);
    expect(result.failed.map((row) => row.id)).toEqual(['b']);
    expect(updateStatus).toHaveBeenCalledTimes(2);
  });

  it('skips an unchanged status but still counts that row as completed', async () => {
    const updateStatus = vi.fn();
    const result = await runCurriculumBulkAction([item('a', 'ACTIVE')], 'ACTIVE', {
      updateStatus, remove: vi.fn(),
    });
    expect(result.failed).toEqual([]);
    expect(result.succeeded).toHaveLength(1);
    expect(updateStatus).not.toHaveBeenCalled();
  });
});
