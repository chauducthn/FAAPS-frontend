import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAiReport, useResolveAiReport } from '../../ai/hooks/queries/useAdminAiReports';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { CitedSourcesCard, ReportSummaryCard, StudentReportCard } from './ai/AiReportDetailPanels';
import { AiReportConversationPanel, ResolutionSection } from './ai/AiReportConversationPanel';

export default function AiReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAiReport(id);
  const resolve = useResolveAiReport();

  const [selected, setSelected] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const flagged = useMemo(() => (data?.messages ?? []).filter((m) => m.reported), [data]);
  const current = flagged[selected];
  const sources = useMemo(
    () => (data?.sources ?? []).filter((s) => s.messageId === current?.id),
    [data, current],
  );

  // Keep the selected reported response in view inside the conversation panel.
  useEffect(() => {
    if (!current || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-message-id="${current.id}"]`);
    if (el) listRef.current.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
  }, [current]);

  const back = (
    <Link
      to="/admin/ai-reports"
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:text-[#F26F21]"
    >
      <ChevronLeft className="size-4" />
      Back to Reported Responses
    </Link>
  );

  if (isLoading) {
    return (
      <div className="w-full">
        {back}
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full">
        {back}
        <div className="mt-6 rounded-xl bg-white p-8 text-center text-sm text-[#555f6f]">
          Could not load this report.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { report, messages } = data;
  const pending = report.status === 'PENDING';

  const submit = async (status: 'RESOLVED' | 'DISMISSED') => {
    if (!note.trim()) {
      setConfirmDismiss(false);
      return setError('A resolution note is required.');
    }
    setError(null);
    try {
      await resolve.mutateAsync({ id: report.id, status, resolutionNote: note.trim() });
      toast.success(status === 'RESOLVED' ? 'Report marked as resolved.' : 'Report dismissed.');
      setNote('');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setConfirmDismiss(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div>{back}</div>

      <ReportSummaryCard report={report} flaggedCount={flagged.length} pending={pending} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-4">
          <StudentReportCard report={report} currentNote={current?.studentNote} selectedIndex={selected} />
          <CitedSourcesCard sources={sources} selectedIndex={selected} flaggedCount={flagged.length} />
        </div>
        <AiReportConversationPanel
          report={report}
          messages={messages}
          flagged={flagged}
          selected={selected}
          listRef={listRef}
          onPrev={() => setSelected((s) => s - 1)}
          onNext={() => setSelected((s) => s + 1)}
        />
      </div>

      <ResolutionSection report={report} pending={pending} note={note} error={error} onNoteChange={setNote} />

      {pending && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => (note.trim() ? setConfirmDismiss(true) : setError('A resolution note is required.'))}
            className="text-left text-[13px] font-semibold text-gray-500 transition-colors hover:text-red-600"
          >
            Dismiss report
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/ai-reports')}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={resolve.isPending}
              onClick={() => submit('RESOLVED')}
              className="h-9 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:opacity-60"
            >
              {resolve.isPending ? 'Saving...' : 'Save & mark as resolved'}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDismiss}
        title="Dismiss this report?"
        message="The report will be closed without a fix. Your note is saved as the reason it was dismissed."
        confirmLabel="Dismiss report"
        destructive
        isLoading={resolve.isPending}
        onConfirm={() => submit('DISMISSED')}
        onCancel={() => setConfirmDismiss(false)}
      />
    </div>
  );
}
