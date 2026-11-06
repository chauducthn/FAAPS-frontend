// src/modules/management/services/curriculum.service.test.ts
// Khoá lại contract của endpoint list: backend trả `Page` TRẦN
// (items, page, size, totalElements, totalPages) — không bọc trong ApiResponse.
import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildMockCurriculumCourses,
  buildMockCurriculumPage,
  mockAddCurriculumCourses,
  mockConfirmCurriculumImport,
  mockCreateCurriculum,
  mockDeleteCurriculum,
  mockPreviewCurriculumImport,
  mockRemoveCurriculumCourse,
  mockUpdateCurriculum,
  mockUpdateCurriculumCourse,
  mockUpdateCurriculumStatus,
} from '../mocks/curriculumMockApi';
import { MOCK_CURRICULUMS, MOCK_CURRICULUM_COURSES, resetCurriculumMockData } from '../mocks/curriculumMockData';
import { MOCK_COURSE_BY_ID } from '../mocks/curriculumSupportMockData';

describe('Mock curriculum page contract', () => {
  it('trả về đúng cấu trúc Page của backend', () => {
    const page = buildMockCurriculumPage({ page: 0, size: 10 });

    expect(Object.keys(page).sort()).toEqual(['items', 'page', 'size', 'totalElements', 'totalPages']);
    expect(page.page).toBe(0);
    expect(page.size).toBe(10);
    expect(page.totalElements).toBe(15);
    expect(page.totalPages).toBe(2);
    expect(page.items).toHaveLength(10);
  });

  it('mỗi item có đủ các trường theo contract CurriculumItem', () => {
    const [first] = buildMockCurriculumPage({ page: 0, size: 10 }).items;

    expect(first).toMatchObject({
      id: expect.any(String),
      majorId: expect.any(String),
      majorCode: expect.any(String),
      version: expect.any(String),
      name: expect.any(String),
      effectiveFromSemesterCode: expect.any(String),
      isCurrent: expect.any(Boolean),
      status: expect.any(String),
      courseCount: expect.any(Number),
      totalCredits: expect.any(Number),
    });
    // Backend chưa có trường specialization — mock cũng không được có.
    expect(first).not.toHaveProperty('specialization');
  });

  it('phân trang đúng: trang 1 trả phần còn lại của 15 bản ghi', () => {
    const second = buildMockCurriculumPage({ page: 1, size: 10 });

    expect(second.page).toBe(1);
    expect(second.items).toHaveLength(5);
    expect(second.totalElements).toBe(15);
    expect(second.totalPages).toBe(2);
  });

  it('lọc theo majorId, status và search', () => {
    const byMajor = buildMockCurriculumPage({ majorId: 'major-se', size: 50 });
    expect(byMajor.items.every((item) => item.majorId === 'major-se')).toBe(true);
    expect(byMajor.totalElements).toBe(4);

    const byStatus = buildMockCurriculumPage({ status: 'ACTIVE', size: 50 });
    expect(byStatus.items.every((item) => item.status === 'ACTIVE')).toBe(true);

    const bySearch = buildMockCurriculumPage({ search: 'Data Science', size: 50 });
    expect(bySearch.totalElements).toBe(2);
  });

  it('không vượt quá totalPages khi page quá lớn', () => {
    const page = buildMockCurriculumPage({ page: 99, size: 10 });
    expect(page.page).toBe(1);
    expect(page.items).toHaveLength(5);
  });

  it('mỗi curriculum có danh sách môn học riêng, không rỗng', () => {
    for (const curriculum of MOCK_CURRICULUMS) {
      const courses = buildMockCurriculumPage({ size: 100 }).items.find((i) => i.id === curriculum.id);
      expect(courses).toBeDefined();
    }
  });

  it('courseCount và totalCredits khớp với danh sách môn thật', () => {
    for (const curriculum of MOCK_CURRICULUMS) {
      const courses = MOCK_CURRICULUM_COURSES[curriculum.id];
      expect(courses.length).toBeGreaterThan(0);
      expect(curriculum.courseCount).toBe(courses.length);
      expect(curriculum.totalCredits).toBe(courses.reduce((sum, c) => sum + c.credits, 0));
    }
  });

  it('mọi courseId trong curriculum đều tra được trong catalogue', () => {
    for (const courses of Object.values(MOCK_CURRICULUM_COURSES)) {
      for (const course of courses) {
        expect(MOCK_COURSE_BY_ID.has(course.courseId)).toBe(true);
      }
    }
  });
});

describe('Mock curriculum mutations (in-memory)', () => {
  beforeEach(() => resetCurriculumMockData());

  it('CRUD: tạo mới / cập nhật / xóa curriculum', () => {
    const created = mockCreateCurriculum({
      majorId: 'major-se',
      version: 'K99',
      name: 'Software Engineering K99',
      effectiveFromSemesterId: 'sem-fa2022',
      effectiveToSemesterId: null,
      description: 'Bản nháp test',
      isCurrent: false,
      status: 'INACTIVE',
    });
    expect(created.id).toBeTruthy();
    expect(buildMockCurriculumPage({ size: 100 }).totalElements).toBe(16);

    const updated = mockUpdateCurriculum(created.id, {
      majorId: 'major-se',
      version: 'K99',
      name: 'Software Engineering K99 (sửa)',
      effectiveFromSemesterId: 'sem-fa2022',
      effectiveToSemesterId: null,
      description: 'Đã sửa',
      isCurrent: false,
      status: 'INACTIVE',
    });
    expect(updated.name).toContain('sửa');

    mockDeleteCurriculum(created.id);
    expect(buildMockCurriculumPage({ size: 100 }).totalElements).toBe(15);
  });

  it('Publish / Archive đổi status và giữ isCurrent đúng luật', () => {
    const archived = mockUpdateCurriculumStatus('cv-0004', 'INACTIVE');
    expect(archived.status).toBe('INACTIVE');
    expect(archived.isCurrent).toBe(false);

    const published = mockUpdateCurriculumStatus('cv-0004', 'ACTIVE');
    expect(published.status).toBe('ACTIVE');
  });

  it('Thêm / xóa môn khỏi kỳ và kéo-thả đổi semester + tính lại credits', () => {
    const before = buildMockCurriculumCourses('cv-0004');
    const totalBefore = before.reduce((s, c) => s + c.credits, 0);

    const added = mockAddCurriculumCourses('cv-0004', {
      courseIds: ['course-ba101'],
      semesterNumber: 2,
      isMandatory: false,
    });
    expect(added).toHaveLength(1);
    expect(added[0].semesterNumber).toBe(2);

    const target = before[0];
    const moved = mockUpdateCurriculumCourse('cv-0004', target.courseId, {
      semesterNumber: 9,
      isMandatory: target.isMandatory,
    });
    expect(moved.semesterNumber).toBe(9);

    const after = buildMockCurriculumCourses('cv-0004');
    const curriculum = MOCK_CURRICULUMS.find((c) => c.id === 'cv-0004');
    expect(curriculum?.courseCount).toBe(after.length);
    expect(curriculum?.totalCredits).toBe(after.reduce((s, c) => s + c.credits, 0));
    expect(curriculum?.totalCredits).toBeGreaterThan(totalBefore);

    mockRemoveCurriculumCourse('cv-0004', added[0].courseId);
    expect(buildMockCurriculumCourses('cv-0004')).toHaveLength(after.length - 1);
  });

  it('Import XLSX: preview 5 valid + 1 error, confirm chỉ lưu dòng hợp lệ', () => {
    // Dùng curriculum mới tạo (chưa có môn nào) để confirm thêm được 5 dòng hợp lệ.
    const fresh = mockCreateCurriculum({
      majorId: 'major-se',
      version: 'K98',
      name: 'Software Engineering K98',
      effectiveFromSemesterId: 'sem-fa2022',
      effectiveToSemesterId: null,
      description: null,
      isCurrent: false,
      status: 'INACTIVE',
    });
    const preview = mockPreviewCurriculumImport(fresh.id, 'plan.xlsx');
    expect(preview.totalRows).toBe(6);
    expect(preview.validRows).toBe(5);
    expect(preview.errorRows).toBe(1);
    expect(preview.items.filter((r) => r.errors.length > 0)).toHaveLength(1);

    const imported = mockConfirmCurriculumImport(fresh.id, preview);
    expect(imported).toBe(5);
    expect(buildMockCurriculumCourses(fresh.id)).toHaveLength(5);

    // Confirm lần 2 không trùng lặp.
    expect(mockConfirmCurriculumImport(fresh.id, preview)).toBe(0);
  });
});
