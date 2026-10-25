// src/components/ai/ChatBubble.tsx
// Bong bóng chat trực quan cho khung Chat AI phía sinh viên.
// USER: căn phải, nền cam thương hiệu. ASSISTANT: căn trái, nền trắng + viền.

import { useState } from 'react';
import { BookOpenText, CircleAlert, FileWarning, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSendAiFeedback } from '../../hooks/mutations/useAiStudentMutations';
import type { AiChatMessage, AiQuestionCategory } from '../../types/ai-student';

const CATEGORY_LABELS: Record<AiQuestionCategory, string> = {
  POLICY: 'Quy chế',
  COURSE_INFO: 'Môn học',
  STUDY_PLAN: 'Lộ trình',
  GRADUATION: 'Tốt nghiệp',
  UNSUPPORTED: 'Ngoài phạm vi',
  OTHER: 'Chung',
};

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

function AssistantMeta({ message }: { message: AiChatMessage }) {
  const [conversationId] = useState(message.conversationId);
  const feedback = useSendAiFeedback(conversationId);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {message.questionCategory && (
        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-[#b45309] ring-1 ring-inset ring-orange-200">
          {CATEGORY_LABELS[message.questionCategory]}
        </span>
      )}
      {typeof message.confidenceScore === 'number' && (
        <span className="text-[11px] text-[#98a2b3]">
          Độ tin cậy {Math.round(message.confidenceScore * 100)}%
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          disabled={feedback.isPending}
          aria-label="Câu trả lời hữu ích"
          title="Hữu ích"
          onClick={() => feedback.mutate({ messageId: message.id, body: { wasHelpful: true } })}
          className={cn(
            'rounded-md p-1.5 transition-colors hover:bg-green-50',
            message.wasHelpful === true ? 'text-green-600' : 'text-[#98a2b3] hover:text-green-600',
          )}
        >
          <ThumbsUp className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={feedback.isPending}
          aria-label="Câu trả lời chưa hữu ích"
          title="Chưa hữu ích"
          onClick={() => feedback.mutate({ messageId: message.id, body: { wasHelpful: false } })}
          className={cn(
            'rounded-md p-1.5 transition-colors hover:bg-red-50',
            message.wasHelpful === false ? 'text-red-600' : 'text-[#98a2b3] hover:text-red-600',
          )}
        >
          <ThumbsDown className="size-3.5" />
        </button>
      </span>
    </div>
  );
}

export function ChatBubble({ message }: { message: AiChatMessage }) {
  const isUser = message.sender === 'USER';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="rounded-2xl rounded-br-md bg-[#F26F21] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <p className="mt-1 text-right text-[11px] text-[#98a2b3]">{timeOf(message.createdAt)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F26F21] to-[#b45309] text-white shadow-sm">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 max-w-[85%] sm:max-w-[75%]">
        <div className="rounded-2xl rounded-bl-md border border-[#e5e7eb] bg-white px-4 py-2.5 shadow-sm">
          {message.isUnsupported && (
            <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
              <CircleAlert className="size-3.5" />
              Câu hỏi ngoài phạm vi hỗ trợ
            </p>
          )}
          {message.isFallback && (
            <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-semibold text-[#555f6f]">
              <FileWarning className="size-3.5" />
              Trả lời dự phòng (hệ thống AI đang bận)
            </p>
          )}
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#151c27]">
            {message.content}
          </p>

          {message.sources.length > 0 && (
            <details className="mt-2 rounded-lg bg-[#f7f8fa] px-2.5 py-2">
              <summary className="flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-[#555f6f]">
                <BookOpenText className="size-3.5" />
                Nguồn trích dẫn ({message.sources.length})
              </summary>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {message.sources.map((s) => (
                  <li key={s.chunkId} className="text-[12px] leading-relaxed text-[#555f6f]">
                    <span className="font-semibold text-[#151c27]">{s.documentTitle}</span>
                    {s.sectionTitle && <span> · {s.sectionTitle}</span>}
                    {s.quotedText && <span className="block italic">“{s.quotedText}”</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <AssistantMeta message={message} />
        </div>
        <p className="mt-1 text-[11px] text-[#98a2b3]">{timeOf(message.createdAt)}</p>
      </div>
    </div>
  );
}

/** Bong bóng "AI đang trả lời..." — 3 chấm nhảy. */
export function TypingBubble() {
  return (
    <div className="flex justify-start gap-2.5" aria-label="AI đang trả lời">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F26F21] to-[#b45309] text-white shadow-sm">
        <Sparkles className="size-4" />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#e5e7eb] bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-[#F26F21]"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
