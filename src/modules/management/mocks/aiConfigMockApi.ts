// Mock API cho AI Configuration + AI Performance — CRUD in-memory + sinh dữ liệu
// biểu đồ theo ngày (deterministic theo date để filter Date Range có tác dụng).
import type {
  AiConfig,
  AiPerformanceFilterParams,
  AiPerformanceResult,
  AiUsageByDay,
  AiUsageSummary,
  CreateAiConfigDto,
  UpdateAiConfigDto,
} from '../../ai/types/ai-config';
import { MOCK_AI_CONFIGS, MOCK_AI_PRESETS } from './aiConfigMockData';

const nowIso = () => new Date().toISOString();

function matchesSearch(c: AiConfig, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    c.name.toLowerCase().includes(s) ||
    c.modelName.toLowerCase().includes(s) ||
    c.provider.toLowerCase().includes(s) ||
    c.purpose.toLowerCase().includes(s)
  );
}

export function buildMockAiConfigPage(params?: {
  search?: string;
  purpose?: string;
  provider?: string;
  isActive?: boolean | 'ALL';
  page?: number;
  size?: number;
}) {
  const filtered = MOCK_AI_CONFIGS.filter((c) => {
    if (params?.purpose && params.purpose !== 'ALL' && c.purpose !== params.purpose) return false;
    if (params?.provider && params.provider !== 'ALL' && c.provider !== params.provider) return false;
    if (params?.isActive !== undefined && params?.isActive !== 'ALL' && c.isActive !== params.isActive) {
      return false;
    }
    return matchesSearch(c, params?.search ?? '');
  });
  const sorted = [...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const size = params?.size && params.size > 0 ? params.size : 50;
  const page = params?.page ?? 0;
  const totalItems = sorted.length;
  const totalPages = size > 0 ? Math.ceil(totalItems / size) : 0;
  const safePage = totalPages === 0 ? 0 : Math.min(Math.max(page, 0), totalPages - 1);
  return {
    items: sorted.slice(safePage * size, safePage * size + size),
    page: safePage,
    pageSize: size,
    totalItems,
    totalPages,
  };
}

export function mockListAiPresets() {
  return [...MOCK_AI_PRESETS];
}

export function mockGetAiConfigById(id: string): AiConfig {
  const found = MOCK_AI_CONFIGS.find((c) => c.id === id);
  if (!found) throw new Error('AI configuration not found');
  return found;
}

export function mockCreateAiConfig(body: CreateAiConfigDto): AiConfig {
  if (!body.name?.trim()) throw new Error('Configuration name is required');
  if (!body.modelName?.trim()) throw new Error('Model name is required');
  assertNumbers(body);
  const created: AiConfig = {
    id: `ai-cfg-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    name: body.name.trim(),
    provider: body.provider,
    modelName: body.modelName.trim(),
    purpose: body.purpose,
    temperature: body.temperature ?? 0.4,
    maxTokens: body.maxTokens ?? 4096,
    retrievalTopK: body.retrievalTopK ?? 6,
    similarityThreshold: body.similarityThreshold ?? null,
    timeoutSeconds: body.timeoutSeconds ?? 30,
    dailyRequestLimit: body.dailyRequestLimit ?? null,
    systemPrompt: body.systemPrompt?.trim() ? body.systemPrompt.trim() : null,
    fallbackMessage: body.fallbackMessage?.trim() ? body.fallbackMessage.trim() : null,
    isActive: body.isActive ?? true,
    updatedByUserId: null,
    updatedAt: nowIso(),
  };
  MOCK_AI_CONFIGS.unshift(created);
  return created;
}

export function mockUpdateAiConfig(id: string, body: UpdateAiConfigDto): AiConfig {
  const existing = mockGetAiConfigById(id);
  assertNumbers(body);
  if (body.name !== undefined) {
    if (!body.name.trim()) throw new Error('Configuration name is required');
    existing.name = body.name.trim();
  }
  if (body.provider !== undefined) existing.provider = body.provider;
  if (body.modelName !== undefined) {
    if (!body.modelName.trim()) throw new Error('Model name is required');
    existing.modelName = body.modelName.trim();
  }
  if (body.purpose !== undefined) existing.purpose = body.purpose;
  if (body.temperature !== undefined) existing.temperature = body.temperature;
  if (body.maxTokens !== undefined) existing.maxTokens = body.maxTokens;
  if (body.retrievalTopK !== undefined) existing.retrievalTopK = body.retrievalTopK;
  if (body.similarityThreshold !== undefined) existing.similarityThreshold = body.similarityThreshold;
  if (body.timeoutSeconds !== undefined) existing.timeoutSeconds = body.timeoutSeconds;
  if (body.dailyRequestLimit !== undefined) existing.dailyRequestLimit = body.dailyRequestLimit;
  if (body.systemPrompt !== undefined) {
    existing.systemPrompt = body.systemPrompt?.trim() ? body.systemPrompt.trim() : null;
  }
  if (body.fallbackMessage !== undefined) {
    existing.fallbackMessage = body.fallbackMessage?.trim() ? body.fallbackMessage.trim() : null;
  }
  if (body.isActive !== undefined) existing.isActive = body.isActive;
  existing.updatedAt = nowIso();
  return existing;
}

function assertNumbers(body: CreateAiConfigDto | UpdateAiConfigDto): void {
  const check = (v: number | null | undefined, min: number, max: number, label: string, integer = false) => {
    if (v === undefined || v === null) return;
    if (!Number.isFinite(v)) throw new Error(`${label} must be a number`);
    if (integer && !Number.isInteger(v)) throw new Error(`${label} must be a whole number`);
    if (v < min) throw new Error(`${label} must be at least ${min}`);
    if (v > max) throw new Error(`${label} must be at most ${max}`);
  };
  check(body.temperature, 0, 2, 'Temperature');
  check(body.maxTokens, 64, 32768, 'Max tokens', true);
  check(body.retrievalTopK, 1, 20, 'Retrieval top K', true);
  check(body.similarityThreshold, 0, 1, 'Similarity threshold');
  check(body.timeoutSeconds, 5, 120, 'Timeout', true);
  check(body.dailyRequestLimit, 1, 1000000, 'Daily request limit', true);
}

export function mockRemoveAiConfig(id: string): void {
  const index = MOCK_AI_CONFIGS.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('AI configuration not found');
  MOCK_AI_CONFIGS.splice(index, 1);
}

/* ---------------- Performance (sinh theo ngày) ---------------- */

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** PRNG deterministic: cùng date + config cho cùng số liệu, filter range luôn ổn định. */
function pseudo(date: string, salt: string, min: number, max: number): number {
  const h = hashSeed(`${date}:${salt}`);
  const t = Math.sin(h) * 10000;
  const frac = t - Math.floor(t);
  return Math.floor(min + frac * (max - min + 1));
}

function eachDay(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return out;
  // Chặn range quá dài để chart không nghẽn.
  const maxDays = 120;
  const cursor = new Date(start);
  while (cursor <= end && out.length < maxDays) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const daysAgoIso = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export function mockGetAiPerformance(params: AiPerformanceFilterParams): AiPerformanceResult {
  const start = params.startDate || daysAgoIso(29);
  const end = params.endDate || todayIso();
  const days = eachDay(start, end);
  const effectiveDays = days.length > 0 ? days : eachDay(daysAgoIso(29), todayIso());

  const configs = MOCK_AI_CONFIGS.filter((c) => {
    if (params.configId && c.id !== params.configId) return false;
    if (params.purpose && params.purpose !== 'ALL' && c.purpose !== params.purpose) return false;
    return true;
  });

  // Tổng hợp theo ngày (cộng dồn mọi config đã lọc).
  const byDay: AiUsageByDay[] = effectiveDays.map((date) => {
    let requests = 0;
    let failed = 0;
    let latencySum = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    for (const c of configs.length > 0 ? configs : MOCK_AI_CONFIGS) {
      const base = c.purpose === 'CHAT' ? 120 : c.purpose === 'EMBEDDING' ? 400 : 60;
      const r = pseudo(date, c.id, Math.floor(base * 0.4), Math.floor(base * 1.6));
      const f = pseudo(date, `${c.id}:fail`, 0, Math.max(2, Math.floor(r * 0.06)));
      const lat = pseudo(date, `${c.id}:lat`, 600, c.purpose === 'OCR' ? 3200 : 1800);
      requests += r;
      failed += f;
      latencySum += lat * r;
      promptTokens += r * pseudo(date, `${c.id}:pt`, 300, 900);
      completionTokens += r * pseudo(date, `${c.id}:ct`, 150, 600);
    }
    return {
      date,
      requests,
      failed,
      averageLatencyMs: requests > 0 ? Math.round(latencySum / requests) : 0,
      promptTokens,
      completionTokens,
    };
  });

  const summary: AiUsageSummary[] = (configs.length > 0 ? configs : MOCK_AI_CONFIGS).map((c) => {
    let totalRequests = 0;
    let failedRequests = 0;
    let latencySum = 0;
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    for (const d of effectiveDays) {
      const base = c.purpose === 'CHAT' ? 120 : c.purpose === 'EMBEDDING' ? 400 : 60;
      const r = pseudo(d, c.id, Math.floor(base * 0.4), Math.floor(base * 1.6));
      const f = pseudo(d, `${c.id}:fail`, 0, Math.max(2, Math.floor(r * 0.06)));
      const lat = pseudo(d, `${c.id}:lat`, 600, c.purpose === 'OCR' ? 3200 : 1800);
      totalRequests += r;
      failedRequests += f;
      latencySum += lat * r;
      totalPromptTokens += r * pseudo(d, `${c.id}:pt`, 300, 900);
      totalCompletionTokens += r * pseudo(d, `${c.id}:ct`, 150, 600);
    }
    const fallbackRequests = pseudo(c.id, 'fallback', 0, Math.floor(totalRequests * 0.02));
    return {
      configId: c.id,
      configName: c.name,
      purpose: c.purpose,
      totalRequests,
      successRequests: Math.max(0, totalRequests - failedRequests),
      failedRequests,
      fallbackRequests,
      averageLatencyMs: totalRequests > 0 ? Math.round(latencySum / totalRequests) : 0,
      totalPromptTokens,
      totalCompletionTokens,
    };
  });

  return { summary, byDay };
}

export function resetAiConfigMockData(configs: AiConfig[]): void {
  MOCK_AI_CONFIGS.splice(0, MOCK_AI_CONFIGS.length, ...configs.map((c) => ({ ...c })));
}
