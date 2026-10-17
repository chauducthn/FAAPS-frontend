// src/validations/import.schema.ts
import { z } from 'zod';

export const IMPORT_ENTITIES = ['COURSES', 'CURRICULUM_COURSES', 'MAJORS', 'STUDENTS'] as const;

export const importEntitySchema = z.enum(IMPORT_ENTITIES);

// Client-side rules mirror BE validation so FE can show errors before upload
export const importRowSchema = z.object({
  rowNumber: z.number().int().min(1),
  values: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
  valid: z.boolean(),
  errors: z.array(
    z.object({
      row: z.number().int().min(1),
      column: z.string(),
      code: z.enum([
        'REQUIRED',
        'INVALID_FORMAT',
        'OUT_OF_RANGE',
        'DUPLICATE_CODE',
        'UNKNOWN_REFERENCE',
        'BUSINESS_RULE',
      ]),
      message: z.string(),
    }),
  ),
});

export const importPreviewSchema = z.object({
  summary: z.object({
    jobId: z.string().uuid(),
    totalRows: z.number().int().min(0),
    validRows: z.number().int().min(0),
    invalidRows: z.number().int().min(0),
    headers: z.array(z.string()),
  }),
  rows: z.array(importRowSchema),
});

export type ImportPreviewFormValues = z.infer<typeof importPreviewSchema>;