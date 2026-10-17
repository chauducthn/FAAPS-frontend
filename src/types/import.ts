// src/types/import.ts
// Multi-step import flow: upload -> preview (with row-level errors) -> confirm -> result
// Targets the DBML tables relevant to each preset (courses, curriculum_courses, ...)

export type ImportEntity = 'COURSES' | 'CURRICULUM_COURSES' | 'MAJORS' | 'STUDENTS';

export type ImportStep = 'UPLOAD' | 'PREVIEW' | 'RESULT';

export type ImportStatus = 'PENDING' | 'PREVIEWED' | 'CONFIRMED' | 'FAILED';

export interface ImportJob {
  id: string;
  entity: ImportEntity;
  fileName: string;
  fileSize: number;
  uploadedByUserId: string;
  uploadedByUserName: string;
  status: ImportStatus;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  createdAt: string;
  confirmedAt: string | null;
}

export interface ImportJobFilterParams {
  entity?: ImportEntity | 'ALL';
  status?: ImportStatus | 'ALL';
  search?: string;
  page?: number;
  size?: number;
  sort?: 'createdAt,desc' | 'createdAt,asc';
}

export interface ImportPreviewSummary {
  jobId: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  // Server-side preview must include the schema used so FE can re-validate on edit
  headers: string[];
}

export type ImportCellErrorCode =
  | 'REQUIRED'
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'DUPLICATE_CODE'
  | 'UNKNOWN_REFERENCE'
  | 'BUSINESS_RULE';

export interface ImportCellError {
  row: number;
  column: string;
  code: ImportCellErrorCode;
  message: string;
}

export interface ImportRow {
  rowNumber: number;        // 1-based, matches Excel row number
  values: Record<string, string | number | null>;
  valid: boolean;
  errors: ImportCellError[];
}

export interface ImportPreview {
  summary: ImportPreviewSummary;
  rows: ImportRow[];
}

export interface ImportConfirmResult {
  jobId: string;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportCellError[];
}

export type ImportPreset = {
  id: string;
  label: string;
  entity: ImportEntity;
  description: string;
  columns: { key: string; label: string; required: boolean; example: string }[];
};