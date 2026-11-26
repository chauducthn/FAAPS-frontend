import { Link } from 'react-router';
import { BookOpen, ChartLineUp, Compass, GraduationCap, Sparkle as Sparkles, UploadSimple } from '@phosphor-icons/react';
import type { StudentContextSummary } from './ChatSidebar';

const STARTER_PROMPTS = [
  {
    icon: ChartLineUp,
    title: 'Phân tích điểm mạnh & yếu',
    description: 'Đọc bảng điểm hiện tại để chỉ ra môn mạnh, môn yếu và cách cải thiện.',
    prompt: 'Hãy đọc dữ liệu học tập của mình, phân tích mình đang mạnh và yếu ở những môn nào và gợi ý cách cải thiện GPA.',
  },
  {
    icon: Compass,
    title: 'Định hướng môn học kỳ tới',
    description: 'Gợi ý môn nên học kỳ sau, thứ tự tiên quyết và cách cân bằng tín chỉ.',
    prompt: 'Kỳ tới mình nên đăng ký những môn nào theo khung chương trình, cần lưu ý môn tiên quyết gì và nên học như thế nào?',
  },
  {
    icon: BookOpen,
    title: 'Phương pháp học môn khó',
    description: 'Chiến lược ôn thi, phân bổ thời gian và cách qua các môn chuyên ngành.',
    prompt: 'Tư vấn cho mình phương pháp học và lộ trình ôn tập hiệu quả cho các môn chuyên ngành khó trong kỳ này.',
  },
  {
    icon: GraduationCap,
    title: 'Kiểm tra tiến độ tốt nghiệp',
    description: 'Đánh giá tín chỉ tích lũy, cảnh báo học vụ và kế hoạch ra trường đúng hạn.',
    prompt: 'Đánh giá tiến độ tín chỉ và tình trạng học tập hiện tại của mình, tư vấn kế hoạch để tốt nghiệp đúng hạn.',
  },
] as const;

export function ChatWelcomeState({
  userName,
  studentContext,
  disabled,
  onSelectPrompt,
}: {
  userName?: string | null;
  studentContext: StudentContextSummary;
  disabled: boolean;
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/80">
        <Sparkles className="size-6" weight="fill" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-gray-900">
        Xin chào{userName ? `, ${userName}` : ''}! Mình là AI Advisor của bạn
      </h2>
      <p className="mt-1 max-w-lg text-[13px] text-gray-500">
        Hỏi mình về định hướng học tập, cách học các môn chuyên ngành, phân tích điểm mạnh/yếu từ bảng điểm hoặc lập lộ trình tốt nghiệp.
      </p>

      {!studentContext.isLoading && (!studentContext.hasTranscript || !studentContext.hasCurriculum) && (
        <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-left text-xs text-amber-900">
          <span>
            Bạn chưa có đủ dữ liệu bảng điểm/khung chương trình — hãy tải lên để AI phân tích chính xác, hoặc nhập trực tiếp điểm các môn vào khung chat.
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {!studentContext.hasTranscript && (
              <Link
                to="/student/transcript"
                className="inline-flex items-center gap-1 rounded-lg bg-[#F26F21] px-2.5 py-1.5 font-semibold text-white hover:bg-[#e05f14]"
              >
                <UploadSimple className="size-3.5" /> Tải bảng điểm
              </Link>
            )}
            {!studentContext.hasCurriculum && (
              <Link
                to="/student/curriculum-goals"
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 font-semibold text-amber-900 hover:bg-amber-100/60"
              >
                Chọn ngành/khóa
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 grid w-full gap-2.5 text-left sm:grid-cols-2">
        {STARTER_PROMPTS.map(({ icon: Icon, title, description, prompt }) => (
          <button
            key={title}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(prompt)}
            className="group flex items-start gap-3 rounded-xl border border-gray-200/80 bg-white p-3.5 transition-all hover:border-[#F26F21]/50 hover:bg-orange-50/30 disabled:opacity-50"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21] transition-colors group-hover:bg-[#F26F21] group-hover:text-white">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
