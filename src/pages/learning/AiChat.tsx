// src/pages/learning/AiChat.tsx
// Trang "Chat AI" của sinh viên: khung chat bong bóng + sidebar hội thoại.

import { useState } from 'react';
import { ChatPanel } from '../../components/ai/ChatPanel';


export default function StudentAiChat() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Student / AI Chat</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">AI Academic Assistant</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Ask about curricula, prerequisites, academic policies, or request a suggested study roadmap.
        </p>
      </div>



      <ChatPanel activeId={activeId} onSelect={setActiveId} />
    </div>
  );
}
