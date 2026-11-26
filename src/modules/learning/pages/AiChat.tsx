// Student AI Advisor Chat page: full-height workspace with past conversation sub-sidebar.
import { useState } from 'react';
import { ChatPanel } from '../../ai/components/ChatPanel';

export default function StudentAiChat() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="w-full min-w-0">
      <ChatPanel activeId={activeId} onSelect={setActiveId} />
    </div>
  );
}
