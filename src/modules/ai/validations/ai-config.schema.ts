// src/validations/ai-config.schema.ts
import { z } from 'zod';

// Mock catalogue dùng id đọc được (ai-cfg-chat...) nên chấp nhận mọi id non-empty,
// không ép UUID như backend (backend tự sinh và validate UUID thật).
const idRef = z.string().min(1, 'Select a valid option');

const numMsg = (label: string) => ({
  error: `${label} must be a number — letters are not allowed`,
});

export const createAiConfigSchema = z.object({
  name: z.string().min(2, 'Name needs at least 2 characters').max(100, 'Name is too long'),
  provider: z.enum(['GEMINI', 'OTHER']),
  modelName: z.string().min(1, 'Model name is required').max(100, 'Model name is too long'),
  purpose: z.enum(['CHAT', 'EMBEDDING', 'OCR']),
  temperature: z
    .number(numMsg('Temperature'))
    .min(0, 'Temperature cannot be negative')
    .max(2, 'Temperature is at most 2')
    .optional(),
  maxTokens: z
    .number(numMsg('Max tokens'))
    .int('Max tokens must be a whole number')
    .min(64, 'Max tokens must be at least 64')
    .max(32768, 'Max tokens is at most 32768')
    .optional(),
  retrievalTopK: z
    .number(numMsg('Retrieval top K'))
    .int('Top K must be a whole number')
    .min(1, 'Top K must be at least 1')
    .max(20, 'Top K is at most 20')
    .optional(),
  similarityThreshold: z
    .number(numMsg('Similarity threshold'))
    .min(0, 'Similarity cannot be negative')
    .max(1, 'Similarity is at most 1')
    .nullable()
    .optional(),
  timeoutSeconds: z
    .number(numMsg('Timeout'))
    .int('Timeout must be a whole number of seconds')
    .min(5, 'Timeout must be at least 5s')
    .max(120, 'Timeout is at most 120s')
    .optional(),
  dailyRequestLimit: z
    .number(numMsg('Daily limit'))
    .int('Daily limit must be a whole number')
    .min(1, 'Daily limit cannot be negative or zero')
    .max(1_000_000, 'Daily limit is at most 1,000,000')
    .nullable()
    .optional(),
  systemPrompt: z.string().max(8000, 'System prompt is too long').nullable().optional(),
  fallbackMessage: z.string().max(2000, 'Fallback message is too long').nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateAiConfigSchema = createAiConfigSchema.partial();

export const aiSecretSchema = z.object({
  apiKey: z
    .string()
    .min(8, 'API key looks too short')
    .max(500, 'API key is too long'),
});

export type CreateAiConfigFormValues = z.infer<typeof createAiConfigSchema>;
export type UpdateAiConfigFormValues = z.infer<typeof updateAiConfigSchema>;
export type AiSecretFormValues = z.infer<typeof aiSecretSchema>;

export const performanceFilterSchema = z.object({
  configId: idRef.optional(),
  purpose: z.enum(['CHAT', 'EMBEDDING', 'OCR', 'ALL']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type PerformanceFilterFormValues = z.infer<typeof performanceFilterSchema>;
