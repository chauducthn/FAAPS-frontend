import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { curriculumService } from './curriculum.service';
import type { CurriculumImportPreview } from '../../academic/types/curriculum';

vi.mock('../../../shared/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('../../../shared/lib/csrf', () => ({ getCsrfHeaders: vi.fn() }));

const row = (rowNumber: number, courseCode: string, errors: string[] = []) => ({
  rowNumber, courseCode, courseId: errors.length ? '' : `id-${courseCode}`, semesterNumber: 1, mandatory: true, groupName: null, errors,
});

describe('Curriculum import confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCsrfHeaders).mockResolvedValue({ 'X-XSRF-TOKEN': 'token' });
    vi.mocked(apiClient.post).mockResolvedValue({ data: { importedCount: 2 } });
  });

  it('sends only the valid rows, so a file with some bad rows can still be imported', async () => {
    const preview: CurriculumImportPreview = {
      totalRows: 3, validRows: 2, errorRows: 1,
      items: [row(2, 'PRF192'), row(3, 'CSD201'), row(4, 'NOPE999', ['Course not found'])],
    };

    await expect(curriculumService.confirmImport('cur-1', preview)).resolves.toBe(2);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/admin/curriculums/cur-1/import/confirm',
      { totalRows: 2, validRows: 2, errorRows: 0, items: [row(2, 'PRF192'), row(3, 'CSD201')] },
      { headers: { 'X-XSRF-TOKEN': 'token' } },
    );
  });
});
