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
    <Link to="/admin/ai-reports" className="inline-flex items-center gap-1 text-sm text-[#555f6f] hover:text-orange-600">
      <ChevronLeft className="size-4" />
      Back to Reported AI Responses
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
    <div className="flex w-full flex-col gap-6">
      <div>
        {back}
        <h1 className="mt-3 text-2xl font-semibold text-[#151c27]">Report Details</h1>
      </div>

      <ReportSummaryCard report={report} flaggedCount={flagged.length} pending={pending} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-6">
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
        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <button
            type="button"
            onClick={() => (note.trim() ? setConfirmDismiss(true) : setError('A resolution note is required.'))}
            className="text-left text-sm font-semibold text-[#555f6f] hover:text-[#b91c1c]"
          >
            Dismiss report
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/ai-reports')}
              className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={resolve.isPending}
              onClick={() => submit('RESOLVED')}
              className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-60"
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
