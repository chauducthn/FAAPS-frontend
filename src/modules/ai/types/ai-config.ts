// src/types/ai-config.ts
// DBML reference:
//   ai_configurations (name, provider, model_name, purpose, temperature, max_tokens,
//                     retrieval_top_k, similarity_threshold, timeout_seconds,
//                     daily_request_limit, system_prompt, fallback_message, is_active)
//   ai_usage_logs (feature, prompt_tokens, completion_tokens, total_tokens, latency_ms,
//                  status, error_message, created_at)

export type AiProvider = 'GEMINI' | 'OTHER';
export type AiPurpose = 'CHAT' | 'EMBEDDING' | 'OCR';
export type AiFeature = 'CHAT' | 'EMBEDDING' | 'OCR' | 'RECOMMENDATION' | 'SUMMARIZATION';
export type AiUsageStatus = 'SUCCESS' | 'TIMEOUT' | 'ERROR' | 'RATE_LIMITED' | 'FALLBACK';

export interface AiConfig {
  id: string;
  name: string;
  provider: AiProvider;
  modelName: string;
  purpose: AiPurpose;
  temperature: number;
  maxTokens: number;
  retrievalTopK: number;
  similarityThreshold: number | null;
  timeoutSeconds: number;
  dailyRequestLimit: number | null;
  systemPrompt: string | null;
  fallbackMessage: string | null;
  isActive: boolean;
  updatedByUserId: string | null;
  updatedAt: string;
}

export type AiPreset = {
  id: string;
  label: string;
  provider: AiProvider;
  modelName: string;
  purpose: AiPurpose;
  description: string;
  config: Pick<
    AiConfig,
    | 'temperature'
    | 'maxTokens'
    | 'retrievalTopK'
    | 'similarityThreshold'
    | 'timeoutSeconds'
    | 'dailyRequestLimit'
    | 'systemPrompt'
    | 'fallbackMessage'
  >;
};

export interface AiConfigFilterParams {
  purpose?: AiPurpose | 'ALL';
  provider?: AiProvider | 'ALL';
  isActive?: boolean | 'ALL';
  page?: number;
  size?: number;
  sort?: 'name,asc' | 'updatedAt,desc';
}

export interface CreateAiConfigDto {
  name: string;
  provider: AiProvider;
  modelName: string;
  purpose: AiPurpose;
  temperature?: number;
  maxTokens?: number;
  retrievalTopK?: number;
  similarityThreshold?: number | null;
  timeoutSeconds?: number;
  dailyRequestLimit?: number | null;
  systemPrompt?: string | null;
  fallbackMessage?: string | null;
  isActive?: boolean;
}

export interface UpdateAiConfigDto extends Partial<CreateAiConfigDto> {}

// IMPORTANT: apiKey is write-only. BE never returns it; FE never persists it.
export interface AiConfigSecretDto {
  apiKey: string;
}

// AI Performance
export interface AiUsageSummary {
  configId: string;
  configName: string;
  purpose: AiPurpose;
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  fallbackRequests: number;
  averageLatencyMs: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}

export interface AiUsageByDay {
  date: string;        // yyyy-MM-dd
  requests: number;
  failed: number;
  averageLatencyMs: number;
  promptTokens: number;
  completionTokens: number;
}

export interface AiPerformanceFilterParams {
  configId?: string;
  purpose?: AiPurpose | 'ALL';
  startDate?: string;  // ISO date
  endDate?: string;
}

export interface AiPerformanceResult {
  summary: AiUsageSummary[];
  byDay: AiUsageByDay[];
}