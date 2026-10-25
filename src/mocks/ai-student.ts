// src/mocks/ai-student.ts
// Fake data cho Sprint 3: Chat AI + Lộ trình học (Roadmap) phía sinh viên.
// Bật/tắt bằng scope "portal" (VITE_MOCK_PORTAL) — xem src/mocks/index.ts.
//
// State giữ trong module để gửi tin nhắn / tạo hội thoại / sinh roadmap
// có hiệu lực thật trong phiên trình duyệt, giống cách advising.ts giữ mockRequests.

import type {
  AiChatMessage,
  AiChatSource,
  AiConversation,
  CreateAiConversationDto,
  GenerateRoadmapDto,
  SendAiMessageDto,
  SendAiMessageResult,
  StudyRoadmap,
} from '../types/ai-student';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Ngày giờ cố định để dữ liệu demo ổn định giữa các lần render. */
const NOW = new Date('2026-10-26T09:00:00.000Z');

const minutesAgo = (minutes: number) => {
  const d = new Date(NOW);
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
};

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

// ---------------------------------------------------------------------------
// Hội thoại + tin nhắn demo
// ---------------------------------------------------------------------------

const seedSources = (messageId: string): AiChatSource[] => {
  void messageId;
  return [
    {
      chunkId: 'chunk-ctdt-k19-042',
      documentTitle: 'CTĐT_SE_K19_2024.pdf',
      sectionTitle: 'Chương trình đào tạo / Học kỳ 6',
      quotedText:
        'Sinh viên học kỳ 6 ngành SE học các môn bắt buộc: PRJ301, SWP391, SWT301 và 1 môn tự chọn chuyên ngành.',
      relevanceScore: 0.87,
      rankPosition: 1,
    },
    {
      chunkId: 'chunk-qcdt-011',
      documentTitle: 'Quy chế học tập 2025.pdf',
      sectionTitle: 'Đăng ký học phần',
      quotedText:
        'Mỗi học kỳ sinh viên đăng ký tối thiểu 12 tín chỉ và tối đa 24 tín chỉ, trừ kỳ tốt nghiệp.',
      relevanceScore: 0.74,
      rankPosition: 2,
    },
  ];
};

let conversationSeq = 3;

const mockConversations: AiConversation[] = [
  {
    id: 'aic-001',
    userId: 'stu-001',
    title: 'Lộ trình học kỳ 7 - 8',
    status: 'ACTIVE',
    messageCount: 4,
    lastMessageAt: minutesAgo(26),
    createdAt: minutesAgo(60 * 26),
  },
  {
    id: 'aic-002',
    userId: 'stu-001',
    title: 'Điều kiện tiên quyết môn PRJ301',
    status: 'ACTIVE',
    messageCount: 2,
    lastMessageAt: minutesAgo(60 * 30),
    createdAt: minutesAgo(60 * 31),
  },
  {
    id: 'aic-003',
    userId: 'stu-001',
    title: 'Kiểm tra điều kiện tốt nghiệp',
    status: 'CLOSED',
    messageCount: 2,
    lastMessageAt: minutesAgo(60 * 50),
    createdAt: minutesAgo(60 * 52),
  },
];

const mockMessages: Record<string, AiChatMessage[]> = {
  'aic-001': [
    {
      id: 'aic-001-m1',
      conversationId: 'aic-001',
      sender: 'USER',
      content: 'Em đang học kỳ 6 ngành SE, GPA 8.35. Nhờ AI gợi ý lộ trình 2 kỳ tới để ra trường đúng hạn.',
      questionCategory: 'STUDY_PLAN',
      isUnsupported: false,
      isFallback: false,
      confidenceScore: null,
      aiConfigurationId: null,
      sources: [],
      wasHelpful: null,
      feedback: null,
      createdAt: minutesAgo(60 * 26),
    },
    {
      id: 'aic-001-m2',
      conversationId: 'aic-001',
      sender: 'ASSISTANT',
      content:
        'Với GPA 8.35 và 96 tín chỉ đã tích lũy, bạn đang đúng tiến độ. Mình gợi ý học kỳ 7 tập trung vào PRJ301 + 2 môn chuyên ngành, học kỳ 8 làm đồ án tốt nghiệp.\n\nBạn mở tab "Lộ trình học" để xem timeline chi tiết từng môn, tín chỉ và môn tiên quyết nhé.',
      questionCategory: 'STUDY_PLAN',
      isUnsupported: false,
      isFallback: false,
      confidenceScore: 0.91,
      aiConfigurationId: 'cfg-chat-main',
      sources: seedSources('aic-001-m2'),
      wasHelpful: true,
      feedback: null,
      createdAt: minutesAgo(60 * 26 - 1),
    },
    {
      id: 'aic-001-m3',
      conversationId: 'aic-001',
      sender: 'USER',
      content: 'Học kỳ 7 em học tối đa bao nhiêu tín chỉ?',
      questionCategory: 'POLICY',
      isUnsupported: false,
      isFallback: false,
      confidenceScore: null,
      aiConfigurationId: null,
      sources: [],
      wasHelpful: null,
      feedback: null,
      createdAt: minutesAgo(28),
    },
    {
      id: 'aic-001-m4',
      conversationId: 'aic-001',
      sender: 'ASSISTANT',
      content:
        'Theo Quy chế học tập 2025, mỗi học kỳ bạn đăng ký tối đa 24 tín chỉ (trừ kỳ tốt nghiệp). Với sức học hiện tại, mình khuyên bạn đăng ký 18 - 21 tín chỉ ở kỳ 7 để giữ GPA trên 8.0.',
      questionCategory: 'POLICY',
      isUnsupported: false,
      isFallback: false,
      confidenceScore: 0.88,
      aiConfigurationId: 'cfg-chat-main',
      sources: seedSources('aic-001-m4'),
      wasHelpful: null,
      feedback: null,
      createdAt: minutesAgo(26),
    },
  ],
  'aic-002': [
    {
      id: 'aic-002-m1',
      conversationId: 'aic-002',
      sender: 'USER',
      content: 'Môn PRJ301 có môn tiên quyết là gì?',
      questionCategory: 'COURSE_INFO',
      isUnsupported: false,
      isFallback: false,
      confidenceScore: null,
      aiConfigurationId: null,
      sources: [],
      wasHelpful: null,
      feedback: null,
      createdAt: minutesAgo(60 * 31),
    },
    {
      id: 'aic-002-m2',
      conversationId: 'aic-002',
      sender: 'ASSISTANT',
      content:
        'Môn PRJ301 (Java Web Application Development, 3 tín chỉ) yêu cầu bạn đã qua PRJ301... à xin lỗi, theo CTĐT K19 thì tiên quyết là PRO192 (Lập trình Java) và DBI202 (Cơ sở dữ liệu). Bạn đã qua cả hai môn này nên đủ điều kiện đăng ký.',
      questionCategory: 'COURSE_INFO',
      isUnsupported: false,
      isFallback: false,
      confidenceScore: 0.83,
      aiConfigurationId: 'cfg-chat-main',
      sources: seedSources('aic-002-m2'),
      wasHelpful: null,
      feedback: null,
      createdAt: minutesAgo(60 * 30),
    },
  ],
  'aic-003': [
    {
      id: 'aic-003-m1',
      conversationId: 'aic-003',
      sender: 'USER',
      content: 'Bao giờ thì trường tổ chức thi Olympic Tin học?',
      questionCategory: 'UNSUPPORTED',
      isUnsupported: true,
      isFallback: false,
      confidenceScore: null,
      aiConfigurationId: null,
      sources: [],
      wasHelpful: null,
      feedback: null,
      createdAt: minutesAgo(60 * 52),
    },
    {
      id: 'aic-003-m2',
      conversationId: 'aic-003',
      sender: 'ASSISTANT',
      content:
        'Câu hỏi này nằm ngoài phạm vi hỗ trợ của mình (chương trình đào tạo, môn học, lộ trình và điều kiện tốt nghiệp). Bạn vui lòng liên hệ Phòng Đào tạo hoặc cố vấn để được hỗ trợ nhé.',
      questionCategory: 'UNSUPPORTED',
      isUnsupported: true,
      isFallback: false,
      confidenceScore: null,
      aiConfigurationId: 'cfg-chat-main',
      sources: [],
      wasHelpful: null,
      feedback: null,
      createdAt: minutesAgo(60 * 50),
    },
  ],
};

// ---------------------------------------------------------------------------
// Roadmap demo — JSON cấu trúc mà backend sẽ trả về
// ---------------------------------------------------------------------------

let cachedRoadmap: StudyRoadmap | null = null;

const buildDefaultRoadmap = (): StudyRoadmap => ({
  id: 'roadmap-k19-se-001',
  studentId: 'stu-001',
  title: 'Lộ trình tốt nghiệp đúng hạn — SE K19 (GPA 8.35)',
  summary:
    'Lộ trình 3 kỳ còn lại (HK6 → HK8) giúp bạn hoàn thành 30 tín chỉ còn thiếu, giữ GPA trên 8.0 và đủ điều kiện làm đồ án tốt nghiệp. Ưu tiên môn bắt buộc trước, môn tự chọn xếp theo sở trường lập trình web.',
  generatedAt: minutesAgo(25),
  modelName: 'gemini-2.0-flash',
  confidenceScore: 0.9,
  totalSemesters: 4,
  totalCredits: 72,
  semesters: [
    {
      semesterNumber: 5,
      semesterCode: 'SP2026',
      title: 'Học kỳ 5 — Đã hoàn thành',
      totalCredits: 21,
      status: 'COMPLETED',
      note: 'Hoàn thành 21/21 tín chỉ, GPA kỳ 8.42.',
      courses: [
        {
          courseId: 'c-pro192',
          courseCode: 'PRO192',
          courseName: 'Lập trình Java',
          credits: 3,
          categoryName: 'Chuyên ngành',
          isMandatory: true,
          priority: 'HIGH',
          status: 'PASSED',
          reason: 'Môn nền tảng, tiên quyết của PRJ301.',
          prerequisites: [],
        },
        {
          courseId: 'c-dbi202',
          courseCode: 'DBI202',
          courseName: 'Cơ sở dữ liệu',
          credits: 3,
          categoryName: 'Chuyên ngành',
          isMandatory: true,
          priority: 'HIGH',
          status: 'PASSED',
          reason: 'Tiên quyết của PRJ301 và SWP391.',
          prerequisites: [],
        },
        {
          courseId: 'c-iae101',
          courseCode: 'IAE101',
          courseName: 'Nhập môn Kỹ thuật phần mềm',
          credits: 3,
          categoryName: 'Đại cương ngành',
          isMandatory: true,
          priority: 'MEDIUM',
          status: 'PASSED',
          reason: 'Hoàn thành khối kiến thức nền.',
          prerequisites: [],
        },
      ],
    },
    {
      semesterNumber: 6,
      semesterCode: 'SU2026',
      title: 'Học kỳ 6 — Đang học',
      totalCredits: 18,
      status: 'IN_PROGRESS',
      note: 'Đang học 18 tín chỉ, cần giữ tiến độ để qua PRJ301.',
      courses: [
        {
          courseId: 'c-prj301',
          courseCode: 'PRJ301',
          courseName: 'Java Web Application Development',
          credits: 3,
          categoryName: 'Chuyên ngành',
          isMandatory: true,
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          reason: 'Môn lõi của kỳ 6, mở đường cho SWP391.',
          prerequisites: ['PRO192', 'DBI202'],
        },
        {
          courseId: 'c-swt301',
          courseCode: 'SWT301',
          courseName: 'Kiểm thử phần mềm',
          credits: 3,
          categoryName: 'Chuyên ngành',
          isMandatory: true,
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          reason: 'Bắt buộc theo CTĐT K19.',
          prerequisites: ['IAE101'],
        },
        {
          courseId: 'c-swr302',
          courseCode: 'SWR302',
          courseName: 'Yêu cầu phần mềm',
          credits: 3,
          categoryName: 'Chuyên ngành',
          isMandatory: true,
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          reason: 'Hỗ trợ trực tiếp cho đồ án SWP391.',
          prerequisites: [],
        },
        {
          courseId: 'c-mln122',
          courseCode: 'MLN122',
          courseName: 'Triết học Mác - Lênin 2',
          credits: 2,
          categoryName: 'Lý luận chính trị',
          isMandatory: true,
          priority: 'LOW',
          status: 'IN_PROGRESS',
          reason: 'Môn lý luận còn thiếu trong khối tốt nghiệp.',
          prerequisites: [],
        },
      ],
    },
    {
      semesterNumber: 7,
      semesterCode: 'FA2026',
      title: 'Học kỳ 7 — Kế hoạch đề xuất',
      totalCredits: 20,
      status: 'PLANNED',
      note: 'AI đề xuất 20 tín chỉ: chốt nhóm môn chuyên sâu web + 1 môn tự chọn.',
      courses: [
        {
          courseId: 'c-swp391',
          courseCode: 'SWP391',
          courseName: 'Đồ án môn học (Software Project)',
          credits: 5,
          categoryName: 'Đồ án',
          isMandatory: true,
          priority: 'HIGH',
          status: 'PLANNED',
          reason: 'Môn đồ án quan trọng nhất, cần team 4-5 bạn và GPA nhóm trên 7.5.',
          prerequisites: ['PRJ301', 'SWR302'],
        },
        {
          courseId: 'c-swd392',
          courseCode: 'SWD392',
          courseName: 'Thiết kế kiến trúc phần mềm',
          credits: 3,
          categoryName: 'Chuyên ngành',
          isMandatory: true,
          priority: 'HIGH',
          status: 'PLANNED',
          reason: 'Bắt buộc, học song song với SWP391 rất hiệu quả.',
          prerequisites: ['SWR302'],
        },
        {
          courseId: 'c-dat601m',
          courseCode: 'DAT601m',
          courseName: 'Khai phá dữ liệu (tự chọn)',
          credits: 3,
          categoryName: 'Tự chọn chuyên ngành',
          isMandatory: false,
          priority: 'MEDIUM',
          status: 'SUGGESTED',
          reason: 'Phù hợp với sở trường của bạn, nhẹ đồ án lý thuyết.',
          prerequisites: ['DBI202'],
        },
        {
          courseId: 'c-enm301m',
          courseCode: 'ENM301m',
          courseName: 'Tiếng Anh chuyên ngành 3',
          credits: 3,
          categoryName: 'Ngoại ngữ',
          isMandatory: false,
          priority: 'LOW',
          status: 'SUGGESTED',
          reason: 'Chuẩn đầu ra tiếng Anh trước khi xét tốt nghiệp.',
          prerequisites: [],
        },
      ],
    },
    {
      semesterNumber: 8,
      semesterCode: null,
      title: 'Học kỳ 8 — Đồ án tốt nghiệp',
      totalCredits: 13,
      status: 'SUGGESTED',
      note: 'Kỳ cuối chỉ còn đồ án tốt nghiệp + 1 môn tự chọn nhẹ để giữ GPA.',
      courses: [
        {
          courseId: 'c-capstone',
          courseCode: 'CAPSTONE',
          courseName: 'Đồ án tốt nghiệp',
          credits: 10,
          categoryName: 'Tốt nghiệp',
          isMandatory: true,
          priority: 'HIGH',
          status: 'SUGGESTED',
          reason: 'Điều kiện: tích lũy tối thiểu 108 tín chỉ và qua SWP391.',
          prerequisites: ['SWP391'],
        },
        {
          courseId: 'c-iot102',
          courseCode: 'IOT102',
          courseName: 'Nhập môn IoT (tự chọn)',
          credits: 3,
          categoryName: 'Tự chọn',
          isMandatory: false,
          priority: 'LOW',
          status: 'SUGGESTED',
          reason: 'Môn nhẹ, giúp giữ tải kỳ cuối dưới 15 tín chỉ.',
          prerequisites: [],
        },
      ],
    },
  ],
});

const getRoadmap = (): StudyRoadmap => {
  if (!cachedRoadmap) cachedRoadmap = buildDefaultRoadmap();
  return cachedRoadmap;
};

// Sinh câu trả lời giả lập theo từ khóa — đủ để demo khung chat.
const craftAssistantReply = (conversationId: string, content: string): AiChatMessage => {
  const rand = seededRandom(`${conversationId}-${content.length}-${content.slice(0, 8)}`);
  const text = content.toLowerCase();
  let body =
    'Mình đã tra cứu CTĐT K19 và Quy chế học tập 2025. Với tiến độ hiện tại (GPA 8.35, 96 tín chỉ), bạn nên ưu tiên môn bắt buộc của kỳ 6 trước rồi mới đăng ký thêm môn tự chọn. Bạn có thể hỏi mình về môn tiên quyết, số tín chỉ tối đa hoặc nhờ sinh lại lộ trình nhé.';
  let category: AiChatMessage['questionCategory'] = 'OTHER';

  if (text.includes('lộ trình') || text.includes('roadmap') || text.includes('kế hoạch')) {
    category = 'STUDY_PLAN';
    body =
      'Mình vừa rà lại lộ trình của bạn: kỳ 7 nên chốt SWP391 + SWD392 (8 tín chỉ lõi), cộng 1 môn tự chọn DAT601m và tiếng Anh chuyên ngành là vừa sức (tổng ~20 tín chỉ). Sang kỳ 8 chỉ còn đồ án tốt nghiệp 10 tín chỉ + 1 môn nhẹ. Bạn mở tab "Lộ trình học" để xem timeline đồ họa chi tiết nhé.';
  } else if (text.includes('tiên quyết') || text.includes('prj') || text.includes('môn')) {
    category = 'COURSE_INFO';
    body =
      'Theo CTĐT K19, PRJ301 yêu cầu qua PRO192 và DBI202; SWP391 yêu cầu qua PRJ301 và SWR302. Bạn đã qua PRO192/DBI202 nên đủ điều kiện học PRJ301 ở kỳ này. Nếu GPA kỳ dưới 5.0 thì nên giảm tải còn 12-15 tín chỉ.';
  } else if (text.includes('tốt nghiệp') || text.includes('điều kiện') || text.includes('gpa')) {
    category = 'GRADUATION';
    body =
      'Điều kiện tốt nghiệp SE K19: tích lũy đủ 120 tín chỉ, GPA tích lũy >= 5.0, hoàn thành đồ án tốt nghiệp và chuẩn tiếng Anh. Bạn đang có 96 tín chỉ + GPA 8.35 nên chỉ còn ~30 tín chỉ nữa là đủ. Cố gắng giữ GPA kỳ 7 trên 7.5 nhé.';
  } else if (text.includes('tín chỉ') || text.includes('đăng ký') || text.includes('quy chế')) {
    category = 'POLICY';
    body =
      'Quy chế 2025: mỗi kỳ đăng ký 12 - 24 tín chỉ (trừ kỳ tốt nghiệp). Học phí tính theo tín chỉ đăng ký, hủy môn sau tuần 3 không được hoàn phí. Bạn nên chốt thời khóa biểu trước hạn 12/11/2026.';
  }

  return {
    id: `msg-local-${Date.now()}`,
    conversationId,
    sender: 'ASSISTANT',
    content: body,
    questionCategory: category,
    isUnsupported: false,
    isFallback: false,
    confidenceScore: Math.round((0.78 + rand() * 0.15) * 100) / 100,
    aiConfigurationId: 'cfg-chat-main',
    sources: seedSources(`local-${Date.now()}`),
    wasHelpful: null,
    feedback: null,
    createdAt: new Date().toISOString(),
  };
};

// ---------------------------------------------------------------------------
// API giả
// ---------------------------------------------------------------------------

export const mockListConversations = (): AiConversation[] =>
  [...mockConversations].sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''));

export const mockCreateConversation = (body: CreateAiConversationDto = {}): AiConversation => {
  conversationSeq += 1;
  const now = new Date().toISOString();
  const created: AiConversation = {
    id: `aic-local-${Date.now()}`,
    userId: 'stu-001',
    title: body.title?.trim() || `Hội thoại ${conversationSeq}`,
    status: 'ACTIVE',
    messageCount: 0,
    lastMessageAt: now,
    createdAt: now,
  };
  mockConversations.unshift(created);
  mockMessages[created.id] = [];
  return { ...created };
};

export const mockGetMessages = (conversationId: string): AiChatMessage[] =>
  (mockMessages[conversationId] ?? []).map((m) => ({ ...m, sources: [...m.sources] }));

export const mockSendMessage = (conversationId: string, body: SendAiMessageDto): SendAiMessageResult => {
  const now = new Date().toISOString();
  const trimmed = body.content.trim();
  const userMessage: AiChatMessage = {
    id: `msg-local-${Date.now()}-u`,
    conversationId,
    sender: 'USER',
    content: trimmed,
    questionCategory: null,
    isUnsupported: false,
    isFallback: false,
    confidenceScore: null,
    aiConfigurationId: null,
    sources: [],
    wasHelpful: null,
    feedback: null,
    createdAt: now,
  };
  const assistantMessage = craftAssistantReply(conversationId, trimmed);
  const rows = mockMessages[conversationId] ?? (mockMessages[conversationId] = []);
  rows.push(userMessage, assistantMessage);

  const conv = mockConversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessageAt = assistantMessage.createdAt;
    conv.messageCount = rows.length;
    if (conv.title?.startsWith('Hội thoại') && rows.length <= 2) {
      conv.title = trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed;
    }
  }
  return { userMessage: { ...userMessage }, assistantMessage: { ...assistantMessage } };
};

export const mockSendFeedback = (
  messageId: string,
  body: { wasHelpful: boolean; feedback?: string },
): { updated: boolean } => {
  for (const rows of Object.values(mockMessages)) {
    const found = rows.find((m) => m.id === messageId);
    if (found) {
      found.wasHelpful = body.wasHelpful;
      found.feedback = body.feedback?.trim() || null;
      return { updated: true };
    }
  }
  return { updated: false };
};

export const mockGetRoadmap = (): StudyRoadmap | null => ({ ...getRoadmap(), semesters: getRoadmap().semesters.map((s) => ({ ...s, courses: s.courses.map((c) => ({ ...c, prerequisites: [...c.prerequisites] })) })) });

export const mockGenerateRoadmap = (body: GenerateRoadmapDto = {}): StudyRoadmap => {
  const base = buildDefaultRoadmap();
  const now = new Date().toISOString();
  // Cá nhân hóa nhẹ theo mục tiêu sinh viên nhập — đủ để demo khung sinh roadmap.
  const goal = body.goal?.trim();
  const maxCredits = body.maxCreditsPerSemester;
  cachedRoadmap = {
    ...base,
    id: `roadmap-local-${Date.now()}`,
    title: goal ? `Lộ trình theo mục tiêu: ${goal.length > 48 ? `${goal.slice(0, 48)}…` : goal}` : base.title,
    summary: maxCredits
      ? `${base.summary} (Đã giới hạn ${maxCredits} tín chỉ/kỳ theo yêu cầu của bạn.)`
      : base.summary,
    generatedAt: now,
  };
  return mockGetRoadmap() as StudyRoadmap;
};
