// src/modules/management/mocks/curriculumMockApi.ts
// Lớp mock trả dữ liệu giả bám đúng contract OpenAPI của backend cho
// khu vực Curriculum / Cohort của Admin.
//
//   GET /admin/curriculums              -> Page<CurriculumItem>   (KHÔNG bọc ApiResponse)
//   GET /admin/cohorts                  -> Page<CurriculumItem>
//   GET /admin/curriculums/{id}/courses -> CurriculumCourseItem[]
//
// Trang "cohort" và "curriculum" là hai URL trỏ tới cùng một bản ghi
// (curriculum_versions), nên cả hai dùng chung bộ dữ liệu này.
//
// Store là MUTABLE in-memory: mọi mutation (CRUD, status, add/remove course,
// drag & drop đổi semester, import preview/confirm) đều ghi trực tiếp vào
// `MOCK_CURRICULUMS` / `MOCK_CURRICULUM_COURSES` để UI test được như backend thật.

import type {
  AddCurriculumCoursesInput,
  CurriculumCourseItem,
  CurriculumInput,
  CurriculumItem,
  CurriculumPage,
  CurriculumStatus,
} from '../../academic/types/curriculum';
import type { CurriculumFilterParams } from '../../academic/types/curriculum';
import {
  MOCK_CURRICULUMS,
  MOCK_CURRICULUM_COURSES,
  syncCurriculumAggregates,
} from './curriculumMockData';
import { MOCK_COURSE_BY_CODE, MOCK_COURSE_BY_ID, MOCK_MAJORS, MOCK_SEMESTERS } from './curriculumSupportMockData';

const DEFAULT_SIZE = 20;

/** Hàng preview import XLSX (bám contract backend previewImport). */
export interface MockImportPreviewRow {
  rowNumber: number;
  courseCode: string;
  courseId: string;
  semesterNumber: number;
  mandatory: boolean;
  groupName: string | null;
  errors: string[];
}

export interface MockImportPreview {
  totalRows: number;
  validRows: number;
  errorRows: number;
  items: MockImportPreviewRow[];
}

const nowIso = (): string => new Date().toISOString();

/**
 * Lọc + phân trang trên bộ dữ liệu giả, đúng tham số query mà backend nhận:
 * majorId, status, isCurrent, search, page, size.
 */
export const buildMockCurriculumPage = (params?: CurriculumFilterParams): CurriculumPage => {
  const search = params?.search?.trim().toLowerCase();
  const status = params?.status;
  const majorId = params?.majorId;
  const isCurrent = params?.isCurrent;

  const filtered = MOCK_CURRICULUMS.filter((item) => {
    if (majorId && item.majorId !== majorId) return false;
    if (status && item.status !== status) return false;
    if (isCurrent !== undefined && item.isCurrent !== isCurrent) return false;
    if (!search) return true;
    return (
      item.name.toLowerCase().includes(search) ||
      item.majorCode.toLowerCase().includes(search) ||
      item.majorName.toLowerCase().includes(search) ||
      item.version.toLowerCase().includes(search) ||
      item.effectiveFromSemesterCode.toLowerCase().includes(search)
    );
  });

  const size = params?.size && params.size > 0 ? params.size : DEFAULT_SIZE;
  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size);
  const page = params?.page ?? 0;
  const safePage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);
  const start = safePage * size;

  return {
    items: filtered.slice(start, start + size),
    page: safePage,
    size,
    totalElements,
    totalPages,
  };
};

/** Danh sách môn học của một curriculum (mảng thuần, không bọc). */
export const buildMockCurriculumCourses = (curriculumId: string): CurriculumCourseItem[] =>
  [...(MOCK_CURRICULUM_COURSES[curriculumId] ?? [])];

/** Chi tiết một curriculum theo id. */
export const mockGetCurriculumById = (id: string): CurriculumItem => {
  const found = MOCK_CURRICULUMS.find((item) => item.id === id);
  if (!found) throw new Error('Not found');
  return found;
};

const resolveMajor = (majorId: string) => {
  const major = MOCK_MAJORS.find((m) => m.id === majorId);
  if (!major) throw new Error('Major does not exist');
  return major;
};

const resolveSemester = (semesterId: string | null) => {
  if (!semesterId) return { id: null as string | null, code: null as string | null, date: null as string | null };
  const found = MOCK_SEMESTERS.find((s) => s.id === semesterId);
  if (found) return { id: found.id, code: found.code, date: found.startDate };
  // SemesterCreator có thể tạo học kỳ mới ngoài seed — chấp nhận id lạ, suy ra code từ id.
  const code = semesterId.replace(/^sem-/i, '').toUpperCase();
  return { id: semesterId, code, date: null as string | null };
};

/** CRUD — tạo mới curriculum trong mock store. */
export const mockCreateCurriculum = (body: CurriculumInput): CurriculumItem => {
  const duplicate = MOCK_CURRICULUMS.some(
    (item) => item.majorId === body.majorId && item.version.trim().toLowerCase() === body.version.trim().toLowerCase(),
  );
  if (duplicate) throw new Error('A curriculum with this major and version already exists');

  const major = resolveMajor(body.majorId);
  const from = resolveSemester(body.effectiveFromSemesterId);
  const to = resolveSemester(body.effectiveToSemesterId);
  const id = `cv-mock-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

  const created: CurriculumItem = {
    id,
    majorId: major.id,
    majorCode: major.code,
    majorName: major.name,
    version: body.version.trim(),
    name: body.name.trim(),
    effectiveFromSemesterId: from.id ?? body.effectiveFromSemesterId,
    effectiveFromSemesterCode: from.code ?? body.effectiveFromSemesterId,
    effectiveFromDate: from.date,
    effectiveToSemesterId: to.id,
    effectiveToSemesterCode: to.code,
    effectiveToDate: to.date,
    description: body.description,
    isCurrent: body.status === 'ACTIVE' ? body.isCurrent : false,
    status: body.status,
    courseCount: 0,
    totalCredits: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  MOCK_CURRICULUMS.unshift(created);
  MOCK_CURRICULUM_COURSES[id] = [];
  return created;
};

/** CRUD — cập nhật thông tin curriculum trong mock store. */
export const mockUpdateCurriculum = (id: string, body: CurriculumInput): CurriculumItem => {
  const existing = mockGetCurriculumById(id);
  const duplicate = MOCK_CURRICULUMS.some(
    (item) =>
      item.id !== id &&
      item.majorId === body.majorId &&
      item.version.trim().toLowerCase() === body.version.trim().toLowerCase(),
  );
  if (duplicate) throw new Error('A curriculum with this major and version already exists');

  const major = resolveMajor(body.majorId);
  const from = resolveSemester(body.effectiveFromSemesterId);
  const to = resolveSemester(body.effectiveToSemesterId);

  Object.assign(existing, {
    majorId: major.id,
    majorCode: major.code,
    majorName: major.name,
    version: body.version.trim(),
    name: body.name.trim(),
    effectiveFromSemesterId: from.id ?? body.effectiveFromSemesterId,
    effectiveFromSemesterCode: from.code ?? existing.effectiveFromSemesterCode,
    effectiveFromDate: from.date ?? existing.effectiveFromDate,
    effectiveToSemesterId: to.id,
    effectiveToSemesterCode: to.code,
    effectiveToDate: to.date,
    description: body.description,
    isCurrent: body.status === 'ACTIVE' ? body.isCurrent : false,
    status: body.status,
    updatedAt: nowIso(),
  });
  return existing;
};

/** CRUD — xóa curriculum khỏi mock store (kèm toàn bộ môn của nó). */
export const mockDeleteCurriculum = (id: string): void => {
  const index = MOCK_CURRICULUMS.findIndex((item) => item.id === id);
  if (index === -1) throw new Error('Not found');
  MOCK_CURRICULUMS.splice(index, 1);
  delete MOCK_CURRICULUM_COURSES[id];
};

/** Publish / Archive — chuyển đổi status ACTIVE | INACTIVE. */
export const mockUpdateCurriculumStatus = (id: string, status: CurriculumStatus): CurriculumItem => {
  const existing = mockGetCurriculumById(id);
  existing.status = status;
  if (status !== 'ACTIVE') existing.isCurrent = false;
  existing.updatedAt = nowIso();
  return existing;
};

/** Tìm một dòng curriculum_courses theo catalogue courseId HOẶC cc id. */
const findPlacedCourse = (curriculumId: string, courseKey: string): CurriculumCourseItem | undefined =>
  (MOCK_CURRICULUM_COURSES[curriculumId] ?? []).find(
    (row) => row.courseId === courseKey || row.id === courseKey || row.courseCode === courseKey,
  );

/** Gán môn học: thêm nhiều môn vào một kỳ cụ thể. */
export const mockAddCurriculumCourses = (
  curriculumId: string,
  body: AddCurriculumCoursesInput,
): CurriculumCourseItem[] => {
  mockGetCurriculumById(curriculumId);
  if (!Number.isInteger(body.semesterNumber) || body.semesterNumber < 1 || body.semesterNumber > 20) {
    throw new Error('Semester must be a whole number from 1 to 20');
  }
  // FPT không dùng Mandatory/Elective — backend vẫn giữ trường nên mặc định true để tương thích.
  const mandatory = body.isMandatory ?? true;
  const bucket = MOCK_CURRICULUM_COURSES[curriculumId] ?? (MOCK_CURRICULUM_COURSES[curriculumId] = []);
  const added: CurriculumCourseItem[] = [];

  for (const courseKey of body.courseIds) {
    if (findPlacedCourse(curriculumId, courseKey)) continue; // đã có trong chương trình -> bỏ qua
    const catalogue = MOCK_COURSE_BY_ID.get(courseKey) ?? MOCK_COURSE_BY_CODE.get(courseKey);
    if (!catalogue) throw new Error(`Course ${courseKey} does not exist`);
    const row: CurriculumCourseItem = {
      id: `${curriculumId}-cc-${String(bucket.length + 1).padStart(3, '0')}-${catalogue.code.toLowerCase()}`,
      curriculumId,
      courseId: catalogue.id,
      courseCode: catalogue.code,
      courseName: catalogue.name,
      credits: catalogue.credits,
      courseStatus: 'ACTIVE',
      semesterNumber: body.semesterNumber,
      isMandatory: mandatory,
      groupName: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    bucket.push(row);
    added.push(row);
  }

  syncCurriculumAggregates(curriculumId);
  return added;
};

/**
 * Kéo thả / đổi kỳ: cập nhật semester_number + tính lại totalCredits.
 * Được gọi khi kéo 1 môn sang kỳ khác trên Kanban.
 */
export const mockUpdateCurriculumCourse = (
  curriculumId: string,
  courseKey: string,
  body: { semesterNumber: number; isMandatory?: boolean; groupName?: string | null },
): CurriculumCourseItem => {
  mockGetCurriculumById(curriculumId);
  if (!Number.isInteger(body.semesterNumber) || body.semesterNumber < 1 || body.semesterNumber > 20) {
    throw new Error('Semester must be a whole number from 1 to 20');
  }
  const row = findPlacedCourse(curriculumId, courseKey);
  if (!row) throw new Error('Course is not in this curriculum');
  row.semesterNumber = body.semesterNumber;
  // FPT không dùng Mandatory/Elective — backend vẫn giữ trường nên giữ nguyên giá trị cũ.
  if (body.isMandatory !== undefined) row.isMandatory = body.isMandatory;
  if (body.groupName !== undefined) row.groupName = body.groupName;
  row.updatedAt = nowIso();
  syncCurriculumAggregates(curriculumId);
  return row;
};

/** Xóa môn khỏi kỳ (gỡ khỏi curriculum). */
export const mockRemoveCurriculumCourse = (curriculumId: string, courseKey: string): void => {
  mockGetCurriculumById(curriculumId);
  const bucket = MOCK_CURRICULUM_COURSES[curriculumId] ?? [];
  const index = bucket.findIndex(
    (row) => row.courseId === courseKey || row.id === courseKey || row.courseCode === courseKey,
  );
  if (index === -1) throw new Error('Course is not in this curriculum');
  bucket.splice(index, 1);
  syncCurriculumAggregates(curriculumId);
};

/**
 * Giả lập upload XLSX — bước Preview.
 * Luôn trả 5 dòng hợp lệ + 1 dòng lỗi để UI test được cả happy case lẫn edge case.
 */
export const mockPreviewCurriculumImport = (_curriculumId: string, _fileName?: string): MockImportPreview => {
  mockGetCurriculumById(_curriculumId);
  const items: MockImportPreviewRow[] = [
    { rowNumber: 2, courseCode: 'IT001', courseId: 'course-it001', semesterNumber: 1, mandatory: true, groupName: null, errors: [] },
    { rowNumber: 3, courseCode: 'SE101', courseId: 'course-se101', semesterNumber: 3, mandatory: true, groupName: null, errors: [] },
    { rowNumber: 4, courseCode: 'MA005', courseId: 'course-ma005', semesterNumber: 5, mandatory: true, groupName: null, errors: [] },
    { rowNumber: 5, courseCode: 'SE104', courseId: 'course-se104', semesterNumber: 6, mandatory: true, groupName: null, errors: [] },
    { rowNumber: 6, courseCode: 'CAP401', courseId: 'course-cap401', semesterNumber: 9, mandatory: true, groupName: null, errors: [] },
    {
      rowNumber: 7,
      courseCode: 'XXX999',
      courseId: '',
      semesterNumber: 2,
      mandatory: true,
      groupName: null,
      errors: ['Course code XXX999 does not exist in the catalogue'],
    },
  ];
  return { totalRows: 6, validRows: 5, errorRows: 1, items };
};

/** Giả lập upload XLSX — bước Confirm: lưu các dòng hợp lệ vào mock store. */
export const mockConfirmCurriculumImport = (
  curriculumId: string,
  preview: MockImportPreview,
): number => {
  mockGetCurriculumById(curriculumId);
  const valid = (preview?.items ?? []).filter((row) => row.errors.length === 0);
  let imported = 0;
  for (const row of valid) {
    if (findPlacedCourse(curriculumId, row.courseId || row.courseCode)) continue;
    const catalogue =
      MOCK_COURSE_BY_ID.get(row.courseId) ?? MOCK_COURSE_BY_CODE.get(row.courseCode);
    if (!catalogue) continue;
    const bucket = MOCK_CURRICULUM_COURSES[curriculumId] ?? (MOCK_CURRICULUM_COURSES[curriculumId] = []);
    bucket.push({
      id: `${curriculumId}-cc-${String(bucket.length + 1).padStart(3, '0')}-${catalogue.code.toLowerCase()}`,
      curriculumId,
      courseId: catalogue.id,
      courseCode: catalogue.code,
      courseName: catalogue.name,
      credits: catalogue.credits,
      courseStatus: 'ACTIVE',
      semesterNumber: row.semesterNumber,
      isMandatory: row.mandatory,
      groupName: row.groupName,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    imported += 1;
  }
  syncCurriculumAggregates(curriculumId);
  return imported;
};
