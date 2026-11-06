// Mock API cho phân hệ Courses — CRUD + relations + import XLSX trên bộ nhớ in-memory,
// bám đúng contract mà `course.service.ts` đang dùng, để UI test được như backend thật.
//
//   GET    /admin/courses                    -> Page<CourseSummary>
//   GET    /admin/courses/{id}               -> CourseDetail
//   POST   /admin/courses                    -> CourseSummary
//   PUT    /admin/courses/{id}               -> CourseSummary
//   DELETE /admin/courses/{id}
//   POST   /admin/courses/bulk-delete        -> { deletedCount }
//   POST   /admin/courses/import/preview     -> CourseImportPreview
//   POST   /admin/courses/import/confirm     -> { importedCount }
//   POST   /admin/courses/{id}/relations     (add / update / remove)
import type {
  AddCourseRelationDto,
  CourseDetail,
  CourseFilterParams,
  CourseImportPreview,
  CourseImportRow,
  CourseRelation,
  CourseSummary,
  CreateCourseDto,
  UpdateCourseDto,
  UpdateCourseRelationDto,
} from '../../academic/types/course';
import {
  MOCK_CATEGORIES,
  MOCK_COURSE_BY_CODE,
  MOCK_COURSE_BY_ID,
  MOCK_COURSES,
} from './curriculumSupportMockData';

const nowIso = () => new Date().toISOString();
const courseIdOf = (code: string) => `course-${code.toLowerCase().trim()}`;

/** Giữ 2 index Map đồng bộ với mảng MOCK_COURSES sau mỗi mutation. */
function reindex(course: CourseDetail) {
  MOCK_COURSE_BY_ID.set(course.id, course);
  MOCK_COURSE_BY_CODE.set(course.code, course);
}

function dropIndex(course: CourseDetail) {
  MOCK_COURSE_BY_ID.delete(course.id);
  if (MOCK_COURSE_BY_CODE.get(course.code)?.id === course.id) {
    MOCK_COURSE_BY_CODE.delete(course.code);
  }
}

function toSummary(course: CourseDetail): CourseSummary {
  const { relations: _r, referencedBy: _b, description: _d, objectives: _o, learningOutcomes: _l, ...rest } = course;
  return { ...rest };
}

function applySort(list: CourseDetail[], sort?: CourseFilterParams['sort']): CourseDetail[] {
  const [field = 'code', dir = 'asc'] = (sort ?? 'code,asc').split(',');
  const mul = dir === 'desc' ? -1 : 1;
  const sorted = [...list];
  if (field === 'credits') sorted.sort((a, b) => (a.credits - b.credits) * mul);
  else if (field === 'createdAt') sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt) * mul);
  else sorted.sort((a, b) => a.code.localeCompare(b.code) * mul);
  return sorted;
}

/** List + filter + search + sort + phân trang trên mock store. */
export function buildMockCoursePage(params?: CourseFilterParams) {
  const search = params?.search?.trim().toLowerCase();
  const filtered = MOCK_COURSES.filter((course) => {
    if (params?.status && params.status !== 'ALL' && course.status !== params.status) return false;
    if (params?.categoryId && course.categoryId !== params.categoryId) return false;
    if (params?.specialization && params.specialization !== 'ALL' && (course.specialization ?? '') !== params.specialization) return false;
    if (params?.credits !== undefined && course.credits !== params.credits) return false;
    if (!search) return true;
    return course.code.toLowerCase().includes(search) || course.name.toLowerCase().includes(search);
  });
  const sorted = applySort(filtered, params?.sort);
  const size = params?.size && params.size > 0 ? params.size : 20;
  const totalItems = sorted.length;
  const totalPages = size > 0 ? Math.ceil(totalItems / size) : 0;
  const page = params?.page ?? 0;
  const safePage = totalPages === 0 ? 0 : Math.min(Math.max(page, 0), totalPages - 1);
  return {
    items: sorted.slice(safePage * size, safePage * size + size).map(toSummary),
    page: safePage,
    pageSize: size,
    totalItems,
    totalPages,
  };
}

export function mockGetCourseById(id: string): CourseDetail {
  const found = MOCK_COURSE_BY_ID.get(id);
  if (!found) throw new Error('Course not found');
  return found;
}

/** Chuẩn hóa mã môn: viết hoa, trim. */
function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export function mockCreateCourse(body: CreateCourseDto): CourseSummary {
  const code = normalizeCode(body.code);
  if (MOCK_COURSE_BY_CODE.has(code)) throw new Error(`Course ${code} already exists`);
  const category = MOCK_CATEGORIES.find((c) => c.id === body.categoryId);
  if (!category) throw new Error('Category does not exist');
  if (!Number.isInteger(body.credits) || body.credits < 1 || body.credits > 20) {
    throw new Error('Credits must be a whole number from 1 to 20');
  }
  const created: CourseDetail = {
    id: `${courseIdOf(code)}-${Date.now().toString(36)}`,
    code,
    name: body.name.trim(),
    credits: body.credits,
    categoryId: category.id,
    categoryCode: category.code,
    categoryName: category.name,
    specialization: null,
    description: body.description?.trim() ? body.description.trim() : null,
    objectives: body.objectives?.trim() ? body.objectives.trim() : null,
    learningOutcomes: body.learningOutcomes?.trim() ? body.learningOutcomes.trim() : null,
    status: 'ACTIVE',
    prerequisiteCount: 0,
    usedInCurriculumCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    relations: [],
    referencedBy: [],
  };
  MOCK_COURSES.unshift(created);
  reindex(created);
  return toSummary(created);
}

export function mockUpdateCourse(id: string, body: UpdateCourseDto): CourseSummary {
  const existing = mockGetCourseById(id);
  if (body.code !== undefined) {
    const code = normalizeCode(body.code);
    if (!code) throw new Error('Course code is required');
    const dup = MOCK_COURSE_BY_CODE.get(code);
    if (dup && dup.id !== id) throw new Error(`Course ${code} already exists`);
    MOCK_COURSE_BY_CODE.delete(existing.code);
    existing.code = code;
  }
  if (body.name !== undefined) {
    if (body.name.trim().length < 3) throw new Error('Course name is required');
    existing.name = body.name.trim();
  }
  if (body.credits !== undefined) {
    if (!Number.isInteger(body.credits) || body.credits < 1 || body.credits > 20) {
      throw new Error('Credits must be a whole number from 1 to 20');
    }
    existing.credits = body.credits;
  }
  if (body.categoryId !== undefined) {
    const category = MOCK_CATEGORIES.find((c) => c.id === body.categoryId);
    if (!category) throw new Error('Category does not exist');
    existing.categoryId = category.id;
    existing.categoryCode = category.code;
    existing.categoryName = category.name;
  }
  if (body.description !== undefined) existing.description = body.description?.trim() ? body.description.trim() : null;
  if (body.objectives !== undefined) existing.objectives = body.objectives?.trim() ? body.objectives.trim() : null;
  if (body.learningOutcomes !== undefined) {
    existing.learningOutcomes = body.learningOutcomes?.trim() ? body.learningOutcomes.trim() : null;
  }
  if (body.status !== undefined) existing.status = body.status;
  existing.updatedAt = nowIso();
  reindex(existing);
  if (MOCK_COURSE_BY_CODE.get(existing.code)?.id !== existing.id) {
    MOCK_COURSE_BY_CODE.set(existing.code, existing);
  }
  return toSummary(existing);
}

export function mockRemoveCourse(id: string): void {
  const existing = mockGetCourseById(id);
  if (existing.usedInCurriculumCount > 0) {
    throw new Error(`${existing.code} is used in ${existing.usedInCurriculumCount} curriculum(s). Remove it from them first.`);
  }
  const hasDependents = MOCK_COURSES.some((c) => c.relations.some((r) => r.otherCourseId === id));
  if (hasDependents) throw new Error(`${existing.code} is a prerequisite of other courses. Remove those relations first.`);
  // Gỡ quan hệ mà môn này đang giữ (đồng thời dọn referencedBy ở đầu bên kia).
  for (const rel of existing.relations) {
    const target = MOCK_COURSE_BY_ID.get(rel.otherCourseId);
    if (target) target.referencedBy = target.referencedBy.filter((r) => r.courseId !== id);
  }
  const index = MOCK_COURSES.findIndex((c) => c.id === id);
  if (index !== -1) MOCK_COURSES.splice(index, 1);
  dropIndex(existing);
}

export function mockBulkRemoveCourses(ids: string[]): number {
  let count = 0;
  for (const id of ids) {
    try {
      mockRemoveCourse(id);
      count += 1;
    } catch {
      // Bỏ qua dòng bị chặn (đang dùng trong curriculum) — UI đã cảnh báo trước.
    }
  }
  return count;
}

// ---- Relations (mock) ----

export function mockAddCourseRelation(courseId: string, body: AddCourseRelationDto): CourseRelation {
  const course = mockGetCourseById(courseId);
  const other = MOCK_COURSE_BY_ID.get(body.otherCourseId);
  if (!other) throw new Error('Related course does not exist');
  if (other.id === course.id) throw new Error('A course cannot relate to itself');
  if (course.relations.some((r) => r.otherCourseId === other.id && r.kind === body.kind)) {
    throw new Error('This course is already related to it with the same type.');
  }
  // Chặn vòng lặp tiên quyết trực tiếp: A requires B trong khi B đã requires A.
  if (body.kind === 'PREREQUISITE' && other.relations.some((r) => r.kind === 'PREREQUISITE' && r.otherCourseId === course.id)) {
    throw new Error('Circular prerequisite: the selected course already requires this course.');
  }
  const groupNo = body.kind === 'REPLACEMENT' ? 1 : body.groupNo;
  if (body.kind === 'PREREQUISITE' && (!Number.isInteger(groupNo) || groupNo < 1 || groupNo > 20)) {
    throw new Error('Group must be a whole number from 1 to 20.');
  }
  const minimumScore = body.kind === 'REPLACEMENT' ? null : (body.minimumScore ?? null);
  if (minimumScore !== null && (Number.isNaN(minimumScore) || minimumScore < 0 || minimumScore > 10)) {
    throw new Error('Minimum score must be between 0 and 10.');
  }
  const relation: CourseRelation = {
    relationId: `rel-${course.code.toLowerCase()}-${other.code.toLowerCase()}-${Date.now().toString(36)}`,
    kind: body.kind,
    groupNo,
    otherCourseId: other.id,
    otherCourseCode: other.code,
    otherCourseName: other.name,
    minimumScore,
  };
  course.relations.push(relation);
  course.prerequisiteCount = course.relations.length;
  course.updatedAt = nowIso();
  if (!other.referencedBy.some((r) => r.courseId === course.id)) {
    other.referencedBy.push({ courseId: course.id, courseCode: course.code, courseName: course.name });
  }
  return relation;
}

export function mockUpdateCourseRelation(
  courseId: string,
  relationId: string,
  body: UpdateCourseRelationDto,
): CourseRelation {
  const course = mockGetCourseById(courseId);
  const relation = course.relations.find((r) => r.relationId === relationId);
  if (!relation) throw new Error('Relation not found');
  if (relation.kind === 'REPLACEMENT') return relation;
  if (body.groupNo !== undefined) {
    if (!Number.isInteger(body.groupNo) || body.groupNo < 1 || body.groupNo > 20) {
      throw new Error('Group must be a whole number from 1 to 20.');
    }
    relation.groupNo = body.groupNo;
  }
  if (body.minimumScore !== undefined) {
    if (body.minimumScore !== null && (Number.isNaN(body.minimumScore) || body.minimumScore < 0 || body.minimumScore > 10)) {
      throw new Error('Minimum score must be between 0 and 10.');
    }
    relation.minimumScore = body.minimumScore;
  }
  course.updatedAt = nowIso();
  return relation;
}

export function mockRemoveCourseRelation(courseId: string, relationId: string): CourseRelation {
  const course = mockGetCourseById(courseId);
  const index = course.relations.findIndex((r) => r.relationId === relationId);
  if (index === -1) throw new Error('Relation not found');
  const [removed] = course.relations.splice(index, 1);
  course.prerequisiteCount = course.relations.length;
  course.updatedAt = nowIso();
  // Dọn referencedBy ở đầu bên kia nếu không còn quan hệ nào trỏ tới.
  const target = MOCK_COURSE_BY_ID.get(removed.otherCourseId);
  if (target && !MOCK_COURSES.some((c) => c.relations.some((r) => r.otherCourseId === target.id && c.id === course.id))) {
    target.referencedBy = target.referencedBy.filter((r) => r.courseId !== course.id);
  }
  return removed;
}

// ---- Import XLSX (mock) ----

function rowErrors(code: string, name: string, credits: number, categoryId: string): string[] {
  const errors: string[] = [];
  if (!code) errors.push('Missing course code');
  else if (!/^[A-Z0-9_-]+$/i.test(code)) errors.push(`Code "${code}" has invalid characters`);
  else if (MOCK_COURSE_BY_CODE.has(normalizeCode(code))) errors.push(`Code ${normalizeCode(code)} already exists`);
  if (!name || name.trim().length < 3) errors.push('Name must be at least 3 characters');
  if (!Number.isInteger(credits) || credits < 1 || credits > 20) errors.push('Credits must be a whole number from 1 to 20');
  if (!categoryId || !MOCK_CATEGORIES.some((c) => c.id === categoryId)) errors.push('Unknown category');
  return errors;
}

/** Giả lập upload XLSX — đọc tên file để test cả happy case lẫn edge case. */
export function mockPreviewCourseImport(fileName?: string): CourseImportPreview {
  const base: Array<Omit<CourseImportRow, 'errors'>> = [
    { rowNumber: 2, code: 'SE301', name: 'Cloud Computing', credits: 4, categoryId: 'cat-03', categoryName: 'Database & Systems', description: 'Cloud fundamentals: virtualization, containers, deployment.', prerequisites: 'SE105', objectives: 'Deploy apps on cloud infra.', learningOutcomes: 'Deploy a containerized service.', status: 'ACTIVE' },
    { rowNumber: 3, code: 'SE302', name: 'DevOps Practices', credits: 3, categoryId: 'cat-03', categoryName: 'Database & Systems', description: 'CI/CD pipelines and automation.', prerequisites: 'SE102', objectives: 'Build CI/CD pipelines.', learningOutcomes: 'Automate build-test-deploy flow.', status: 'ACTIVE' },
    { rowNumber: 4, code: 'MA006', name: 'Discrete Mathematics', credits: 3, categoryId: 'cat-02', categoryName: 'Mathematics', description: 'Logic, sets, combinatorics.', prerequisites: '', objectives: 'Reason formally about structures.', learningOutcomes: 'Prove basic discrete structures.', status: 'ACTIVE' },
    { rowNumber: 5, code: 'EL103', name: 'Professional English 3', credits: 3, categoryId: 'cat-04', categoryName: 'English', description: 'Advanced workplace communication.', prerequisites: 'EL102', objectives: 'Present and negotiate in English.', learningOutcomes: 'Deliver a technical presentation.', status: 'ACTIVE' },
    { rowNumber: 6, code: 'SE303', name: 'Mobile Development', credits: 4, categoryId: 'cat-01', categoryName: 'Programming', description: 'Cross-platform mobile apps.', prerequisites: 'IT002', objectives: 'Build a mobile app end-to-end.', learningOutcomes: 'Ship a store-ready mobile build.', status: 'ACTIVE' },
  ];
  const items: CourseImportRow[] = base.map((row) => ({
    ...row,
    code: normalizeCode(row.code),
    errors: rowErrors(normalizeCode(row.code), row.name, row.credits, row.categoryId),
  }));
  // 1 dòng lỗi cố định để test edge case.
  items.push({
    rowNumber: 7,
    code: 'BAD CODE!',
    name: 'X',
    credits: 99,
    categoryId: 'cat-99',
    categoryName: 'Unknown',
    description: '',
    prerequisites: '',
    objectives: '',
    learningOutcomes: '',
    status: 'ACTIVE',
    errors: ['Row 7 is invalid (see error report for details)'],
  });
  const rebuilt: CourseImportRow[] = items.map((item) => {
    if (item.code === 'BAD CODE!') {
      return { ...item, errors: ['Code "BAD CODE!" has invalid characters', 'Name must be at least 3 characters', 'Credits must be a whole number from 1 to 20', 'Unknown category'] };
    }
    return item;
  });
  void fileName;
  const validRows = rebuilt.filter((r) => r.errors.length === 0).length;
  return { totalRows: rebuilt.length, validRows, errorRows: rebuilt.length - validRows, items: rebuilt };
}

/** Confirm: chỉ lưu dòng hợp lệ, bỏ qua dòng lỗi và dòng trùng mã. */
export function mockConfirmCourseImport(items: CourseImportRow[]): number {
  let imported = 0;
  for (const item of items) {
    if (item.errors.length > 0) continue;
    const code = normalizeCode(item.code);
    if (MOCK_COURSE_BY_CODE.has(code)) continue;
    const category = MOCK_CATEGORIES.find((c) => c.id === item.categoryId) ?? MOCK_CATEGORIES[0];
    const created: CourseDetail = {
      id: `${courseIdOf(code)}-${Date.now().toString(36)}-${imported}`,
      code,
      name: item.name.trim(),
      credits: item.credits,
      categoryId: category.id,
      categoryCode: category.code,
      categoryName: category.name,
      specialization: null,
      description: item.description?.trim() ? item.description.trim() : null,
      objectives: item.objectives?.trim() ? item.objectives.trim() : null,
      learningOutcomes: item.learningOutcomes?.trim() ? item.learningOutcomes.trim() : null,
      status: item.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      prerequisiteCount: 0,
      usedInCurriculumCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      relations: [],
      referencedBy: [],
    };
    // Gắn tiên quyết nếu mã prerequisite có trong catalogue.
    const prereqCodes = item.prerequisites.split(/[;,]/).map((s) => normalizeCode(s)).filter(Boolean);
    for (const preCode of prereqCodes) {
      const target = MOCK_COURSE_BY_CODE.get(preCode);
      if (!target) continue;
      created.relations.push({
        relationId: `rel-${code.toLowerCase()}-${preCode.toLowerCase()}-import`,
        kind: 'PREREQUISITE',
        groupNo: 1,
        otherCourseId: target.id,
        otherCourseCode: target.code,
        otherCourseName: target.name,
        minimumScore: null,
      });
      if (!target.referencedBy.some((r) => r.courseId === created.id)) {
        target.referencedBy.push({ courseId: created.id, courseCode: created.code, courseName: created.name });
      }
    }
    created.prerequisiteCount = created.relations.length;
    MOCK_COURSES.unshift(created);
    reindex(created);
    imported += 1;
  }
  return imported;
}

/** Xuất báo cáo lỗi import dạng CSV (mock thay cho XLSX backend). */
export function mockCourseImportErrorBlob(items: CourseImportRow[]): Blob {
  const header = 'rowNumber,code,name,credits,categoryId,errors';
  const lines = items
    .filter((i) => i.errors.length > 0)
    .map((i) => [i.rowNumber, `"${i.code}"`, `"${i.name.replace(/"/g, '""')}"`, i.credits, i.categoryId, `"${i.errors.join('; ').replace(/"/g, '""')}"`].join(','));
  return new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
}
