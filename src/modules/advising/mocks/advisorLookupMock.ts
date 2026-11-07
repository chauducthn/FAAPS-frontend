// src/modules/advising/mocks/advisorLookupMock.ts
// Danh mục học vụ giả cho trang "Academic Search" của Advisor.
//
// Bám đúng contract read-only của advisor:
//   GET /advisor/academic/courses?search=&category=  -> LookupCourse[]
//   GET /advisor/academic/courses/{id}               -> LookupCourse
//   GET /advisor/academic/curriculums                -> LookupCurriculum[]
//
// Mã môn học khớp với catalogue trong `curriculumSupportMockData` của Admin và
// với các kế hoạch học tập giả trong `advisorMockData` (SE201, SE104, OJT401...).

import type { LookupCourse, LookupCurriculum, LookupPrerequisite } from '../types/academic-lookup';

interface Seed {
  code: string;
  name: string;
  credits: number;
  category: string;
  /** Mã môn tiên quyết. */
  prereq?: string;
  description?: string;
}

const SEEDS: Seed[] = [
  { code: 'IT001', name: 'Introduction to Programming', credits: 4, category: 'Programming', description: 'Nhập môn lập trình với ngôn ngữ C: biến, rẽ nhánh, vòng lặp, mảng, hàm và tư duy giải thuật cơ bản.' },
  { code: 'MA003', name: 'Calculus 1', credits: 4, category: 'Mathematics' },
  { code: 'GE001', name: 'English 1', credits: 3, category: 'English' },
  { code: 'IT002', name: 'Object Oriented Programming', credits: 4, category: 'Programming', prereq: 'IT001', description: 'Lập trình hướng đối tượng với Java: lớp, đối tượng, kế thừa, đa hình, interface và collections.' },
  { code: 'MA004', name: 'Linear Algebra', credits: 3, category: 'Mathematics', prereq: 'MA003' },
  { code: 'MA005', name: 'Probability and Statistics', credits: 3, category: 'Mathematics', prereq: 'MA003' },
  { code: 'IT003', name: 'Data Structures and Algorithms', credits: 4, category: 'Programming', prereq: 'IT002', description: 'Cấu trúc dữ liệu và giải thuật: danh sách, ngăn xếp, hàng đợi, cây, đồ thị, sắp xếp và tìm kiếm.' },
  { code: 'IT004', name: 'Computer Organization', credits: 4, category: 'Programming', prereq: 'IT001' },
  { code: 'SE101', name: 'Database Systems', credits: 4, category: 'Database & Systems', prereq: 'IT003', description: 'Hệ cơ sở dữ liệu quan hệ: mô hình ER, chuẩn hóa, SQL, transaction, index và bảo mật dữ liệu.' },
  { code: 'SE102', name: 'Web Programming', credits: 4, category: 'Programming', prereq: 'IT002', description: 'Lập trình web full-stack: HTML/CSS/JS, React, REST API và triển khai ứng dụng web.' },
  { code: 'SE103', name: 'Software Engineering', credits: 4, category: 'Database & Systems', prereq: 'IT003' },
  { code: 'SE104', name: 'Operating Systems', credits: 4, category: 'Database & Systems', prereq: 'IT003' },
  { code: 'SE105', name: 'Computer Networks', credits: 4, category: 'Database & Systems', prereq: 'IT004' },
  { code: 'SE106', name: 'Artificial Intelligence', credits: 4, category: 'Database & Systems', prereq: 'MA005' },
  { code: 'SE107', name: 'Machine Learning', credits: 4, category: 'Database & Systems', prereq: 'MA005' },
  { code: 'SE201', name: 'Node.js Development', credits: 4, category: 'Programming', prereq: 'SE102' },
  { code: 'SE202', name: '.NET Development', credits: 4, category: 'Programming', prereq: 'SE102' },
  { code: 'SE203', name: 'Game Development', credits: 4, category: 'Programming', prereq: 'IT003' },
  { code: 'SE204', name: 'Advanced Java Programming', credits: 4, category: 'Programming', prereq: 'IT002' },
  { code: 'EL101', name: 'Professional English 1', credits: 3, category: 'English', prereq: 'GE001' },
  { code: 'EL102', name: 'Professional English 2', credits: 3, category: 'English', prereq: 'EL101' },
  { code: 'OJT401', name: 'Internship 1', credits: 2, category: 'Capstone & OJT' },
  { code: 'OJT402', name: 'Internship 2', credits: 2, category: 'Capstone & OJT' },
  { code: 'CAP401', name: 'Graduation Project 1', credits: 3, category: 'Capstone & OJT', prereq: 'SE103' },
  { code: 'CAP402', name: 'Graduation Project 2', credits: 4, category: 'Capstone & OJT', prereq: 'CAP401' },
  { code: 'CAP403', name: 'Capstone Project', credits: 4, category: 'Capstone & OJT' },
];

const NAME_BY_CODE = new Map(SEEDS.map((s) => [s.code, s.name]));

const buildPrerequisites = (seed: Seed): LookupPrerequisite[] => {
  if (!seed.prereq) return [];
  return [
    {
      courseCode: seed.prereq,
      courseName: NAME_BY_CODE.get(seed.prereq) ?? seed.prereq,
      groupNo: 1,
      minimumScore: 5,
    },
  ];
};

const buildSyllabus = (seed: Seed) =>
  Array.from({ length: 6 }, (_, i) => ({
    week: i + 1,
    topic: i === 0 ? `Introduction to ${seed.name}` : `${seed.name} — part ${i + 1}`,
    content:
      i === 0
        ? `Tổng quan môn ${seed.name}: mục tiêu học tập, tài liệu và cách đánh giá.`
        : `Nội dung tuần ${i + 1}: kiến thức trọng tâm, bài tập và hướng dẫn thực hành cho ${seed.name}.`,
  }));

const MOCK_COURSES: LookupCourse[] = SEEDS.map((seed) => ({
  id: `course-${seed.code.toLowerCase()}`,
  code: seed.code,
  name: seed.name,
  credits: seed.credits,
  category: seed.category,
  description:
    seed.description ??
    `${seed.name} — môn học thuộc nhóm ${seed.category}. Đề cương gồm lý thuyết nền tảng, bài tập thực hành và đồ án cuối kỳ bám sát chuẩn đầu ra của chương trình.`,
  objectives: `Nắm vững kiến thức nền tảng của ${seed.name}; rèn kỹ năng làm việc nhóm, thuyết trình và giải quyết vấn đề.`,
  learningOutcomes: `Vận dụng được kiến thức ${seed.name} vào bài toán thực tế; hoàn thành bài kiểm tra và đồ án đạt chuẩn đầu ra môn học.`,
  prerequisites: buildPrerequisites(seed),
  syllabus: buildSyllabus(seed),
}));

const CURRICULUM_SEEDS: {
  id: string;
  majorCode: string;
  majorName: string;
  version: string;
  description: string;
  semesters: { number: number; codes: string[] }[];
}[] = [
  {
    id: 'cur-se-k22', majorCode: 'SE', majorName: 'Software Engineering', version: 'K22',
    description: 'Chương trình đào tạo ngành Kỹ sư phần mềm — khóa 2022, hiện hành.',
    semesters: [
      { number: 1, codes: ['IT001', 'MA003', 'GE001'] },
      { number: 2, codes: ['IT002', 'MA004'] },
      { number: 3, codes: ['IT003', 'SE101'] },
      { number: 4, codes: ['IT004', 'SE102'] },
      { number: 5, codes: ['SE103', 'MA005'] },
      { number: 6, codes: ['SE104', 'SE105'] },
      { number: 7, codes: ['SE201', 'SE202'] },
      { number: 8, codes: ['SE203', 'SE204', 'EL101'] },
      { number: 9, codes: ['OJT401', 'CAP401'] },
      { number: 10, codes: ['CAP402'] },
    ],
  },
  {
    id: 'cur-se-k21', majorCode: 'SE', majorName: 'Software Engineering', version: 'K21',
    description: 'Chương trình đào tạo ngành Kỹ sư phần mềm — khóa 2021.',
    semesters: [
      { number: 1, codes: ['IT001', 'MA003', 'GE001'] },
      { number: 2, codes: ['IT002', 'MA004'] },
      { number: 3, codes: ['IT003', 'SE101'] },
      { number: 4, codes: ['IT004', 'SE102'] },
      { number: 5, codes: ['SE103', 'MA005'] },
      { number: 6, codes: ['SE104', 'SE105'] },
      { number: 7, codes: ['SE201', 'SE204'] },
      { number: 8, codes: ['SE203', 'EL101'] },
      { number: 9, codes: ['OJT401', 'CAP401'] },
    ],
  },
  {
    id: 'cur-it-k21', majorCode: 'IT', majorName: 'Information Technology', version: 'K21',
    description: 'Chương trình đào tạo ngành Công nghệ thông tin — khóa 2021.',
    semesters: [
      { number: 1, codes: ['IT001', 'MA003', 'GE001'] },
      { number: 2, codes: ['IT002', 'MA004'] },
      { number: 3, codes: ['IT003', 'SE101'] },
      { number: 4, codes: ['IT004', 'SE102'] },
      { number: 5, codes: ['SE106', 'MA005'] },
      { number: 6, codes: ['SE104', 'SE105'] },
      { number: 7, codes: ['SE201', 'SE202'] },
      { number: 8, codes: ['SE203', 'EL101'] },
      { number: 9, codes: ['OJT401', 'CAP401'] },
    ],
  },
  {
    id: 'cur-it-k22', majorCode: 'IT', majorName: 'Information Technology', version: 'K22',
    description: 'Chương trình đào tạo ngành Công nghệ thông tin — khóa 2022, hiện hành.',
    semesters: [
      { number: 1, codes: ['IT001', 'MA003', 'GE001'] },
      { number: 2, codes: ['IT002', 'MA004'] },
      { number: 3, codes: ['IT003', 'SE101'] },
      { number: 4, codes: ['IT004', 'SE102'] },
      { number: 5, codes: ['SE106', 'MA005'] },
      { number: 6, codes: ['SE104', 'SE107'] },
      { number: 7, codes: ['SE201', 'SE202'] },
      { number: 8, codes: ['SE203', 'SE204', 'EL101'] },
      { number: 9, codes: ['OJT401', 'CAP401'] },
      { number: 10, codes: ['CAP402'] },
    ],
  },
];

const CREDITS_BY_CODE = new Map(MOCK_COURSES.map((c) => [c.code, c.credits]));

const MOCK_CURRICULA: LookupCurriculum[] = CURRICULUM_SEEDS.map((seed) => {
  const semesters = seed.semesters.map((s) => ({
    semesterNumber: s.number,
    courses: s.codes,
  }));
  const totalCredits = seed.semesters.reduce(
    (sum, s) => sum + s.codes.reduce((inner, code) => inner + (CREDITS_BY_CODE.get(code) ?? 0), 0),
    0,
  );
  return {
    id: seed.id,
    majorCode: seed.majorCode,
    majorName: seed.majorName,
    version: seed.version,
    name: `${seed.majorName} ${seed.version}`,
    description: seed.description,
    totalCredits,
    semesters,
  };
});

/** Danh sách môn học, lọc theo từ khoá + nhóm môn. */
export const mockLookupCourses = (params: { search?: string; category?: string } = {}): LookupCourse[] => {
  const keyword = params.search?.trim().toLowerCase();
  return MOCK_COURSES.filter((course) => {
    if (params.category && course.category !== params.category) return false;
    if (!keyword) return true;
    return (
      course.code.toLowerCase().includes(keyword) ||
      course.name.toLowerCase().includes(keyword) ||
      course.category.toLowerCase().includes(keyword)
    );
  }).map((course) => ({ ...course }));
};

/** Chi tiết một môn học theo id hoặc mã. */
export const mockLookupCourseDetail = (id: string): LookupCourse => {
  const found =
    MOCK_COURSES.find((c) => c.id === id) ?? MOCK_COURSES.find((c) => c.code.toLowerCase() === id.toLowerCase());
  if (!found) throw new Error('Course not found');
  return { ...found };
};

/** Danh sách chương trình đào tạo. */
export const mockLookupCurricula = (): LookupCurriculum[] =>
  MOCK_CURRICULA.map((cur) => ({ ...cur, semesters: cur.semesters.map((s) => ({ ...s })) }));
