import { useState } from 'react';
import { Sparkle as Sparkles, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { advisorProactiveService } from '../services/advisorProactiveService';

interface AdvisorAiCopilotDrawerProps {
  open: boolean;
  studentId?: string;
  sessionId?: string;
  title: string;
  onClose: () => void;
  onApplySummary?: (summaryText: string) => void;
}

export function AdvisorAiCopilotDrawer({
  open,
  studentId,
  sessionId,
  title,
  onClose,
  onApplySummary,
}: AdvisorAiCopilotDrawerProps) {
  const [rawNotes, setRawNotes] = useState('');
  const [result, setResult] = useState<string>('');
  const [fallback, setFallback] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const runStudentBrief = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const response = await advisorProactiveService.generateStudentBrief(studentId);
      setResult(response.content);
      setFallback(response.fallback);
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const runDraftSummary = async () => {
    if (!sessionId || !rawNotes.trim()) return;
    setLoading(true);
    try {
      const response = await advisorProactiveService.draftSessionSummary(sessionId, rawNotes.trim());
      setResult(response.content);
      setFallback(response.fallback);
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--brand)]" />
            <h2 className="text-sm font-bold text-slate-900">AI Advising Copilot · {title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close copilot" className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="size-4 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {studentId && (
            <button
              type="button"
              disabled={loading}
              onClick={runStudentBrief}
              className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
            >
              {loading ? 'Analyzing student record...' : 'Generate Student Advising Brief'}
            </button>
          )}

          {sessionId && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Raw session notes
                <textarea
                  rows={4}
                  value={rawNotes}
                  onChange={(event) => setRawNotes(event.target.value)}
                  placeholder="Bullet points from the advising session..."
                  className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-[var(--brand)]"
                />
              </label>
              <button
                type="button"
                disabled={loading || !rawNotes.trim()}
                onClick={runDraftSummary}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Drafting summary...' : 'Draft Structured Session Summary'}
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {fallback && (
                <p className="text-[11px] font-semibold text-amber-700">
                  Generated using structured fallback (Gemini API key unavailable).
                </p>
              )}
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800">{result}</pre>
              {onApplySummary && (
                <button
                  type="button"
                  onClick={() => {
                    onApplySummary(result);
                    onClose();
                  }}
                  className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[var(--brand-hover)]"
                >
                  Apply to Session Summary
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
