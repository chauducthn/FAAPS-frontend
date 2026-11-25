import { buildCsv, csvFilename, downloadCsv, type CsvValue } from '@/shared/lib/csv';
import { adminService } from '../../services/adminService';
import type { AdminUserSummary } from '../../types/admin';
import { USER_ROLE_LABEL } from './userAccountColumns';

type ExportUserFilters = Omit<NonNullable<Parameters<typeof adminService.getUsers>[0]>, 'page' | 'size'>;

const EXPORT_PAGE_SIZE = 100;
const MAX_EXPORT_PAGES = 100;

const CSV_HEADER: CsvValue[] = [
  'Identifier',
  'Full Name',
  'Email',
  'Role',
  'Major',
  'Cohort',
  'Status',
  'Created At',
];

function toCsvRow(user: AdminUserSummary): CsvValue[] {
  return [
    user.userId,
    user.fullName,
    user.email,
    USER_ROLE_LABEL[user.role] ?? user.role,
    user.majorCode ?? '',
    user.cohort ?? '',
    user.status,
    user.createdAt,
  ];
}

/**
 * Fetches every page matching the active filters (bounded at 10,000 rows)
 * and downloads a UTF-8 CSV file with BOM so Excel renders Vietnamese names cleanly.
 */
export async function exportUsersToCsv(query: ExportUserFilters): Promise<number> {
  const allUsers: AdminUserSummary[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < MAX_EXPORT_PAGES) {
    const res = await adminService.getUsers({
      ...query,
      page,
      size: EXPORT_PAGE_SIZE,
    });
    allUsers.push(...(res.items ?? []));
    totalPages = Math.max(1, res.totalPages ?? 1);
    page += 1;
  }

  if (allUsers.length === 0) {
    return 0;
  }

  const csv = buildCsv([{ rows: [CSV_HEADER, ...allUsers.map(toCsvRow)] }]);
  downloadCsv(csv, csvFilename('user-accounts'));
  return allUsers.length;
}
