// src/types/ai-student.ts
// Types cho Sprint 3: Chat AI + Lộ trình học (Roadmap) phía sinh viên.
// Mỗi field ánh xạ với schema MySQL (xem .md):
//   ai_conversations, ai_messages, ai_message_sources, course_recommendations,
//   study_plans + study_plan_courses (nguồn dữ liệu sinh roadmap).

/** ai_messages.sender */
export type AiChatSender = 'USER' | 'ASSISTANT';

/** ai_messages.question_category */
export type AiQuestionCategory =
  | 'POLICY'
  | 'COURSE_INFO'
  | 'STUDY_PLAN'
  | 'GRADUATION'
  | 'UNSUPPORTED'
  | 'OTHER';

/** ai_conversations.status */
export type AiConversationStatus = 'ACTIVE' | 'CLOSED';

/** course_recommendations.priority */
export type RoadmapPriority = 'HIGH' | 'MEDIUM' | 'LOW';

/** Trạng thái hiển thị của một học kỳ trong roadmap. */
export type RoadmapSemesterStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED' | 'SUGGESTED';

/** Trạng thái hiển thị của một môn trong roadmap. */
export type RoadmapCourseStatus = 'PASSED' | 'IN_PROGRESS' | 'PLANNED' | 'SUGGESTED' | 'FAILED';

/** Một hội thoại chat AI (ai_conversations). */
export interface AiConversation {
  id: string;
  /** ai_conversations.user_id */
  userId: string;
  title: string | null;
  status: AiConversationStatus;
  /** Số tin nhắn trong hội thoại — tiện hiển thị, không có trong DB. */
  messageCount: number;
  lastMessageAt: string | null;
  /** ISO-8601 */
  createdAt: string;
}

/** Nguồn trích dẫn của một câu trả lời (ai_message_sources + document_chunks + knowledge_documents). */
export interface AiChatSource {
  /** ai_message_sources.chunk_id */
  chunkId: string;
  documentTitle: string;
  sectionTitle: string | null;
  quotedText: string | null;
  relevanceScore: number | null;
  rankPosition: number | null;
}

/** Một tin nhắn chat (ai_messages + sources). */
export interface AiChatMessage {
  id: string;
  conversationId: string;
  sender: AiChatSender;
  content: string;
  questionCategory: AiQuestionCategory | null;
  /** ai_messages.is_unsupported — câu hỏi ngoài phạm vi hỗ trợ. */
  isUnsupported: boolean;
  /** ai_messages.is_fallback — tin nhắn dự phòng khi gọi AI thất bại. */
  isFallback: boolean;
  /** ai_messages.confidence_score — chỉ có ở tin ASSISTANT. */
  confidenceScore: number | null;
  aiConfigurationId: string | null;
  sources: AiChatSource[];
  wasHelpful: boolean | null;
  feedback: string | null;
  /** ISO-8601 */
  createdAt: string;
}

/** Body của POST /student/ai/conversations */
export interface CreateAiConversationDto {
  title?: string;
}

/** Body của POST /student/ai/conversations/{id}/messages */
export interface SendAiMessageDto {
  /** ai_messages.content — text, not null */
  content: string;
}

/** Kết quả gửi tin nhắn: cả tin USER vừa lưu và tin ASSISTANT vừa sinh. */
export interface SendAiMessageResult {
  userMessage: AiChatMessage;
  assistantMessage: AiChatMessage;
}

/** Body của PATCH /student/ai/messages/{id}/feedback */
export interface AiMessageFeedbackDto {
  /** ai_messages.was_helpful */
  wasHelpful: boolean;
  /** ai_messages.feedback — text, nullable */
  feedback?: string;
}

/** Một môn học trong lộ trình (course_recommendations + courses + study_plan_courses). */
export interface RoadmapCourse {
  /** courses.id */
  courseId: string;
  /** courses.code */
  courseCode: string;
  /** courses.name */
  courseName: string;
  /** courses.credits */
  credits: number;
  categoryName: string | null;
  /** curriculum_courses.is_mandatory */
  isMandatory: boolean;
  /** course_recommendations.priority */
  priority: RoadmapPriority;
  status: RoadmapCourseStatus;
  /** course_recommendations.reasoning — vì sao AI gợi ý môn này. */
  reason: string | null;
  /** Mã các môn tiên quyết (course_prerequisites). */
  prerequisites: string[];
}

/** Một học kỳ trong lộ trình. */
export interface RoadmapSemester {
  /** curriculum_courses.semester_number */
  semesterNumber: number;
  /** semesters.code — vd "FA2026", null nếu là kỳ dự kiến chưa có mã. */
  semesterCode: string | null;
  title: string;
  totalCredits: number;
  status: RoadmapSemesterStatus;
  courses: RoadmapCourse[];
  note: string | null;
}

/**
 * Lộ trình học do AI sinh — JSON cấu trúc backend trả về.
 * Ghép từ study_plans (title/summary) + course_recommendations (courses/reasoning).
 */
export interface StudyRoadmap {
  id: string;
  studentId: string;
  title: string;
  summary: string;
  /** ISO-8601 thời điểm AI sinh. */
  generatedAt: string;
  modelName: string | null;
  /** 0 - 1, null khi không có. */
  confidenceScore: number | null;
  totalSemesters: number;
  totalCredits: number;
  semesters: RoadmapSemester[];
}

/** Body của POST /student/ai/roadmap */
export interface GenerateRoadmapDto {
  /** Mục tiêu tự do của sinh viên, vd "Ra trường đúng hạn, GPA >= 8.0". */
  goal?: string;
  /** Giới hạn tín chỉ mỗi kỳ mà sinh viên muốn. */
  maxCreditsPerSemester?: number;
}
