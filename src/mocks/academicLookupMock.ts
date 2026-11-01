/**
 * Mock data cho trang Academic Lookup của Advisor.
 * Dùng khi `IS_MOCK_MODE = true` — advisor tra cứu Curricula / Courses mà không cần backend.
 */

export interface LookupPrerequisite {
  courseCode: string;
  courseName: string;
  groupNo: number;
  minimumScore: number | null;
}

export interface SyllabusWeek {
  week: number;
  topic: string;
  content: string;
}

export interface LookupCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  category: string;
  description: string;
  objectives: string;
  learningOutcomes: string;
  prerequisites: LookupPrerequisite[];
  syllabus: SyllabusWeek[];
}

export interface LookupCurriculum {
  id: string;
  majorCode: string;
  majorName: string;
  version: string;
  name: string;
  totalCredits: number;
  semesters: { semesterNumber: number; courses: string[] }[];
}

export const mockLookupCourses: LookupCourse[] = [
  {
    id: 'lk-c01',
    code: 'PRF192',
    name: 'Programming Fundamentals',
    credits: 3,
    category: 'Core',
    description: 'Nhập môn lập trình với C: biến, rẽ nhánh, vòng lặp, mảng, hàm và tư duy thuật toán cơ bản.',
    objectives: 'Sinh viên viết được chương trình C hoàn chỉnh, debug lỗi cơ bản và phân tích độ phức tạp đơn giản.',
    learningOutcomes: 'Viết hàm modular; xử lý mảng/chuỗi; đọc hiểu đề bài và cài đặt thuật toán sắp xếp/tìm kiếm cơ bản.',
    prerequisites: [],
    syllabus: [
      { week: 1, topic: 'Tổng quan & môi trường', content: 'Cài đặt IDE, biên dịch, I/O cơ bản với printf/scanf.' },
      { week: 2, topic: 'Rẽ nhánh & vòng lặp', content: 'if/switch, for/while, bài tập mô phỏng điểm số.' },
      { week: 3, topic: 'Mảng & chuỗi', content: 'Mảng 1-2 chiều, chuỗi ký tự, bài tập quản lý điểm.' },
      { week: 4, topic: 'Hàm & con trỏ cơ bản', content: 'Tách hàm, tham trị/tham chiếu, mini-project cuối môn.' },
    ],
  },
  {
    id: 'lk-c02',
    code: 'MAE101',
    name: 'Mathematics for Engineering',
    credits: 3,
    category: 'Foundation',
    description: 'Đại số tuyến tính và giải tích cơ bản phục vụ lập trình: ma trận, giới hạn, đạo hàm, tích phân.',
    objectives: 'Nắm công cụ toán để học DSA, xác suất và machine learning sau này.',
    learningOutcomes: 'Giải hệ phương trình tuyến tính; tính đạo hàm/tích phân hàm một biến; mô hình hoá bài toán đơn giản.',
    prerequisites: [],
    syllabus: [
      { week: 1, topic: 'Ma trận & định thức', content: 'Phép toán ma trận, hệ phương trình tuyến tính.' },
      { week: 2, topic: 'Giới hạn & liên tục', content: 'Giới hạn hàm số, ứng dụng tốc độ tăng trưởng.' },
      { week: 3, topic: 'Đạo hàm & ứng dụng', content: 'Cực trị, tối ưu hoá — nền tảng gradient descent.' },
      { week: 4, topic: 'Tích phân', content: 'Tích phân xác định, ứng dụng tính diện tích/xác suất.' },
    ],
  },
  {
    id: 'lk-c03',
    code: 'PRO192',
    name: 'Object-Oriented Programming',
    credits: 3,
    category: 'Core',
    description: 'Lập trình hướng đối tượng với Java: class, kế thừa, đa hình, interface, exception và collections.',
    objectives: 'Thiết kế hệ thống OOP hoàn chỉnh với UML cơ bản và unit test.',
    learningOutcomes: 'Áp dụng 4 tính chất OOP; dùng Collections/Stream API; xử lý ngoại lệ và đọc/ghi file.',
    prerequisites: [{ courseCode: 'PRF192', courseName: 'Programming Fundamentals', groupNo: 1, minimumScore: 5 }],
    syllabus: [
      { week: 1, topic: 'Class & Object', content: 'Đóng gói, constructor, static, bài tập quản lý sinh viên.' },
      { week: 2, topic: 'Kế thừa & đa hình', content: 'extends, override, abstract class vs interface.' },
      { week: 3, topic: 'Collections & Exception', content: 'List/Map/Set, try-catch, workshop quản lý kho.' },
      { week: 4, topic: 'Project', content: 'Xây dựng app console hoàn chỉnh + review code.' },
    ],
  },
  {
    id: 'lk-c04',
    code: 'DBI202',
    name: 'Database Systems',
    credits: 3,
    category: 'Core',
    description: 'Thiết kế CSDL quan hệ: ERD, chuẩn hoá, SQL truy vấn, transaction và index cơ bản.',
    objectives: 'Thiết kế schema chuẩn 3NF và viết truy vấn SQL phức tạp (join, subquery, view).',
    learningOutcomes: 'Vẽ ERD; chuẩn hoá tới 3NF; viết stored procedure/trigger đơn giản; tối ưu truy vấn cơ bản.',
    prerequisites: [{ courseCode: 'PRF192', courseName: 'Programming Fundamentals', groupNo: 1, minimumScore: 5 }],
    syllabus: [
      { week: 1, topic: 'Mô hình quan hệ & ERD', content: 'Thực thể, quan hệ, khoá chính/khoá ngoại.' },
      { week: 2, topic: 'SQL cơ bản → nâng cao', content: 'SELECT/JOIN/GROUP BY, subquery, view.' },
      { week: 3, topic: 'Chuẩn hoá & transaction', content: '1NF→3NF, ACID, isolation levels.' },
      { week: 4, topic: 'Thực hành', content: 'Thiết kế DB cho hệ thống bán hàng + báo cáo.' },
    ],
  },
  {
    id: 'lk-c05',
    code: 'DSA204',
    name: 'Data Structures and Algorithms',
    credits: 3,
    category: 'Core',
    description: 'Cấu trúc dữ liệu và thuật toán nền tảng: stack, queue, cây, đồ thị, sắp xếp, tìm kiếm, độ phức tạp.',
    objectives: 'Phân tích Big-O và lựa chọn cấu trúc dữ liệu phù hợp cho từng bài toán.',
    learningOutcomes: 'Cài đặt linked list/tree/graph; phân tích độ phức tạp; giải bài tập dạng phỏng vấn.',
    prerequisites: [
      { courseCode: 'PRF192', courseName: 'Programming Fundamentals', groupNo: 1, minimumScore: 5 },
      { courseCode: 'MAE101', courseName: 'Mathematics for Engineering', groupNo: 2, minimumScore: null },
    ],
    syllabus: [
      { week: 1, topic: 'Big-O & mảng nâng cao', content: 'Phân tích độ phức tạp, two-pointers, sliding window.' },
      { week: 2, topic: 'Stack/Queue/Linked list', content: 'Cài đặt và ứng dụng undo, hàng đợi ưu tiên.' },
      { week: 3, topic: 'Cây & đồ thị', content: 'BST, heap, BFS/DFS, Dijkstra cơ bản.' },
      { week: 4, topic: 'Sắp xếp & tìm kiếm', content: 'Quick/merge sort, binary search, đề thi mẫu.' },
    ],
  },
  {
    id: 'lk-c06',
    code: 'SWE201',
    name: 'Software Engineering',
    credits: 3,
    category: 'Core',
    description: 'Quy trình phát triển phần mềm: Agile/Scrum, yêu cầu, thiết kế UML, kiểm thử và quản lý cấu hình.',
    objectives: 'Làm việc nhóm theo Scrum và phát hành sản phẩm qua các sprint.',
    learningOutcomes: 'Viết user story; vẽ UML; lập kế hoạch sprint; viết test case và báo cáo.',
    prerequisites: [
      { courseCode: 'PRO192', courseName: 'Object-Oriented Programming', groupNo: 1, minimumScore: 5 },
      { courseCode: 'DBI202', courseName: 'Database Systems', groupNo: 1, minimumScore: null },
    ],
    syllabus: [
      { week: 1, topic: 'Agile & yêu cầu', content: 'Scrum roles, user story, backlog, estimation.' },
      { week: 2, topic: 'Thiết kế UML', content: 'Use-case, class, sequence diagram cho project nhóm.' },
      { week: 3, topic: 'Kiểm thử', content: 'Unit/integration test, bug lifecycle, Jira thực hành.' },
      { week: 4, topic: 'Triển khai', content: 'CI cơ bản, demo sprint và retrospective.' },
    ],
  },
  {
    id: 'lk-c07',
    code: 'SWD392',
    name: 'Software Development Project',
    credits: 3,
    category: 'Project',
    description: 'Đồ án xây dựng sản phẩm thực tế theo nhóm: từ ý tưởng, prototype tới triển khai và bảo vệ.',
    objectives: 'Hoàn thành sản phẩm full-stack có tài liệu và demo được trước hội đồng.',
    learningOutcomes: 'Lập kế hoạch dự án; phát triển full-stack; thuyết trình và phản biện kỹ thuật.',
    prerequisites: [{ courseCode: 'SWE201', courseName: 'Software Engineering', groupNo: 1, minimumScore: 5 }],
    syllabus: [
      { week: 1, topic: 'Proposal', content: 'Chốt đề tài, phạm vi MVP, phân công nhóm.' },
      { week: 2, topic: 'Sprint 1-2', content: 'Backend + DB, review giữa kỳ.' },
      { week: 3, topic: 'Sprint 3-4', content: 'Frontend, tích hợp, kiểm thử chấp nhận.' },
      { week: 4, topic: 'Bảo vệ', content: 'Triển khai demo, tài liệu và phản biện.' },
    ],
  },
  {
    id: 'lk-c08',
    code: 'MLN301',
    name: 'Machine Learning',
    credits: 3,
    category: 'Elective',
    description: 'Nhập môn học máy: hồi quy, phân loại, cây quyết định, clustering và đánh giá mô hình với Python.',
    objectives: 'Huấn luyện và đánh giá mô hình ML cơ bản trên dataset thực tế.',
    learningOutcomes: 'Tiền xử lý dữ liệu; dùng scikit-learn; đo accuracy/precision/recall; tránh overfitting.',
    prerequisites: [
      { courseCode: 'DSA204', courseName: 'Data Structures and Algorithms', groupNo: 1, minimumScore: 5 },
      { courseCode: 'MAE101', courseName: 'Mathematics for Engineering', groupNo: 1, minimumScore: 5 },
    ],
    syllabus: [
      { week: 1, topic: 'Tổng quan & dữ liệu', content: 'Pipeline ML, pandas, trực quan hoá dữ liệu.' },
      { week: 2, topic: 'Hồi quy & phân loại', content: 'Linear/logistic regression, kNN, SVM cơ bản.' },
      { week: 3, topic: 'Cây & ensemble', content: 'Decision tree, random forest, cross-validation.' },
      { week: 4, topic: 'Project', content: 'Dự đoán điểm/xếp loại sinh viên từ dữ liệu học tập.' },
    ],
  },
  {
    id: 'lk-c09',
    code: 'OJT401',
    name: 'On-Job Training',
    credits: 4,
    category: 'Internship',
    description: 'Thực tập tại doanh nghiệp 12 tuần: tham gia dự án thật, báo cáo tiến độ và bảo vệ kết quả.',
    objectives: 'Tích lũy kinh nghiệm làm việc thực tế và hoàn thành báo cáo OJT đạt chuẩn.',
    learningOutcomes: 'Làm việc trong team doanh nghiệp; viết báo cáo; thuyết trình kết quả thực tập.',
    prerequisites: [{ courseCode: 'SWD392', courseName: 'Software Development Project', groupNo: 1, minimumScore: 5 }],
    syllabus: [
      { week: 1, topic: 'Onboarding', content: 'Nhận đề tài thực tập, kế hoạch 12 tuần.' },
      { week: 2, topic: 'Triển khai', content: 'Tham gia sprint doanh nghiệp, báo cáo tuần.' },
      { week: 3, topic: 'Báo cáo', content: 'Viết báo cáo OJT chương 1-3, mentor duyệt.' },
      { week: 4, topic: 'Bảo vệ', content: 'Nộp bản final, bảo vệ trước hội đồng.' },
    ],
  },
  {
    id: 'lk-c10',
    code: 'ECO201',
    name: 'Business Administration',
    credits: 3,
    category: 'Elective',
    description: 'Quản trị kinh doanh đại cương cho kỹ sư phần mềm: quản trị, marketing, tài chính và khởi nghiệp.',
    objectives: 'Hiểu vận hành doanh nghiệp và lập kế hoạch kinh doanh cho sản phẩm công nghệ.',
    learningOutcomes: 'Phân tích SWOT; đọc báo cáo tài chính cơ bản; xây dựng business model canvas.',
    prerequisites: [],
    syllabus: [
      { week: 1, topic: 'Tổng quan quản trị', content: 'Chức năng quản trị, cơ cấu tổ chức công ty phần mềm.' },
      { week: 2, topic: 'Marketing & bán hàng', content: 'Segmentation, pricing cho sản phẩm SaaS.' },
      { week: 3, topic: 'Tài chính cơ bản', content: 'P&L, cashflow, hoà vốn.' },
      { week: 4, topic: 'Khởi nghiệp', content: 'Business canvas cho ý tưởng sản phẩm của nhóm.' },
    ],
  },
];

export const mockLookupCurricula: LookupCurriculum[] = [
  {
    id: 'curr-k19-se',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    version: 'K19',
    name: 'Software Engineering · K19',
    totalCredits: 132,
    semesters: [
      { semesterNumber: 1, courses: ['PRF192', 'MAE101'] },
      { semesterNumber: 2, courses: ['PRO192', 'DSA204'] },
      { semesterNumber: 4, courses: ['DBI202'] },
      { semesterNumber: 6, courses: ['SWE201'] },
      { semesterNumber: 7, courses: ['SWD392'] },
      { semesterNumber: 8, courses: ['OJT401'] },
    ],
  },
  {
    id: 'curr-k20-se',
    majorCode: 'SE',
    majorName: 'Software Engineering',
    version: 'K20',
    name: 'Software Engineering · K20',
    totalCredits: 135,
    semesters: [
      { semesterNumber: 1, courses: ['PRF192', 'MAE101', 'ECO201'] },
      { semesterNumber: 2, courses: ['PRO192', 'DSA204'] },
      { semesterNumber: 4, courses: ['DBI202'] },
      { semesterNumber: 6, courses: ['SWE201', 'MLN301'] },
      { semesterNumber: 7, courses: ['SWD392'] },
      { semesterNumber: 8, courses: ['OJT401'] },
    ],
  },
  {
    id: 'curr-k19-ai',
    majorCode: 'AI',
    majorName: 'Artificial Intelligence',
    version: 'K19',
    name: 'Artificial Intelligence · K19',
    totalCredits: 130,
    semesters: [
      { semesterNumber: 1, courses: ['PRF192', 'MAE101'] },
      { semesterNumber: 2, courses: ['DSA204', 'PRO192'] },
      { semesterNumber: 5, courses: ['MLN301', 'DBI202'] },
      { semesterNumber: 8, courses: ['OJT401'] },
    ],
  },
];

export const courseByCode = (code: string): LookupCourse | undefined =>
  mockLookupCourses.find((c) => c.code === code);
