/**
 * Utilities for paginating through large backend lists (which enforce size <= 100)
 * and chunking bulk mutations safely.
 */

export function chunkArray<T>(items: T[], size = 100): T[][] {
  if (items.length <= size) return items.length === 0 ? [] : [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export interface PagedResult<T> {
  items: T[];
  totalElements?: number;
  totalItems?: number;
  totalPages?: number;
}

export async function fetchAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<PagedResult<T>>,
  options?: { pageSize?: number; concurrency?: number; maxPages?: number },
): Promise<T[]> {
  const pageSize = options?.pageSize ?? 10000;
  const concurrency = options?.concurrency ?? 6;
  const maxPages = options?.maxPages ?? 200;

  let activeSize = pageSize;
  let first: PagedResult<T>;
  try {
    first = await fetchPage(0, activeSize);
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 400 && activeSize > 100) {
      activeSize = 100;
      first = await fetchPage(0, activeSize);
    } else {
      throw err;
    }
  }

  const items = [...(first.items ?? [])];
  const totalCount = first.totalElements ?? first.totalItems ?? items.length;
  const computedPages = Math.ceil(totalCount / activeSize);
  const totalPages = Math.min(Math.max(1, first.totalPages ?? computedPages), maxPages);

  if (totalPages <= 1 || items.length < activeSize) {
    return items;
  }

  for (let start = 1; start < totalPages; start += concurrency) {
    const end = Math.min(start + concurrency, totalPages);
    const pages = await Promise.all(
      Array.from({ length: end - start }, (_, idx) => fetchPage(start + idx, activeSize)),
    );
    for (const res of pages) {
      items.push(...(res.items ?? []));
    }
  }

  return items;
}
