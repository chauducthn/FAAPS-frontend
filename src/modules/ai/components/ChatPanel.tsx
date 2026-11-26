// Student AI Advisor Chat workspace: sub-sidebar of past chats, student context awareness,
// starter coaching prompts, message thread, and composer.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { SidebarSimple, Sparkle as Sparkles, UploadSimple } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { useMyProfile, useMyProgress } from '@/modules/learning/hooks/queries/useStudentQueries';
import { useAiConversations, useAiMessages } from '../hooks/queries/useAiStudentQueries';
import { useCreateAiConversation, useSendAiMessage } from '../hooks/mutations/useAiStudentMutations';
import { ChatBubble, TypingBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';
import { ChatSidebar, type StudentContextSummary } from './ChatSidebar';
import { ChatWelcomeState } from './ChatWelcomeState';

export function ChatPanel({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const user = useAuth((s) => s.user);
  const profileQuery = useMyProfile();
  const progressQuery = useMyProgress();
  const conversationsQuery = useAiConversations();
  const messagesQuery = useAiMessages(activeId);
  const createConversation = useCreateAiConversation();
  const sendMessage = useSendAiMessage(activeId);

  const [draft, setDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const activeConversation = conversations.find((c) => c.id === activeId);

  const profile = profileQuery.data;
  const progress = progressQuery.data;
  const creditsEarned = progress?.earnedCredits ?? profile?.totalCreditsEarned ?? null;
  const gpa = profile?.currentGpa ?? null;
  const hasCurriculum = !!(profile?.majorCode || profile?.curriculumVersionId);
  const hasTranscript = (creditsEarned ?? 0) > 0 || (gpa != null && gpa > 0);

  const studentContext: StudentContextSummary = {
    majorCode: profile?.majorCode,
    cohort: profile?.cohort,
    gpa,
    creditsEarned,
    hasCurriculum,
    hasTranscript,
    isLoading: profileQuery.isLoading,
  };

  useEffect(() => {
    if (!activeId && conversations.length > 0) onSelect(conversations[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationsQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, sendMessage.isPending, activeId]);

  const handleNewChat = async () => {
    const created = await createConversation.mutateAsync({});
    setDraft('');
    onSelect(created.id);
  };

  const dispatchMessage = async (text: string, file: File | null = null) => {
    const content = text.trim();
    if ((!content && !file) || sendMessage.isPending || createConversation.isPending) return;
    setDraft('');
    let targetId = activeId;
    if (!targetId) {
      const created = await createConversation.mutateAsync({});
      targetId = created.id;
      onSelect(targetId);
    }
    sendMessage.mutate({ conversationId: targetId, content, file });
  };

  const showWelcome = !activeId || (!messagesQuery.isLoading && !messagesQuery.isError && messages.length === 0);

  return (
    <div className="flex h-[calc(100vh-128px)] min-h-[520px] w-full gap-4">
      {sidebarOpen && (
        <div className="h-full w-[264px] shrink-0 sm:w-[280px]">
          <ChatSidebar
            conversations={conversations}
            activeId={activeId}
            isLoading={conversationsQuery.isLoading}
            isCreating={createConversation.isPending}
            studentContext={studentContext}
            onSelect={onSelect}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? 'Hide chat history' : 'Show chat history'}
              title={sidebarOpen ? 'Hide chat history' : 'Show chat history'}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <SidebarSimple className="size-4" />
            </button>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
              <Sparkles className="size-4" weight="fill" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-gray-900">
                {activeConversation?.title && activeConversation.title !== 'New Advising Chat'
                  ? activeConversation.title
                  : 'Advisor Assistant'}
              </h1>
              <p className="truncate text-xs text-gray-500">
                Personalized FPTU study guidance &amp; academic coaching
              </p>
            </div>
          </div>

          {!studentContext.isLoading && !studentContext.hasTranscript && (
            <Link
              to="/student/transcript"
              className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/70 px-3 py-1.5 text-xs font-semibold text-[#C2410C] transition-colors hover:bg-orange-100 sm:inline-flex"
            >
              <UploadSimple className="size-3.5" /> Upload transcript
            </Link>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/40 px-4 py-5 sm:px-6">
          {messagesQuery.isLoading && activeId ? (
            <div className="mx-auto max-w-3xl space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={cn('h-14 animate-pulse rounded-2xl bg-white', i % 2 === 0 ? 'ml-auto w-2/3' : 'w-2/3')}
                />
              ))}
            </div>
          ) : messagesQuery.isError && activeId ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-sm font-semibold text-gray-900">Unable to load messages</p>
              <button
                type="button"
                onClick={() => messagesQuery.refetch()}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Try again
              </button>
            </div>
          ) : showWelcome ? (
            <ChatWelcomeState
              userName={user?.fullName}
              studentContext={studentContext}
              disabled={sendMessage.isPending || createConversation.isPending}
              onSelectPrompt={(prompt) => void dispatchMessage(prompt)}
            />
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {sendMessage.isPending && <TypingBubble />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          isBusy={sendMessage.isPending || createConversation.isPending}
          onSend={(text, file) => void dispatchMessage(text, file)}
        />
      </section>
    </div>
  );
}
