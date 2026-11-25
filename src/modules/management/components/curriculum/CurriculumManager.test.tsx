import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import CurriculumManager from './CurriculumManager';

const mocks = vi.hoisted(() => ({
  list: vi.fn(), previewImport: vi.fn(), confirmImport: vi.fn(), updateStatus: vi.fn(), remove: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }));
vi.mock('@/shared/hooks/useDebounce', () => ({ useDebounce: (value: string) => value }));
vi.mock('../../../academic/hooks/queries/useCurriculumsQuery', () => ({
  CURRICULUM_QUERY_KEYS: { all: ['admin', 'curriculums'] },
  useSemesterOptions: () => ({ data: [] }),
  useCurriculumsQuery: (_kind: string, params: unknown) => {
    mocks.list(params);
    return { data: { items: [{ id: 'cur-1', majorCode: 'SE', majorName: 'Software Engineering', version: 'K19', name: 'SE K19', status: 'INACTIVE', isCurrent: true, courseCount: 5, totalCredits: 15, effectiveFromSemesterCode: 'FA2026' }], totalElements: 1, totalPages: 1 }, isLoading: false, isError: false, isFetching: false, refetch: vi.fn() };
  },
}));
vi.mock('../../../academic/hooks/queries/useMajorsQuery', () => ({ useMajorsQuery: () => ({ data: { items: [{ id: 'major-1', code: 'SE', name: 'Software Engineering' }] } }) }));
vi.mock('../../../academic/hooks/mutations/useCurriculumMutations', () => ({
  useCurriculumMutations: () => ({ create: vi.fn(), update: vi.fn(), remove: vi.fn(), updateStatus: vi.fn(), previewImport: mocks.previewImport, confirmImport: mocks.confirmImport,
    isCreating: false, isUpdating: false, isRemoving: false, isPreviewingImport: false, isConfirmingImport: false }),
}));
vi.mock('../../services/curriculum.service', () => ({ curriculumService: { updateStatus: mocks.updateStatus, remove: mocks.remove } }));
vi.mock('../../utils/importChecks', () => ({ checkCurriculumImport: async () => ({ rowCount: 1, problems: [] }), curriculumExample: () => new Blob() }));
vi.mock('../../../learning/utils/studyPlanXlsx', () => ({ downloadBlob: vi.fn() }));

function renderManager() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter><CurriculumManager kind="curriculum" /></MemoryRouter></QueryClientProvider>);
}

describe('Curriculum list controls', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.updateStatus.mockResolvedValue(undefined); });

  it('filters current versions and updates selected curricula after confirmation', async () => {
    const user = userEvent.setup();
    renderManager();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Current version filter' }), 'true');
    expect(mocks.list).toHaveBeenLastCalledWith(expect.objectContaining({ isCurrent: true, page: 0 }));
    await user.click(screen.getByRole('checkbox', { name: 'Select SE K19' }));
    await user.click(within(screen.getByRole('toolbar', { name: 'Curriculum bulk actions' })).getByRole('button', { name: 'Set active' }));
    await user.click(within(screen.getByRole('dialog', { name: 'Set selected curriculums active?' })).getByRole('button', { name: 'Apply to selected' }));
    await waitFor(() => expect(mocks.updateStatus).toHaveBeenCalledWith('cur-1', 'ACTIVE'));
  });

  it('opens Excel import for the chosen curriculum and sends the file for preview', async () => {
    const user = userEvent.setup();
    mocks.previewImport.mockResolvedValue({ totalRows: 1, validRows: 1, errorRows: 0, items: [{ rowNumber: 2, courseCode: 'PRF192', courseId: 'course-1', semesterNumber: 1, mandatory: true, groupName: null, errors: [] }] });
    renderManager();
    await user.click(screen.getByRole('button', { name: 'Import Excel' }));
    const chooser = screen.getByRole('dialog', { name: 'Import curriculum from Excel' });
    expect(within(chooser).getByRole('combobox', { name: 'Target curriculum' })).toHaveValue('cur-1');
    await user.upload(within(chooser).getByLabelText('Choose Excel file'), new File(['xlsx'], 'curriculum.xlsx'));
    await waitFor(() => expect(mocks.previewImport).toHaveBeenCalledWith(expect.objectContaining({ id: 'cur-1' })));
    expect(await screen.findByRole('dialog', { name: 'Preview XLSX import' })).toBeInTheDocument();
  });
});
