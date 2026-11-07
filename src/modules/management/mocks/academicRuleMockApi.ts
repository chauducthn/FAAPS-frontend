// Mock API cho phân hệ Academic Rules — CRUD + Publish/Archive trên bộ nhớ in-memory,
// bám contract mà `academic-rule.service.ts` đang dùng để UI test được như backend thật.
//
// Lifecycle: DRAFT -> ACTIVE (Publish) -> INACTIVE (Archive).
// ACTIVE rules are read-only: update bị chặn, xóa yêu cầu Archive trước.
import type {
  AcademicRule,
  AcademicRuleFilterParams,
  AcademicRuleStatus,
  CreateAcademicRuleDto,
  UpdateAcademicRuleDto,
} from '../../academic/types/academic-rule';
import { MOCK_ACADEMIC_RULES } from './academicRuleMockData';

const nowIso = () => new Date().toISOString();

function statusOf(rule: AcademicRule): AcademicRuleStatus {
  return rule.status;
}

function syncActive(rule: AcademicRule) {
  rule.isActive = rule.status === 'ACTIVE';
}

/** Chuẩn hóa search: tìm trong description, displayMessage, policyType, curriculumName. */
function matchesSearch(rule: AcademicRule, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    (rule.description ?? '').toLowerCase().includes(q) ||
    (rule.displayMessage ?? '').toLowerCase().includes(q) ||
    rule.policyType.toLowerCase().includes(q) ||
    rule.curriculumName.toLowerCase().includes(q)
  );
}

export function buildMockRulePage(params?: AcademicRuleFilterParams) {
  const search = params?.search ?? '';
  const filtered = MOCK_ACADEMIC_RULES.filter((rule) => {
    if (params?.curriculumVersionId && rule.curriculumVersionId !== params.curriculumVersionId) return false;
    if (params?.policyType && params.policyType !== 'ALL' && rule.policyType !== params.policyType) return false;
    if (params?.status && params.status !== 'ALL' && rule.status !== params.status) return false;
    if (params?.isActive !== undefined && params.isActive !== 'ALL' && rule.isActive !== params.isActive) return false;
    if (!matchesSearch(rule, search)) return false;
    return true;
  });

  const sort = params?.sort ?? 'priority,asc';
  const sorted = [...filtered];
  if (sort === 'priority,desc') sorted.sort((a, b) => b.priority - a.priority);
  else if (sort === 'updatedAt,desc') sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  else if (sort === 'createdAt,desc') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else sorted.sort((a, b) => a.priority - b.priority);

  const size = params?.size && params.size > 0 ? params.size : 20;
  const totalItems = sorted.length;
  const totalPages = size > 0 ? Math.ceil(totalItems / size) : 0;
  const page = params?.page ?? 0;
  const safePage = totalPages === 0 ? 0 : Math.min(Math.max(page, 0), totalPages - 1);
  return {
    items: sorted.slice(safePage * size, safePage * size + size),
    page: safePage,
    size,
    totalItems,
    totalPages,
  };
}

export function mockGetRuleById(id: string): AcademicRule {
  const found = MOCK_ACADEMIC_RULES.find((r) => r.id === id);
  if (!found) throw new Error('Academic rule not found');
  return found;
}

export function mockCreateRule(body: CreateAcademicRuleDto): AcademicRule {
  if (!body.curriculumVersionId) throw new Error('Curriculum is required');
  if (!body.condition || Object.keys(body.condition).length === 0) {
    throw new Error('At least one condition is required');
  }
  const id = `rule-mock-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
  const status: AcademicRuleStatus = body.status ?? 'DRAFT';
  const created: AcademicRule = {
    id,
    curriculumVersionId: body.curriculumVersionId,
    curriculumName: body.curriculumVersionId,
    policyType: body.policyType,
    status,
    condition: body.condition,
    restriction: body.restriction ?? {},
    approvalRequired: body.approvalRequired ?? false,
    priority: body.priority ?? 0,
    description: body.description?.trim() ? body.description.trim() : null,
    displayMessage: body.displayMessage?.trim() ? body.displayMessage.trim() : null,
    isActive: status === 'ACTIVE',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  syncActive(created);
  MOCK_ACADEMIC_RULES.unshift(created);
  return created;
}

export function mockUpdateRule(id: string, body: UpdateAcademicRuleDto): AcademicRule {
  const existing = mockGetRuleById(id);
  if (statusOf(existing) === 'ACTIVE') {
    throw new Error(`${existing.policyType} is ACTIVE and read-only. Archive it before editing.`);
  }
  if (body.curriculumVersionId !== undefined) {
    if (!body.curriculumVersionId) throw new Error('Curriculum is required');
    existing.curriculumVersionId = body.curriculumVersionId;
  }
  if (body.policyType !== undefined) existing.policyType = body.policyType;
  if (body.condition !== undefined) {
    if (Object.keys(body.condition).length === 0) throw new Error('At least one condition is required');
    existing.condition = body.condition;
  }
  if (body.restriction !== undefined) existing.restriction = body.restriction;
  if (body.approvalRequired !== undefined) existing.approvalRequired = body.approvalRequired;
  if (body.priority !== undefined) {
    if (!Number.isInteger(body.priority) || body.priority < 0 || body.priority > 1000) {
      throw new Error('Priority must be a whole number from 0 to 1000');
    }
    existing.priority = body.priority;
  }
  if (body.description !== undefined) {
    existing.description = body.description?.trim() ? body.description.trim() : null;
  }
  if (body.displayMessage !== undefined) {
    existing.displayMessage = body.displayMessage?.trim() ? body.displayMessage.trim() : null;
  }
  if (body.status !== undefined) existing.status = body.status;
  if (body.isActive !== undefined) {
    existing.status = body.isActive ? 'ACTIVE' : existing.status === 'ACTIVE' ? 'INACTIVE' : existing.status;
  }
  syncActive(existing);
  existing.updatedAt = nowIso();
  return existing;
}

/** Publish (DRAFT/INACTIVE -> ACTIVE) / Archive (ACTIVE -> INACTIVE). */
export function mockUpdateRuleStatus(id: string, status: AcademicRuleStatus): AcademicRule {
  const existing = mockGetRuleById(id);
  if (status === 'ACTIVE' && existing.status === 'ACTIVE') return existing;
  if (status === 'DRAFT' && existing.status === 'ACTIVE') {
    throw new Error('An ACTIVE rule cannot go back to DRAFT. Archive it instead.');
  }
  existing.status = status;
  syncActive(existing);
  existing.updatedAt = nowIso();
  return existing;
}

/** Tương thích với endpoint toggle cũ: true = ACTIVE, false = INACTIVE. */
export function mockToggleRule(id: string, isActive: boolean): AcademicRule {
  return mockUpdateRuleStatus(id, isActive ? 'ACTIVE' : 'INACTIVE');
}

export function mockRemoveRule(id: string): void {
  const index = MOCK_ACADEMIC_RULES.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Academic rule not found');
  if (MOCK_ACADEMIC_RULES[index].status === 'ACTIVE') {
    throw new Error('Archive this ACTIVE rule before deleting it.');
  }
  MOCK_ACADEMIC_RULES.splice(index, 1);
}

/** Đưa mock store về seed ban đầu (dùng trong test). */
export function resetAcademicRuleMockData(seed: AcademicRule[]): void {
  MOCK_ACADEMIC_RULES.splice(0, MOCK_ACADEMIC_RULES.length, ...seed.map((r) => ({ ...r })));
}
