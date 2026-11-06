// src/modules/management/pages/Curriculum.test.tsx
// Kiểm tra trang Curriculum render bảng từ `items` và phân trang theo `totalElements`
// khi service trả về đúng cấu trúc `Page` của backend.
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CurriculumPage from './Curriculum';
import { setCurriculumMockEnabled } from '../mocks/mockConfig';

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <MemoryRouter initialEntries={['/admin/curriculum']}>
      <QueryClientProvider client={queryClient}>
        <CurriculumPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

describe('Curriculum page with mock data', () => {
  beforeEach(() => setCurriculumMockEnabled(true));
  afterEach(() => setCurriculumMockEnabled(null));

  it('renders the table rows from items and paginates by totalElements', async () => {
    renderPage();

    // Chờ bảng render với dữ liệu mock (15 bản ghi, size = 10 -> 2 trang).
    const table = await screen.findByRole('table', {}, { timeout: 4000 });

    // Trang 1 có đúng 10 dòng dữ liệu (không tính dòng "no data").
    await waitFor(() => {
      expect(within(table).getAllByRole('row')).toHaveLength(11); // 1 header + 10 dòng
    });

    expect(within(table).getByText('SE_K22')).toBeInTheDocument();
    expect(within(table).getByText('Software Engineering K22')).toBeInTheDocument();

    // Phân trang dựa trên totalElements = 15.
    expect(screen.getByText(/Showing 1–10 of 15 curriculums/)).toBeInTheDocument();

    // Sang trang 2 -> 5 bản ghi còn lại.
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => {
      expect(screen.getByText(/Showing 11–15 of 15 curriculums/)).toBeInTheDocument();
    });
  });

  it('shows the credits column from the contract field totalCredits', async () => {
    renderPage();

    const table = await screen.findByRole('table', {}, { timeout: 4000 });
    expect(within(table).getByRole('columnheader', { name: 'Credits' })).toBeInTheDocument();
  });

  it('filters by major and updates the total count', async () => {
    renderPage();

    await screen.findByRole('table', {}, { timeout: 4000 });
    await waitFor(() => expect(screen.getByText(/of 15 curriculums/)).toBeInTheDocument());

    await userEvent.selectOptions(screen.getByLabelText('Major filter'), 'major-se');

    await waitFor(() => {
      expect(screen.getByText(/of 4 curriculums/)).toBeInTheDocument();
    });
  });
});
