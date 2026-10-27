// src/validations/ai-config.schema.ts
import { z } from 'zod';

const uuid = z.string().uuid();

export const createAiConfigSchema = z.object({
  name: z.string().min(2).max(100),
  provider: z.enum(['GEMINI', 'OTHER']),
  modelName: z.string().min(1).max(100),
  purpose: z.enum(['CHAT', 'EMBEDDING', 'OCR']),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(64).max(32768).optional(),
  retrievalTopK: z.number().int().min(1).max(20).optional(),
  similarityThreshold: z.number().min(0).max(1).nullable().optional(),
  timeoutSeconds: z.number().int().min(5).max(120).optional(),
  dailyRequestLimit: z.number().int().min(1).max(1_000_000).nullable().optional(),
  systemPrompt: z.string().max(8000).nullable().optional(),
  fallbackMessage: z.string().max(2000).nullable().optional(),
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
  configId: uuid.optional(),
  purpose: z.enum(['CHAT', 'EMBEDDING', 'OCR', 'ALL']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type PerformanceFilterFormValues = z.infer<typeof performanceFilterSchema>;