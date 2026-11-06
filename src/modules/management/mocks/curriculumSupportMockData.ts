// src/modules/management/mocks/curriculumSupportMockData.ts
// Dữ liệu giả hỗ trợ cho trang Curriculum: danh sách major và danh mục môn học.
// Các bản ghi này được dùng để bộ lọc "Major" và bảng "Academic Roadmap" có dữ liệu
// khi backend chưa sẵn sàng — mọi thứ đều bám đúng contract OpenAPI.
//
//   GET /admin/majors          -> Major[]        (mảng thuần)
//   GET /admin/majors/paged    -> Page<Major>
//   GET /admin/courses         -> Page<CourseDetail>
//   GET /admin/courses/{id}    -> CourseDetail
//   GET /admin/course-categories -> CategoryItem[]

import type { CourseDetail } from '../../academic/types/course';
import type { Major } from '../../academic/types/major';

export interface MockCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: 'cat-01', code: 'C', name: 'Programming', description: 'Nhóm môn lập trình nền tảng' },
  { id: 'cat-02', code: 'M', name: 'Mathematics', description: 'Nhóm môn toán' },
  { id: 'cat-03', code: 'D', name: 'Database & Systems', description: 'Nhóm môn hệ thống và CSDL' },
  { id: 'cat-04', code: 'E', name: 'English', description: 'Nhóm môn tiếng Anh' },
  { id: 'cat-05', code: 'B', name: 'Business', description: 'Nhóm môn kinh tế - quản trị' },
  { id: 'cat-06', code: 'P', name: 'Capstone & OJT', description: 'Nhóm môn thực tập và đồ án' },
];

export const MOCK_MAJORS: Major[] = [
  { id: 'major-se', code: 'SE', name: 'Software Engineering', description: 'Kỹ sư phần mềm', totalCredits: 144, durationYears: 4, status: 'ACTIVE', cohort: 'K21', createdAt: '2026-01-05T08:00:00Z', updatedAt: '2026-10-05T08:00:00Z' },
  { id: 'major-it', code: 'IT', name: 'Information Technology', description: 'Công nghệ thông tin', totalCredits: 138, durationYears: 4, status: 'ACTIVE', cohort: 'K21', createdAt: '2026-01-05T08:00:00Z', updatedAt: '2026-10-05T08:00:00Z' },
  { id: 'major-ce', code: 'CE', name: 'Computer Engineering', description: 'Kỹ sư máy tính', totalCredits: 144, durationYears: 4, status: 'ACTIVE', cohort: 'K21', createdAt: '2026-01-05T08:00:00Z', updatedAt: '2026-10-05T08:00:00Z' },
  { id: 'major-ba', code: 'BA', name: 'Business Administration', description: 'Quản trị kinh doanh', totalCredits: 134, durationYears: 4, status: 'ACTIVE', cohort: 'K21', createdAt: '2026-01-05T08:00:00Z', updatedAt: '2026-10-05T08:00:00Z' },
  { id: 'major-ds', code: 'DS', name: 'Data Science', description: 'Khoa học dữ liệu', totalCredits: 128, durationYears: 4, status: 'ACTIVE', cohort: 'K21', createdAt: '2026-01-05T08:00:00Z', updatedAt: '2026-10-05T08:00:00Z' },
];

/** Mã môn -> mô tả đầy đủ, dùng cho cả catalogue lẫn curriculum courses.
 * FPT nghiệp vụ: từ Kỳ 5 chọn Chuyên ngành hẹp (specialization), Kỳ 7-9 học sâu
 * (Node.js, .NET, Game Development, ...). `specialization` là mock-only để Admin lọc. */
type CourseCatalogueEntry = { code: string; name: string; credits: number; category: string; specialization?: string | null };
const COURSE_CATALOGUE: CourseCatalogueEntry[] = [
  { code: 'IT001', name: 'Introduction to Programming', credits: 4, category: 'cat-01' },
  { code: 'IT002', name: 'Object Oriented Programming', credits: 4, category: 'cat-01' },
  { code: 'IT003', name: 'Data Structures and Algorithms', credits: 4, category: 'cat-01' },
  { code: 'IT004', name: 'Computer Organization', credits: 4, category: 'cat-01' },
  { code: 'MA003', name: 'Calculus 1', credits: 4, category: 'cat-02' },
  { code: 'MA004', name: 'Linear Algebra', credits: 3, category: 'cat-02' },
  { code: 'MA005', name: 'Probability and Statistics', credits: 3, category: 'cat-02' },
  { code: 'SE101', name: 'Database Systems', credits: 4, category: 'cat-03' },
  { code: 'SE102', name: 'Web Programming', credits: 4, category: 'cat-01' },
  { code: 'SE103', name: 'Software Engineering', credits: 4, category: 'cat-03' },
  { code: 'SE104', name: 'Operating Systems', credits: 4, category: 'cat-03' },
  { code: 'SE105', name: 'Computer Networks', credits: 4, category: 'cat-03' },
  { code: 'SE106', name: 'Artificial Intelligence', credits: 4, category: 'cat-03', specialization: 'AI & Data' },
  { code: 'SE107', name: 'Machine Learning', credits: 4, category: 'cat-03', specialization: 'AI & Data' },
  { code: 'SE201', name: 'Node.js Development', credits: 4, category: 'cat-01', specialization: 'Node.js' },
  { code: 'SE202', name: '.NET Development', credits: 4, category: 'cat-01', specialization: '.NET' },
  { code: 'SE203', name: 'Game Development', credits: 4, category: 'cat-01', specialization: 'Game Development' },
  { code: 'SE204', name: 'Advanced Java Programming', credits: 4, category: 'cat-01', specialization: 'Java' },
  { code: 'GE001', name: 'English 1', credits: 3, category: 'cat-04' },
  { code: 'EL101', name: 'Professional English 1', credits: 3, category: 'cat-04' },
  { code: 'EL102', name: 'Professional English 2', credits: 3, category: 'cat-04' },
  { code: 'OJT401', name: 'Internship 1', credits: 2, category: 'cat-06' },
  { code: 'CAP401', name: 'Graduation Project 1', credits: 3, category: 'cat-06' },
  { code: 'CAP402', name: 'Graduation Project 2', credits: 4, category: 'cat-06' },
  { code: 'GE101', name: 'Basic Mathematics', credits: 4, category: 'cat-02' },
  { code: 'GE102', name: 'Basic English', credits: 3, category: 'cat-04' },
  { code: 'BA101', name: 'Principles of Management', credits: 4, category: 'cat-05' },
  { code: 'BA102', name: 'Financial Accounting', credits: 4, category: 'cat-05' },
  { code: 'BA103', name: 'Marketing Principles', credits: 3, category: 'cat-05' },
  { code: 'BA104', name: 'Business Statistics', credits: 3, category: 'cat-02' },
  { code: 'BA105', name: 'Human Resource Management', credits: 3, category: 'cat-05' },
  { code: 'BA106', name: 'Operations Management', credits: 3, category: 'cat-05' },
  { code: 'BA107', name: 'Corporate Finance', credits: 4, category: 'cat-05' },
  { code: 'BA108', name: 'Data Analytics for Business', credits: 4, category: 'cat-05' },
  { code: 'BA109', name: 'Marketing Research', credits: 3, category: 'cat-05' },
  { code: 'BA110', name: 'Strategic Management', credits: 4, category: 'cat-05' },
  { code: 'BA111', name: 'Digital Transformation', credits: 4, category: 'cat-05' },
  { code: 'EL201', name: 'Business Communication', credits: 3, category: 'cat-04' },
  { code: 'OJT402', name: 'Internship 2', credits: 2, category: 'cat-06' },
  { code: 'CAP403', name: 'Capstone Project', credits: 4, category: 'cat-06' },
];

const categoryOf = (categoryId: string): MockCategory =>
  MOCK_CATEGORIES.find((c) => c.id === categoryId) ?? MOCK_CATEGORIES[0];

/** Quan hệ tiên quyết giả: môn học sau yêu cầu môn học trước. */
const PREREQUISITE_PAIRS: Record<string, string> = {
  IT002: 'IT001',
  IT003: 'IT002',
  IT004: 'IT001',
  MA004: 'MA003',
  MA005: 'MA003',
  SE101: 'IT003',
  SE102: 'IT002',
  SE103: 'IT003',
  SE104: 'IT003',
  SE105: 'IT004',
  SE106: 'MA005',
  SE107: 'MA005',
  SE201: 'SE102',
  SE202: 'SE102',
  SE203: 'IT003',
  SE204: 'IT002',
  EL101: 'GE001',
  EL102: 'EL101',
  CAP401: 'SE103',
  CAP402: 'CAP401',
  BA102: 'BA101',
  BA103: 'BA101',
  BA104: 'BA101',
  BA105: 'BA101',
  BA106: 'BA101',
  BA107: 'BA102',
  BA108: 'BA104',
  BA109: 'BA103',
  BA110: 'BA107',
  BA111: 'BA108',
  EL201: 'GE102',
  CAP403: 'BA110',
};

const courseIdOf = (code: string) => `course-${code.toLowerCase()}`;

export const MOCK_COURSES: CourseDetail[] = COURSE_CATALOGUE.map((course, index) => {
  const category = categoryOf(course.category);
  const prerequisiteCode = PREREQUISITE_PAIRS[course.code];

  return {
    id: courseIdOf(course.code),
    code: course.code,
    name: course.name,
    credits: course.credits,
    categoryId: category.id,
    categoryCode: category.code,
    categoryName: category.name,
    specialization: course.specialization ?? null,
    description: `${course.name} — môn học thuộc nhóm ${category.name}.`,
    objectives: `Nắm vững kiến thức nền tảng của ${course.name}.`,
    learningOutcomes: `Áp dụng được kiến thức ${course.name} vào bài toán thực tế.`,
    status: 'ACTIVE',
    prerequisiteCount: prerequisiteCode ? 1 : 0,
    usedInCurriculumCount: 2,
    createdAt: `2026-01-${String((index % 28) + 1).padStart(2, '0')}T08:00:00Z`,
    updatedAt: `2026-10-${String((index % 28) + 1).padStart(2, '0')}T08:00:00Z`,
    relations: prerequisiteCode
      ? [{
        relationId: `rel-${course.code.toLowerCase()}`,
        kind: 'PREREQUISITE',
        groupNo: 1,
        otherCourseId: courseIdOf(prerequisiteCode),
        otherCourseCode: prerequisiteCode,
        otherCourseName: COURSE_CATALOGUE.find((c) => c.code === prerequisiteCode)?.name ?? prerequisiteCode,
        minimumScore: 50,
      }]
      : [],
    referencedBy: [],
  };
});

export const MOCK_COURSE_BY_ID = new Map(MOCK_COURSES.map((course) => [course.id, course]));
export const MOCK_COURSE_BY_CODE = new Map(MOCK_COURSES.map((course) => [course.code, course]));

/** FPT narrow specializations (Chuyên ngành hẹp) — used by the AddCoursesModal filter for sem 7-9. */
export const MOCK_SPECIALIZATIONS: string[] = Array.from(
  new Set(MOCK_COURSES.map((course) => course.specialization).filter((s): s is string => !!s)),
).sort();

export interface MockSemester {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
}

/**
 * Danh sách học kỳ. Mã học kỳ phải khớp với `effectiveFromSemesterCode`
 * của các curriculum trong `curriculumMockData.ts` (FA2019, SP2020, ...).
 */
export const MOCK_SEMESTERS: MockSemester[] = [
  { id: 'sem-fa2019', code: 'FA2019', name: 'Fall 2019', startDate: '2019-08-01', endDate: '2019-12-20' },
  { id: 'sem-sp2020', code: 'SP2020', name: 'Spring 2020', startDate: '2020-01-06', endDate: '2020-05-22' },
  { id: 'sem-fa2020', code: 'FA2020', name: 'Fall 2020', startDate: '2020-08-03', endDate: '2020-12-18' },
  { id: 'sem-sp2021', code: 'SP2021', name: 'Spring 2021', startDate: '2021-01-04', endDate: '2021-05-21' },
  { id: 'sem-fa2021', code: 'FA2021', name: 'Fall 2021', startDate: '2021-08-02', endDate: '2021-12-17' },
  { id: 'sem-sp2022', code: 'SP2022', name: 'Spring 2022', startDate: '2022-01-03', endDate: '2022-05-20' },
  { id: 'sem-fa2022', code: 'FA2022', name: 'Fall 2022', startDate: '2022-08-01', endDate: '2022-12-16' },
];
