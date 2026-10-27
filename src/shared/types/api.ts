// src/types/api.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export interface ApiErrorResponse {
  success: boolean;
  code: string;
  message: string;
}

/**
 * Kết quả phân trang chuẩn của backend: items + page + size + totalElements + totalPages.
 * `page` bắt đầu từ 0, khớp với component Pagination.
 */
export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
