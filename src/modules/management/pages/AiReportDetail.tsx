import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { CaretLeft as ChevronLeft, SpinnerGap } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useAiReport, useResolveAiReport } from '../../ai/hooks/queries/useAdminAiReports';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AiReportConversationPanel, ResolutionSection } from './ai/AiReportConversationPanel';
import { CitedSourcesCard, ReportSummaryCard, StudentReportCard } from './ai/AiReportDetailPanels';

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

  useEffect(() => {
    if (!current || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-message-id="${current.id}"]`);
    if (el) listRef.current.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
  }, [current]);

  const back = (
    <Link
      to="/admin/ai-reports"
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-brand"
    >
      <ChevronLeft className="size-4" />
      Back to Reported Responses
    </Link>
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {back}
        <div className="h-64 animate-pulse rounded-lg border border-line bg-white" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full space-y-4">
        {back}
        <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-ink-muted">
          Could not load this report.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold text-brand-ink hover:underline">
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
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => (note.trim() ? setConfirmDismiss(true) : setError('A resolution note is required.'))}
            className="text-left text-[13px] font-semibold text-ink-muted transition-colors hover:text-red-600"
          >
            Dismiss report
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/ai-reports')}
              className="inline-flex h-9 items-center rounded-md border border-line bg-white px-4 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={resolve.isPending}
              onClick={() => submit('RESOLVED')}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {resolve.isPending && <SpinnerGap className="size-4 animate-spin" aria-hidden />}
              Save &amp; mark as resolved
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
