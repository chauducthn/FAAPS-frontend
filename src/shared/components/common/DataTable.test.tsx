import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableColumnDef } from './DataTable';

interface Person {
  id: string;
  name: string;
  email: string;
  credits: number;
}

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'credits', header: 'Credits' },
];

const data: Person[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@fpt.edu.vn', credits: 3 },
  { id: '2', name: 'Alan Turing', email: 'alan@fpt.edu.vn', credits: 4 },
  { id: '3', name: 'Grace Hopper', email: 'grace@fpt.edu.vn', credits: 3 },
];

describe('DataTable', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders rows and the header row', () => {
    render(<DataTable columns={columns} data={data} searchKey="name" />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
  });

  it('shows the empty state when there is no data', () => {
    render(<DataTable columns={columns} data={[]} searchKey="name" />);
    expect(screen.getByText('Không tìm thấy dữ liệu')).toBeInTheDocument();
  });

  it('renders skeleton rows while loading', () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} searchKey="name" isLoading />,
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText('Không tìm thấy dữ liệu')).not.toBeInTheDocument();
  });

  it('filters client-side through the debounced search box', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} searchKey="name" />);

    await user.type(screen.getByRole('searchbox'), 'grace');
    await waitFor(() => expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument(), {
      timeout: 2000,
    });

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
  });

  it('sorts by a column when its header is clicked', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} searchKey="name" />);

    const header = screen.getByRole('columnheader', { name: /Name/i });
    await user.click(within(header).getByRole('button'));

    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(bodyRows[0]).toHaveTextContent('Ada Lovelace');
  });

  it('selects rows and reveals the floating bulk-action bar', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        bulkActions={(rows) => <button type="button">Xoá {rows.length} dòng</button>}
      />,
    );

    expect(screen.queryByText(/dòng đã chọn/)).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Chọn dòng 1'));

    expect(screen.getByText('1 dòng đã chọn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xoá 1 dòng' })).toBeInTheDocument();
  });

  it('selects every row from the header checkbox', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} searchKey="name" />);

    await user.click(screen.getByLabelText('Chọn tất cả'));
    expect(screen.getByText('3 dòng đã chọn')).toBeInTheDocument();
  });

  it('paginates and reports the page position', async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 15 }, (_, index) => ({
      id: String(index),
      name: `Person ${index}`,
      email: `p${index}@fpt.edu.vn`,
      credits: 3,
    }));
    render(<DataTable columns={columns} data={many} searchKey="name" />);

    expect(screen.getByText('Trang 1 / 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('Trang 2 / 2')).toBeInTheDocument();
  });

  describe('server-side mode', () => {
    it('does not filter the rows it was given and reports the search term instead', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      render(
        <DataTable
          manual
          columns={columns}
          data={data}
          searchKey="name"
          searchValue=""
          onSearchChange={onSearchChange}
        />,
      );

      // Every row is still visible even though a search term was typed.
      await user.type(screen.getByRole('searchbox'), 'grace');
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      await waitFor(() => expect(onSearchChange).toHaveBeenCalledWith('grace'), { timeout: 2000 });
    });

    it('paginates against the total row count, not the loaded page', async () => {
      const user = userEvent.setup();
      const onPaginationChange = vi.fn();
      render(
        <DataTable
          manual
          columns={columns}
          data={data}
          searchKey="name"
          totalRowCount={42}
          pagination={{ pageIndex: 0, pageSize: 10 }}
          onPaginationChange={onPaginationChange}
        />,
      );

      expect(screen.getByText('Trang 1 / 5')).toBeInTheDocument();
      expect(screen.getByText(/42 dòng/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Next/i }));
      expect(onPaginationChange).toHaveBeenCalledWith(
        expect.objectContaining({ pageIndex: 1 }),
      );
    });

    it('reports the selected rows to the bulk action bar', async () => {
      const user = userEvent.setup();
      render(
        <DataTable
          manual
          columns={columns}
          data={data}
          searchKey="name"
          getRowId={(row) => row.id}
          bulkActions={(rows) => <button type="button">Xoá {rows.length} dòng</button>}
        />,
      );

      await user.click(screen.getByLabelText('Chọn dòng 1'));
      expect(screen.getByRole('button', { name: 'Xoá 1 dòng' })).toBeInTheDocument();
    });
  });
});
