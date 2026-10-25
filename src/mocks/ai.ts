// src/mocks/ai.ts
// Fake data cho khu vực quản trị AI. Tất cả dữ liệu được sinh cục bộ nên không cần backend.
// Bật/tắt bằng biến môi trường VITE_MOCK_AI (mặc định bật) — xem src/mocks/index.ts.

import type {
  AdminPage,
  AiReportDetail,
  AiReportHeader,
  AiReportMessage,
  AiReportSource,
  AiReportStatus,
  AiReportSummary,
} from '../types/admin';
import type {
  AiConfig,
  AiConfigFilterParams,
  AiPerformanceFilterParams,
  AiPerformanceResult,
  AiPreset,
  AiUsageByDay,
  AiUsageSummary,
} from '../types/ai-config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** PRNG ổn định: cùng seed luôn cho cùng kết quả, để UI không nhảy số mỗi lần render. */
const seededRandom = (seed: string) => {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
};

const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const toIso = (date: Date) => date.toISOString();
const ymd = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const daysBetween = (start: Date, end: Date) => {
  const out: Date[] = [];
  let cursor = new Date(start);
  while (cursor <= end) {
    out.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return out;
};

// ---------------------------------------------------------------------------
// AI configurations
// ---------------------------------------------------------------------------

const NOW = new Date('2026-10-26T09:00:00.000Z');

export const mockAiConfigs: AiConfig[] = [
  {
    id: 'cfg-chat-main',
    name: 'Academic Advisor Chat',
    provider: 'GEMINI',
    modelName: 'gemini-2.0-flash',
    purpose: 'CHAT',
    temperature: 0.4,
    maxTokens: 4096,
    retrievalTopK: 6,
    similarityThreshold: 0.72,
    timeoutSeconds: 30,
    dailyRequestLimit: 5000,
    systemPrompt:
      'Bạn là trợ lý học thuật của FAAPS (Học viện Công nghệ FPT). Chỉ trả lời dựa trên dữ liệu chương trình đào tạo được truy xuất. ' +
      'Nếu không đủ thông tin, hãy nói rõ và đề xuất liên hệ Advisor. Trả lời bằng tiếng Việt, ngắn gọn, có trích dẫn nguồn.',
    fallbackMessage: 'Hệ thống đang bận. Vui lòng thử lại sau ít phút hoặc liên hệ Advisor để được hỗ trợ trực tiếp.',
    isActive: true,
    updatedByUserId: 'dev-admin',
    updatedAt: '2026-10-24T02:12:00.000Z',
  },
  {
    id: 'cfg-chat-fast',
    name: 'Quick FAQ Assistant',
    provider: 'GEMINI',
    modelName: 'gemini-2.0-flash-lite',
    purpose: 'CHAT',
    temperature: 0.2,
    maxTokens: 1024,
    retrievalTopK: 3,
    similarityThreshold: 0.81,
    timeoutSeconds: 15,
    dailyRequestLimit: 12000,
    systemPrompt: 'Trả lời nhanh các câu hỏi thủ tục về đăng ký học, học phí, lịch học. Không suy đoán.',
    fallbackMessage: 'Không tìm thấy câu trả lời phù hợp. Vui lòng liên hệ Phòng Đào tạo.',
    isActive: true,
    updatedByUserId: 'dev-admin',
    updatedAt: '2026-10-21T08:40:00.000Z',
  },
  {
    id: 'cfg-embed',
    name: 'Curriculum Embedding',
    provider: 'OTHER',
    modelName: 'text-embedding-004',
    purpose: 'EMBEDDING',
    temperature: 0,
    maxTokens: 1,
    retrievalTopK: 8,
    similarityThreshold: 0.65,
    timeoutSeconds: 20,
    dailyRequestLimit: 20000,
    systemPrompt: null,
    fallbackMessage: 'Không thể tạo vector cho tài liệu này.',
    isActive: true,
    updatedByUserId: 'dev-admin',
    updatedAt: '2026-10-18T03:05:00.000Z',
  },
  {
    id: 'cfg-ocr',
    name: 'Course Material OCR',
    provider: 'GEMINI',
    modelName: 'gemini-2.0-flash',
    purpose: 'OCR',
    temperature: 0.1,
    maxTokens: 8192,
    retrievalTopK: 0,
    similarityThreshold: null,
    timeoutSeconds: 90,
    dailyRequestLimit: 800,
    systemPrompt: 'Trích xuất văn bản từ tài liệu scan, giữ nguyên cấu trúc bảng và công thức.',
    fallbackMessage: 'Tài liệu quá lớn hoặc không đọc được. Vui lòng tải lại bản PDF gốc.',
    isActive: true,
    updatedByUserId: 'dev-admin',
    updatedAt: '2026-10-22T07:25:00.000Z',
  },
  {
    id: 'cfg-chat-legacy',
    name: 'Advisor Bot (legacy v1)',
    provider: 'GEMINI',
    modelName: 'gemini-1.5-flash',
    purpose: 'CHAT',
    temperature: 0.9,
    maxTokens: 2048,
    retrievalTopK: 4,
    similarityThreshold: 0.6,
    timeoutSeconds: 30,
    dailyRequestLimit: 500,
    systemPrompt: 'Trợ lý học thuật phiên bản cũ.',
    fallbackMessage: 'Tính năng đang được bảo trì.',
    isActive: false,
    updatedByUserId: 'dev-admin',
    updatedAt: '2026-09-30T11:00:00.000Z',
  },
  {
    id: 'cfg-recommend',
    name: 'Course Recommendation',
    provider: 'OTHER',
    modelName: 'gemini-2.0-flash',
    purpose: 'CHAT',
    temperature: 0.5,
    maxTokens: 3072,
    retrievalTopK: 10,
    similarityThreshold: 0.7,
    timeoutSeconds: 45,
    dailyRequestLimit: 3000,
    systemPrompt:
      'Gợi ý môn học dựa trên chương trình đào tạo, tiến độ học tập và điều kiện tiên quyết. Luôn nêu rõ mã môn học.',
    fallbackMessage: 'Chưa đủ dữ liệu để gợi ý môn học phù hợp.',
    isActive: true,
    updatedByUserId: 'dev-admin',
    updatedAt: '2026-10-23T06:45:00.000Z',
  },
];

export const mockAiPresets: AiPreset[] = [
  {
    id: 'preset-balanced',
    label: 'Balanced Assistant',
    provider: 'GEMINI',
    modelName: 'gemini-2.0-flash',
    purpose: 'CHAT',
    description: 'Cân bằng giữa độ chính xác và tốc độ — dùng cho chatbot tư vấn chính.',
    config: {
      temperature: 0.4,
      maxTokens: 4096,
      retrievalTopK: 6,
      similarityThreshold: 0.72,
      timeoutSeconds: 30,
      dailyRequestLimit: 5000,
      systemPrompt:
        'Bạn là trợ lý học thuật của FAAPS. Chỉ trả lời dựa trên dữ liệu chương trình đào tạo được truy xuất và luôn trích dẫn nguồn.',
      fallbackMessage: 'Hệ thống đang bận. Vui lòng thử lại sau ít phút.',
    },
  },
  {
    id: 'preset-fast',
    label: 'Fast & Cheap',
    provider: 'GEMINI',
    modelName: 'gemini-2.0-flash-lite',
    purpose: 'CHAT',
    description: 'Tốc độ cao, chi phí thấp — dành cho câu hỏi thủ tục, FAQ.',
    config: {
      temperature: 0.2,
      maxTokens: 1024,
      retrievalTopK: 3,
      similarityThreshold: 0.81,
      timeoutSeconds: 15,
      dailyRequestLimit: 12000,
      systemPrompt: 'Trả lời nhanh, chính xác các câu hỏi thủ tục. Không suy đoán.',
      fallbackMessage: 'Không tìm thấy câu trả lời phù hợp.',
    },
  },
  {
    id: 'preset-precise',
    label: 'Precise / Strict RAG',
    provider: 'OTHER',
    modelName: 'gemini-2.0-flash',
    purpose: 'CHAT',
    description: 'Ngưỡng truy xuất cao, ưu tiên độ đúng — dùng cho tư vấn học phần bắt buộc.',
    config: {
      temperature: 0.1,
      maxTokens: 6144,
      retrievalTopK: 12,
      similarityThreshold: 0.85,
      timeoutSeconds: 60,
      dailyRequestLimit: 2500,
      systemPrompt:
        'Chỉ trả lời khi độ tin cậy nguồn trích xuất trên 0.85. Nếu không đủ, trả lời "Tôi chưa có đủ thông tin".',
      fallbackMessage: 'Không tìm thấy dữ liệu đáng tin cậy để trả lời.',
    },
  },
  {
    id: 'preset-embedding',
    label: 'Embedding (RAG index)',
    provider: 'OTHER',
    modelName: 'text-embedding-004',
    purpose: 'EMBEDDING',
    description: 'Cấu hình mặc định để tạo và lập chỉ mục vector cho tài liệu.',
    config: {
      temperature: 0,
      maxTokens: 1,
      retrievalTopK: 8,
      similarityThreshold: 0.65,
      timeoutSeconds: 20,
      dailyRequestLimit: 20000,
      systemPrompt: null,
      fallbackMessage: 'Không thể tạo vector cho tài liệu này.',
    },
  },
];

// ---------------------------------------------------------------------------
// AI performance
// ---------------------------------------------------------------------------

const buildSummary = (): AiUsageSummary[] =>
  mockAiConfigs.map((cfg) => {
    const rand = seededRandom(`summary-${cfg.id}`);
    const totalRequests = Math.round(800 + rand() * 5200);
    const failedRequests = Math.round(totalRequests * (0.01 + rand() * 0.06));
    const fallbackRequests = Math.round(failedRequests * (0.2 + rand() * 0.5));
    const successRequests = totalRequests - failedRequests;
    const totalPromptTokens = totalRequests * Math.round(400 + rand() * 900);
    const totalCompletionTokens = totalRequests * Math.round(120 + rand() * 380);
    return {
      configId: cfg.id,
      configName: cfg.name,
      purpose: cfg.purpose,
      totalRequests,
      successRequests,
      failedRequests,
      fallbackRequests,
      averageLatencyMs: Math.round(420 + rand() * 1800),
      totalPromptTokens,
      totalCompletionTokens,
    };
  });

const buildByDay = (start: Date, end: Date): AiUsageByDay[] => {
  const days = daysBetween(start, end);
  const weekdayFactor = (date: Date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) return 0.35; // cuối tuần ít traffic
    if (day === 1) return 1.25; // thứ hai bùng nổ
    return 1;
  };
  return days.map((date) => {
    const key = ymd(date);
    const rand = seededRandom(`day-${key}`);
    const base = 180 + rand() * 420;
    const requests = Math.round(base * weekdayFactor(date));
    const failed = Math.round(requests * (0.01 + rand() * 0.05));
    return {
      date: key,
      requests,
      failed,
      averageLatencyMs: Math.round(520 + rand() * 1500),
      promptTokens: requests * Math.round(420 + rand() * 700),
      completionTokens: requests * Math.round(120 + rand() * 320),
    };
  });
};

export const mockAiPerformance = (params: AiPerformanceFilterParams = {}): AiPerformanceResult => {
  const end = params.endDate ? new Date(`${params.endDate}T23:59:59.000Z`) : NOW;
  const start = params.startDate ? new Date(`${params.startDate}T00:00:00.000Z`) : addDays(end, -29);
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;

  let summary = buildSummary();
  if (params.purpose && params.purpose !== 'ALL') {
    summary = summary.filter((s) => s.purpose === params.purpose);
  }
  if (params.configId) {
    summary = summary.filter((s) => s.configId === params.configId);
  }

  return { summary, byDay: buildByDay(from, to) };
};

// ---------------------------------------------------------------------------
// AI reports (reported AI responses)
// ---------------------------------------------------------------------------

const STUDENTS = [
  { code: 'SE140021', name: 'Nguyễn Minh Anh' },
  { code: 'SE140118', name: 'Trần Quốc Bảo' },
  { code: 'SE140207', name: 'Lê Thu Hà' },
  { code: 'SE140265', name: 'Phạm Gia Huy' },
  { code: 'SE140312', name: 'Võ Ngọc Linh' },
  { code: 'SE140356', name: 'Đặng Hoài Nam' },
  { code: 'SE140401', name: 'Bùi Khánh Phúc' },
  { code: 'SE140455', name: 'Hoàng Mai Phương' },
  { code: 'SE140508', name: 'Đỗ Trung Sơn' },
  { code: 'SE140562', name: 'Ngô Thị Thanh' },
  { code: 'SE140617', name: 'Dương Văn Việt' },
  { code: 'SE140673', name: 'Lý Hoàng Yến' },
  { code: 'SE140729', name: 'Trịnh Đức Anh' },
  { code: 'SE140784', name: 'Phan Ngọc Yến' },
  { code: 'SE140839', name: 'Vũ Thanh Phong' },
  { code: 'SE140895', name: 'Tạ Thu Trang' },
  { code: 'SE140951', name: 'Cao Văn Việt' },
  { code: 'SE141006', name: 'Đinh Thị Hồng' },
];

const REASONS = [
  'HALLUCINATION',
  'OUTDATED_CURRICULUM',
  'IRRELEVANT_ANSWER',
  'INCOMPLETE_INFORMATION',
  'WRONG_COURSE_CODE',
  'MISSING_SOURCE',
  'POLICY_MISREAD',
  'HALLUCINATION',
  'OUTDATED_CURRICULUM',
  'IRRELEVANT_ANSWER',
];

const RESOLUTION_NOTES = [
  'Đã cập nhật lại tài liệu chương trình đào tạo mới nhất và rebuild chỉ mục vector. Bot trả lời đúng từ hôm nay.',
  'Đã hạ ngưỡng similarity threshold xuống 0.7 và tăng top-K lên 8. Câu hỏi đã ra đúng nguồn.',
  'Đã sửa system prompt để bắt buộc trích dẫn mã môn học và từ chối trả lời khi thiếu dữ liệu.',
  'Cấu hình nhầm giữa hai nhánh chương trình. Đã chỉ đúng model và kiểm thử lại 20 câu hỏi mẫu.',
];

const conversationFor = (student: string, topic: string) => [
  { sender: 'STUDENT', content: `Em chào, em muốn hỏi về ${topic}.` },
  {
    sender: 'ASSISTANT',
    content:
      `Chào ${student}, về ${topic} thì bạn cần đăng ký môn học có mã tương ứng trong chương trình đào tạo. ` +
      `Tuy nhiên dữ liệu tôi tra cứu được chưa khớp với biểu mẫu đăng ký hiện tại nên tôi chưa chắc chắn về mã môn.`,
  },
  { sender: 'STUDENT', content: 'Vậy mã môn chính xác là gì vậy? Em cần nộp bài tập lớn tuần này.' },
  {
    sender: 'ASSISTANT',
    content: 'Mình không tìm thấy mã môn phù hợp trong kho dữ liệu hiện tại, nhưng mình nhớ là có mã tương tự trong học kỳ trước.',
  },
  { sender: 'STUDENT', content: 'Cho mình mã đó đi, em sẽ tự kiểm tra lại.' },
  {
    sender: 'ASSISTANT',
    content: 'Mình gợi ý mã IT001-EXE nhé. Nếu sai bạn thử tra cứu mục lục học phần giống tên.',
  },
];

const buildReport = (index: number, status: AiReportStatus): AiReportSummary => {
  const rand = seededRandom(`report-${index}`);
  const student = STUDENTS[index % STUDENTS.length];
  const reason = REASONS[index % REASONS.length];
  const daysAgo = Math.floor(rand() * 45);
  const createdAt = new Date(NOW.getTime() - daysAgo * 86_400_000 - Math.floor(rand() * 10) * 3_600_000);
  return {
    id: `rpt-${String(index + 1).padStart(4, '0')}`,
    conversationId: `cnv-${String(index + 1).padStart(4, '0')}-${Math.floor(rand() * 9000 + 1000)}`,
    studentId: `usr-${String(index + 1).padStart(4, '0')}`,
    studentName: student.name,
    studentCode: student.code,
    reason,
    status,
    flaggedCount: 1 + Math.floor(rand() * 3),
    createdAt: toIso(createdAt),
  };
};

/** Store in-memory để thao tác resolve/dismiss thật sự đổi trạng thái trong lúc demo. */
const createReportStore = (): AiReportSummary[] => {
  const out: AiReportSummary[] = [];
  const total = 46;
  for (let i = 0; i < total; i += 1) {
    const rand = seededRandom(`status-${i}`);
    const roll = rand();
    const status: AiReportStatus = roll < 0.42 ? 'PENDING' : roll < 0.78 ? 'RESOLVED' : 'DISMISSED';
    out.push(buildReport(i, status));
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

let reportStore: AiReportSummary[] = createReportStore();

export const mockAiReports = (params: {
  status?: AiReportStatus;
  search?: string;
  page?: number;
  size?: number;
}): AdminPage<AiReportSummary> => {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const search = params.search?.trim().toLowerCase();

  let rows = [...reportStore];
  if (params.status) rows = rows.filter((r) => r.status === params.status);
  if (search) {
    rows = rows.filter(
      (r) =>
        r.id.toLowerCase().includes(search) ||
        (r.studentCode ?? '').toLowerCase().includes(search) ||
        r.studentName.toLowerCase().includes(search) ||
        r.reason.toLowerCase().includes(search),
    );
  }

  const totalElements = rows.length;
  const start = page * size;
  return {
    items: rows.slice(start, start + size),
    page,
    size,
    totalElements,
    totalPages: Math.max(1, Math.ceil(totalElements / size)),
  };
};

const buildMessages = (report: AiReportSummary): AiReportMessage[] => {
  const topics = [
    'môn học bắt buộc của học kỳ 5',
    'quy trình đăng ký học phần',
    'hạn nộp bài tập lớn',
    'mã môn học trong chương trình',
  ];
  const topic = topics[report.studentCode ? Number(report.studentCode.slice(-3)) % topics.length : 0];
  const base = conversationFor(report.studentName, topic);
  const rand = seededRandom(`msg-${report.id}`);
  return base.map((m, i) => ({
    id: `${report.id}-msg-${i + 1}`,
    sender: m.sender,
    content: m.content,
    createdAt: toIso(new Date(new Date(report.createdAt).getTime() + i * 95_000)),
    reported: m.sender === 'ASSISTANT' && i >= 3,
    studentNote:
      m.sender === 'ASSISTANT' && i >= 3
        ? 'Mã môn này không tồn tại, học kỳ này môn bắt buộc khác tên.'
        : null,
  })).filter((m) => m.reported || rand() > 0.35);
};

const buildSources = (report: AiReportSummary): AiReportSource[] => {
  const messages = buildMessages(report);
  const flagged = messages.filter((m) => m.reported);
  const rand = seededRandom(`src-${report.id}`);
  return flagged.flatMap((message, idx) => [
    {
      messageId: message.id,
      relevanceScore: round(0.62 + rand() * 0.3, 2),
      quotedText:
        'Môn học bắt buộc chuyên ngành được quy định trong chương trình đào tạo hiện hành, giá 3 tín chỉ.',
      rankPosition: idx + 1,
      sectionTitle: 'Chương trình đào tạo / Học kỳ 5',
      documentTitle: 'CTĐT_SE-2024-v3.pdf',
    },
    {
      messageId: message.id,
      relevanceScore: round(0.41 + rand() * 0.2, 2),
      quotedText: 'Sinh viên tự chịu trách nhiệm đăng ký học phần trong hạn 3 tuần đầu mỗi học kỳ.',
      rankPosition: idx + 2,
      sectionTitle: 'Quy định đăng ký học phần',
      documentTitle: 'Quy chế học tập 2025.pdf',
    },
  ]);
};

export const mockAiReportDetail = (id: string): AiReportDetail | null => {
  const report = reportStore.find((r) => r.id === id);
  if (!report) return null;
  const rand = seededRandom(`detail-${id}`);
  const resolved = report.status !== 'PENDING';
  const header: AiReportHeader = {
    id: report.id,
    conversationId: report.conversationId,
    studentId: report.studentId,
    studentName: report.studentName,
    studentCode: report.studentCode,
    reason: report.reason,
    studentNote:
      'Mình hỏi về môn bắt buộc nhưng bot đưa ra mã môn không tồn tại, làm mình mất cả buổi tìm hiểu.',
    status: report.status,
    resolutionNote: resolved ? RESOLUTION_NOTES[Math.floor(rand() * RESOLUTION_NOTES.length)] : null,
    resolvedAt: resolved ? toIso(new Date(new Date(report.createdAt).getTime() + 86_400_000 * 2)) : null,
    createdAt: report.createdAt,
  };
  return { report: header, messages: buildMessages(report), sources: buildSources(report) };
};

export const mockResolveAiReport = (id: string, status: 'RESOLVED' | 'DISMISSED', note: string): AiReportDetail | null => {
  const report = reportStore.find((r) => r.id === id);
  if (!report) return null;
  report.status = status;
  const detail = mockAiReportDetail(id);
  if (detail) {
    detail.report.status = status;
    detail.report.resolutionNote = note;
    detail.report.resolvedAt = toIso(NOW);
  }
  return detail;
};

export const mockResetAiReports = () => {
  reportStore = createReportStore();
};
