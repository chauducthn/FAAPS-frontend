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

/** Một vài quan hệ thay thế (replacement) để UI detail có dữ liệu demo. */
const REPLACEMENT_PAIRS: Record<string, string> = {
  SE202: 'SE201',
  SE107: 'SE106',
  OJT402: 'OJT401',
};

const courseIdOf = (code: string) => `course-${code.toLowerCase()}`;

const SYLLABUS: Record<string, { description: string; objectives: string; learningOutcomes: string }> = {
  IT001: {
    description: 'Nhập môn lập trình với ngôn ngữ C: biến, rẽ nhánh, vòng lặp, mảng, hàm và tư duy giải thuật cơ bản.',
    objectives: 'Nắm vững cú pháp C cơ bản và rèn kỹ năng phân tích, cài đặt giải thuật cho bài toán nhập môn.',
    learningOutcomes: 'Viết được chương trình C hoàn chỉnh có kiểm thử đơn giản; đọc hiểu và sửa lỗi chương trình có sẵn.',
  },
  IT002: {
    description: 'Lập trình hướng đối tượng với Java: lớp, đối tượng, kế thừa, đa hình, interface và collections.',
    objectives: 'Hiểu và vận dụng 4 tính chất OOP để thiết kế hệ thống vừa và nhỏ.',
    learningOutcomes: 'Thiết kế được class diagram đơn giản và cài đặt ứng dụng Java OOP có xử lý ngoại lệ.',
  },
  IT003: {
    description: 'Cấu trúc dữ liệu và giải thuật: danh sách, ngăn xếp, hàng đợi, cây, đồ thị, sắp xếp và tìm kiếm.',
    objectives: 'Phân tích độ phức tạp và lựa chọn cấu trúc dữ liệu phù hợp cho từng bài toán.',
    learningOutcomes: 'Cài đặt được các cấu trúc dữ liệu kinh điển và đánh giá được Big-O của giải thuật.',
  },
  SE101: {
    description: 'Hệ cơ sở dữ liệu quan hệ: mô hình ER, chuẩn hóa, SQL, transaction, index và bảo mật dữ liệu.',
    objectives: 'Thiết kế schema chuẩn 3NF và thao tác thành thạo SQL cho ứng dụng thực tế.',
    learningOutcomes: 'Thiết kế và triển khai database hoàn chỉnh, viết truy vấn tối ưu cho báo cáo nghiệp vụ.',
  },
  SE102: {
    description: 'Lập trình web full-stack: HTML/CSS/JS, React, REST API và triển khai ứng dụng web.',
    objectives: 'Xây dựng được ứng dụng web hoàn chỉnh từ frontend tới backend.',
    learningOutcomes: 'Triển khai web app có xác thực, phân trang và gọi API; deploy lên môi trường cloud cơ bản.',
  },
};

const defaultSyllabus = (code: string, name: string, categoryName: string) => {
  const preset = SYLLABUS[code];
  if (preset) return preset;
  return {
    description: `${name} — môn học thuộc nhóm ${categoryName}. Đề cương gồm lý thuyết nền tảng, bài tập thực hành và đồ án cuối kỳ bám sát chuẩn đầu ra của chương trình.`,
    objectives: `Nắm vững kiến thức nền tảng của ${name}; rèn kỹ năng làm việc nhóm, thuyết trình và giải quyết vấn đề.`,
    learningOutcomes: `Vận dụng được kiến thức ${name} vào bài toán thực tế; hoàn thành bài kiểm tra và đồ án đạt chuẩn đầu ra môn học.`,
  };
};

/** Trạng thái demo: phần lớn ACTIVE, một vài môn INACTIVE để test bộ lọc status. */
const INACTIVE_CODES = new Set(['SE107', 'BA111', 'CAP402']);

/** Số curriculum đang dùng mỗi môn — khớp tương đối với seed trong curriculumMockData. */
const CURRICULUM_USAGE: Record<string, number> = {
  IT001: 4, IT002: 4, IT003: 4, IT004: 4, MA003: 4, MA004: 4, MA005: 4,
  SE101: 4, SE102: 4, SE103: 4, SE104: 4, SE105: 4, SE106: 2, SE107: 1,
  SE201: 2, SE202: 2, SE203: 2, SE204: 2, GE001: 4, EL101: 4, EL102: 3,
  OJT401: 3, CAP401: 3, CAP402: 3, GE101: 3, GE102: 3,
  BA101: 3, BA102: 3, BA103: 3, BA104: 3, BA105: 2, BA106: 2, BA107: 3,
  BA108: 2, BA109: 2, BA110: 3, BA111: 1, EL201: 2, OJT402: 2, CAP403: 2,
};

function buildMockCourses(): CourseDetail[] {
  const list: CourseDetail[] = COURSE_CATALOGUE.map((course, index) => {
    const category = categoryOf(course.category);
    const syllabus = defaultSyllabus(course.code, course.name, category.name);
    const prerequisiteCode = PREREQUISITE_PAIRS[course.code];
    const replacementCode = REPLACEMENT_PAIRS[course.code];
    const relations: CourseDetail['relations'] = [];
    if (prerequisiteCode) {
      relations.push({
        relationId: `rel-${course.code.toLowerCase()}-pre`,
        kind: 'PREREQUISITE',
        groupNo: 1,
        otherCourseId: courseIdOf(prerequisiteCode),
        otherCourseCode: prerequisiteCode,
        otherCourseName: COURSE_CATALOGUE.find((c) => c.code === prerequisiteCode)?.name ?? prerequisiteCode,
        minimumScore: 5,
      });
    }
    if (replacementCode) {
      relations.push({
        relationId: `rel-${course.code.toLowerCase()}-rep`,
        kind: 'REPLACEMENT',
        groupNo: 1,
        otherCourseId: courseIdOf(replacementCode),
        otherCourseCode: replacementCode,
        otherCourseName: COURSE_CATALOGUE.find((c) => c.code === replacementCode)?.name ?? replacementCode,
        minimumScore: null,
      });
    }
    return {
      id: courseIdOf(course.code),
      code: course.code,
      name: course.name,
      credits: course.credits,
      categoryId: category.id,
      categoryCode: category.code,
      categoryName: category.name,
      specialization: course.specialization ?? null,
      description: syllabus.description,
      objectives: syllabus.objectives,
      learningOutcomes: syllabus.learningOutcomes,
      status: INACTIVE_CODES.has(course.code) ? 'INACTIVE' : 'ACTIVE',
      prerequisiteCount: relations.length,
      usedInCurriculumCount: CURRICULUM_USAGE[course.code] ?? 2,
      createdAt: `2026-01-${String((index % 28) + 1).padStart(2, '0')}T08:00:00Z`,
      updatedAt: `2026-10-${String((index % 28) + 1).padStart(2, '0')}T08:00:00Z`,
      relations,
      referencedBy: [],
    };
  });

  // Đảo chiều quan hệ để có "Referenced By": ai đang cần môn này làm tiên quyết / thay thế.
  const byCode = new Map(list.map((c) => [c.code, c]));
  for (const course of list) {
    for (const rel of course.relations) {
      const target = byCode.get(rel.otherCourseCode);
      if (!target || target.id === course.id) continue;
      if (!target.referencedBy.some((r) => r.courseId === course.id)) {
        target.referencedBy.push({
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
        });
      }
    }
  }
  return list;
}

export const MOCK_COURSES: CourseDetail[] = buildMockCourses();

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
