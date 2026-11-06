// src/modules/management/mocks/curriculumMockData.ts
// Dữ liệu giả cho Curriculum / Cohort của Admin.
//
// Bám đúng schema `CurriculumItem` và `CurriculumCourseItem` trong OpenAPI
// của backend (GET /api/admin/curriculums -> Page<CurriculumItem>,
//  GET /api/admin/curriculums/{id}/courses -> ApiResponse<CurriculumCourseItem[]>).
//
// `specialization` (Chuyên ngành hẹp FPT) chỉ sống ở course catalogue
// (curriculumSupportMockData) và roadmap view-model — KHÔNG thêm vào
// `CurriculumItem` để không vỡ contract backend.
//
// Một "cohort" và một "curriculum" là CÙNG một bản ghi (curriculum_versions:
// 1 major + 1 version ví dụ K19), nên cả hai trang dùng chung bộ dữ liệu này.

import type { CurriculumCourseItem, CurriculumItem } from '../../academic/types/curriculum';

/** Số bản ghi tổng cộng — đủ để có 2 trang khi size = 10. */
export const MOCK_CURRICULUM_TOTAL = 15;

interface Seed {
  id: string;
  majorId: string;
  majorCode: string;
  majorName: string;
  version: string;
  name: string;
  semester: string;
  isCurrent: boolean;
  status: CurriculumItem['status'];
  description: string | null;
  effectiveToSemesterId: string | null;
  effectiveToSemesterCode: string | null;
  effectiveToDate: string | null;
}

const SEEDS: Seed[] = [
  {
    id: 'cv-0001', majorId: 'major-se', majorCode: 'SE', majorName: 'Software Engineering',
    version: 'K19', name: 'Software Engineering K19', semester: 'FA2019',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo K19 — niên khóa 2019.',
    effectiveToSemesterId: 'sem-sp2022', effectiveToSemesterCode: 'SP2022', effectiveToDate: '2022-06-30',
  },
  {
    id: 'cv-0002', majorId: 'major-se', majorCode: 'SE', majorName: 'Software Engineering',
    version: 'K20', name: 'Software Engineering K20', semester: 'FA2020',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo K20 — niên khóa 2020.',
    effectiveToSemesterId: 'sem-sp2022', effectiveToSemesterCode: 'SP2022', effectiveToDate: '2022-06-30',
  },
  {
    id: 'cv-0003', majorId: 'major-se', majorCode: 'SE', majorName: 'Software Engineering',
    version: 'K21', name: 'Software Engineering K21', semester: 'FA2021',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo K21 — niên khóa 2021.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
  {
    id: 'cv-0004', majorId: 'major-se', majorCode: 'SE', majorName: 'Software Engineering',
    version: 'K22', name: 'Software Engineering K22', semester: 'FA2022',
    isCurrent: true, status: 'ACTIVE', description: 'Chương trình đào tạo hiện hành của ngành SE.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
  {
    id: 'cv-0005', majorId: 'major-it', majorCode: 'IT', majorName: 'Information Technology',
    version: 'K19', name: 'Information Technology K19', semester: 'FA2019',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo K19 — niên khóa 2019.',
    effectiveToSemesterId: 'sem-sp2022', effectiveToSemesterCode: 'SP2022', effectiveToDate: '2022-06-30',
  },
  {
    id: 'cv-0006', majorId: 'major-it', majorCode: 'IT', majorName: 'Information Technology',
    version: 'K20', name: 'Information Technology K20', semester: 'FA2020',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo K20 — niên khóa 2020.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
  {
    id: 'cv-0007', majorId: 'major-it', majorCode: 'IT', majorName: 'Information Technology',
    version: 'K21', name: 'Information Technology K21', semester: 'FA2021',
    isCurrent: true, status: 'ACTIVE', description: 'Chương trình đào tạo hiện hành của ngành IT.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
  {
    id: 'cv-0008', majorId: 'major-ce', majorCode: 'CE', majorName: 'Computer Engineering',
    version: 'K19', name: 'Computer Engineering K19', semester: 'FA2019',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo K19 — niên khóa 2019.',
    effectiveToSemesterId: 'sem-sp2022', effectiveToSemesterCode: 'SP2022', effectiveToDate: '2022-06-30',
  },
  {
    id: 'cv-0009', majorId: 'major-ce', majorCode: 'CE', majorName: 'Computer Engineering',
    version: 'K20', name: 'Computer Engineering K20', semester: 'FA2020',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo K20 — niên khóa 2020.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
  {
    id: 'cv-0010', majorId: 'major-ce', majorCode: 'CE', majorName: 'Computer Engineering',
    version: 'K21', name: 'Computer Engineering K21', semester: 'FA2021',
    isCurrent: true, status: 'ACTIVE', description: 'Chương trình đào tạo hiện hành của ngành CE.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
  {
    id: 'cv-0011', majorId: 'major-ba', majorCode: 'BA', majorName: 'Business Administration',
    version: 'K19', name: 'Business Administration K19', semester: 'FA2019',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo K19 — niên khóa 2019.',
    effectiveToSemesterId: 'sem-sp2022', effectiveToSemesterCode: 'SP2022', effectiveToDate: '2022-06-30',
  },
  {
    id: 'cv-0012', majorId: 'major-ba', majorCode: 'BA', majorName: 'Business Administration',
    version: 'K20', name: 'Business Administration K20', semester: 'FA2020',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo K20 — niên khóa 2020.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
  {
    id: 'cv-0013', majorId: 'major-ba', majorCode: 'BA', majorName: 'Business Administration',
    version: 'K21', name: 'Business Administration K21', semester: 'FA2021',
    isCurrent: true, status: 'ACTIVE', description: 'Chương trình đào tạo hiện hành của ngành BA.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
  {
    id: 'cv-0014', majorId: 'major-ds', majorCode: 'DS', majorName: 'Data Science',
    version: 'K20', name: 'Data Science K20', semester: 'FA2020',
    isCurrent: false, status: 'INACTIVE', description: 'Chương trình đào tạo đầu tiên của ngành DS.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
  {
    id: 'cv-0015', majorId: 'major-ds', majorCode: 'DS', majorName: 'Data Science',
    version: 'K21', name: 'Data Science K21', semester: 'FA2021',
    isCurrent: true, status: 'ACTIVE', description: 'Chương trình đào tạo hiện hành của ngành DS.',
    effectiveToSemesterId: null, effectiveToSemesterCode: null, effectiveToDate: null,
  },
];

/** Ngày bắt đầu học kỳ, dùng để sinh `effectiveFromDate`. */
const semesterStartDate = (code: string): string => {
  const year = code.slice(-4);
  const term = code.slice(0, 2);
  if (term === 'FA') return `${year}-08-01`;
  if (term === 'SP') return `${year}-01-01`;
  return `${year}-06-01`;
};

const semesterId = (code: string): string => `sem-${code.toLowerCase()}`;

/** FPT không dùng khái niệm Elective/Mandatory — mọi môn đều thuộc lộ trình,
 * nhóm chuyên sâu thể hiện qua `specialization` trong catalogue (Kỳ 5+). */
interface CourseSeed {
  code: string;
  name: string;
  credits: number;
  semester: number;
}

/** Bộ môn của các ngành kỹ thuật (SE / IT / CE).
 * FPT nghiệp vụ: từ Kỳ 5 định hướng Chuyên ngành hẹp, Kỳ 7-9 học sâu
 * (Node.js, .NET, Game, Java, AI...). */
const TECH_COURSES: CourseSeed[] = [
  { code: 'IT001', name: 'Introduction to Programming', credits: 4, semester: 1 },
  { code: 'MA003', name: 'Calculus 1', credits: 4, semester: 1 },
  { code: 'GE001', name: 'English 1', credits: 3, semester: 1 },
  { code: 'IT002', name: 'Object Oriented Programming', credits: 4, semester: 2 },
  { code: 'MA004', name: 'Linear Algebra', credits: 3, semester: 2 },
  { code: 'IT003', name: 'Data Structures and Algorithms', credits: 4, semester: 3 },
  { code: 'SE101', name: 'Database Systems', credits: 4, semester: 3 },
  { code: 'IT004', name: 'Computer Organization', credits: 4, semester: 4 },
  { code: 'SE102', name: 'Web Programming', credits: 4, semester: 4 },
  { code: 'SE103', name: 'Software Engineering', credits: 4, semester: 5 },
  { code: 'MA005', name: 'Probability and Statistics', credits: 3, semester: 5 },
  { code: 'SE104', name: 'Operating Systems', credits: 4, semester: 6 },
  { code: 'SE105', name: 'Computer Networks', credits: 4, semester: 6 },
  { code: 'SE201', name: 'Node.js Development', credits: 4, semester: 7 },
  { code: 'SE202', name: '.NET Development', credits: 4, semester: 7 },
  { code: 'SE203', name: 'Game Development', credits: 4, semester: 8 },
  { code: 'SE204', name: 'Advanced Java Programming', credits: 4, semester: 8 },
  { code: 'EL101', name: 'Professional English 1', credits: 3, semester: 8 },
  { code: 'OJT401', name: 'Internship 1', credits: 2, semester: 9 },
  { code: 'CAP401', name: 'Graduation Project 1', credits: 3, semester: 9 },
  { code: 'CAP402', name: 'Graduation Project 2', credits: 4, semester: 10 },
];

/** Bộ môn của các ngành kinh tế / quản trị (BA / DS). */
const BUSINESS_COURSES: CourseSeed[] = [
  { code: 'GE101', name: 'Basic Mathematics', credits: 4, semester: 1 },
  { code: 'GE102', name: 'Basic English', credits: 3, semester: 1 },
  { code: 'BA101', name: 'Principles of Management', credits: 4, semester: 2 },
  { code: 'BA102', name: 'Financial Accounting', credits: 4, semester: 2 },
  { code: 'BA103', name: 'Marketing Principles', credits: 3, semester: 3 },
  { code: 'BA104', name: 'Business Statistics', credits: 3, semester: 3 },
  { code: 'BA105', name: 'Human Resource Management', credits: 3, semester: 4 },
  { code: 'BA106', name: 'Operations Management', credits: 3, semester: 4 },
  { code: 'BA107', name: 'Corporate Finance', credits: 4, semester: 5 },
  { code: 'BA108', name: 'Data Analytics for Business', credits: 4, semester: 5 },
  { code: 'BA109', name: 'Marketing Research', credits: 3, semester: 6 },
  { code: 'BA110', name: 'Strategic Management', credits: 4, semester: 6 },
  { code: 'EL201', name: 'Business Communication', credits: 3, semester: 7 },
  { code: 'BA111', name: 'Digital Transformation', credits: 4, semester: 7 },
  { code: 'OJT402', name: 'Internship 2', credits: 2, semester: 8 },
  { code: 'CAP403', name: 'Capstone Project', credits: 4, semester: 8 },
];

/** Id của một môn học. PHẢI khớp với id trong `curriculumSupportMockData.ts`
 * để trang chi tiết roadmap tra được catalogue theo `courseId`.
 */
const courseIdOf = (code: string): string => `course-${code.toLowerCase()}`;

const buildCoursesFor = (curriculum: CurriculumItem): CurriculumCourseItem[] => {
  const useTechCatalog = ['SE', 'IT', 'CE'].includes(curriculum.majorCode);
  const base = useTechCatalog ? TECH_COURSES : BUSINESS_COURSES;

  return base.map((course, index) => {
    return {
      id: `${curriculum.id}-cc-${String(index + 1).padStart(3, '0')}`,
      curriculumId: curriculum.id,
      courseId: courseIdOf(course.code),
      courseCode: course.code,
      courseName: course.name,
      credits: course.credits,
      courseStatus: 'ACTIVE',
      semesterNumber: course.semester,
      // Backend vẫn giữ trường isMandatory — FPT không hiển thị, mặc định true để tương thích.
      isMandatory: true,
      groupName: null,
      createdAt: '2026-01-05T08:00:00Z',
      updatedAt: '2026-10-05T08:00:00Z',
    };
  });
};

/**
 * Key -> danh sách môn của curriculum tương ứng.
 * Sinh TRƯỚC danh sách curriculum để `courseCount` và `totalCredits`
 * của mỗi curriculum khớp với danh sách môn thật của nó.
 *
 * Store dạng mutable để UI test được CRUD / drag&drop / import ngay trên
 * bộ nhớ (không cần backend). Dùng `resetCurriculumMockData()` để đưa về
 * trạng thái seed ban đầu (hữu ích cho test).
 */
function buildInitialState(): {
  curriculums: CurriculumItem[];
  courses: Record<string, CurriculumCourseItem[]>;
} {
  const coursesMap: Record<string, CurriculumCourseItem[]> = Object.fromEntries(
    SEEDS.map((seed) => {
      const placeholder = {
        ...seed,
        effectiveFromSemesterId: semesterId(seed.semester),
        effectiveFromSemesterCode: seed.semester,
        effectiveFromDate: semesterStartDate(seed.semester),
        courseCount: 0,
        totalCredits: 0,
        createdAt: '',
        updatedAt: '',
      } as unknown as CurriculumItem;

      return [seed.id, buildCoursesFor(placeholder)];
    }),
  );

  const curriculums: CurriculumItem[] = SEEDS.map((seed, index) => {
    const courses = coursesMap[seed.id] ?? [];
    return {
      id: seed.id,
      majorId: seed.majorId,
      majorCode: seed.majorCode,
      majorName: seed.majorName,
      version: seed.version,
      name: seed.name,
      effectiveFromSemesterId: semesterId(seed.semester),
      effectiveFromSemesterCode: seed.semester,
      effectiveFromDate: semesterStartDate(seed.semester),
      effectiveToSemesterId: seed.effectiveToSemesterId,
      effectiveToSemesterCode: seed.effectiveToSemesterCode,
      effectiveToDate: seed.effectiveToDate,
      description: seed.description,
      isCurrent: seed.isCurrent,
      status: seed.status,
      // Tính từ danh sách môn thật để bảng list và trang chi tiết không mâu thuẫn.
      courseCount: courses.length,
      totalCredits: courses.reduce((sum, course) => sum + course.credits, 0),
      createdAt: `2026-01-${String((index % 28) + 1).padStart(2, '0')}T08:00:00Z`,
      updatedAt: `2026-10-${String((index % 28) + 1).padStart(2, '0')}T08:00:00Z`,
    };
  });

  return { curriculums, courses: coursesMap };
}

const initial = buildInitialState();

export const MOCK_CURRICULUMS: CurriculumItem[] = initial.curriculums;
export const MOCK_CURRICULUM_COURSES: Record<string, CurriculumCourseItem[]> = initial.courses;

/** Đưa mock store về trạng thái seed ban đầu (dùng trong test / reset UI). */
export const resetCurriculumMockData = (): void => {
  const fresh = buildInitialState();
  MOCK_CURRICULUMS.splice(0, MOCK_CURRICULUMS.length, ...fresh.curriculums);
  for (const key of Object.keys(MOCK_CURRICULUM_COURSES)) delete MOCK_CURRICULUM_COURSES[key];
  Object.assign(MOCK_CURRICULUM_COURSES, fresh.courses);
};

/** Tính lại courseCount / totalCredits của một curriculum từ danh sách môn thật. */
export const syncCurriculumAggregates = (curriculumId: string): void => {
  const curriculum = MOCK_CURRICULUMS.find((item) => item.id === curriculumId);
  if (!curriculum) return;
  const courses = MOCK_CURRICULUM_COURSES[curriculumId] ?? [];
  curriculum.courseCount = courses.length;
  curriculum.totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  curriculum.updatedAt = new Date().toISOString();
};

/** Tổng số tín chỉ của một curriculum, tính lại từ danh sách môn. */
export const mockTotalCreditsOf = (curriculumId: string): number =>
  (MOCK_CURRICULUM_COURSES[curriculumId] ?? []).reduce((sum, course) => sum + course.credits, 0);
