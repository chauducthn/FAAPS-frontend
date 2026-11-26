import { useState } from 'react';
import { CalendarPlus, EnvelopeSimple as Mail, VideoCamera as Video, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { apiMessage } from '@/shared/lib/apiMessage';
import { advisorProactiveService } from '../services/advisorProactiveService';

type Channel = 'VIRTUAL' | 'SCHEDULED' | 'EMAIL';

interface ProactiveAdvisingModalProps {
  open: boolean;
  studentId: string;
  studentName: string;
  onClose: () => void;
  onCompleted?: () => void;
}

export function ProactiveAdvisingModal({
  open,
  studentId,
  studentName,
  onClose,
  onCompleted,
}: ProactiveAdvisingModalProps) {
  const [channel, setChannel] = useState<Channel>('VIRTUAL');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (channel === 'EMAIL') {
        await advisorProactiveService.sendEmailAdvising({ studentId, subject: subject.trim(), message: message.trim() });
        toast.success(`Advising email sent to ${studentName}`);
      } else {
        await advisorProactiveService.createAppointment({
          studentId,
          sessionType: channel,
          scheduledAt,
          location: channel === 'SCHEDULED' ? location.trim() : undefined,
          meetingLink: channel === 'VIRTUAL' ? meetingLink.trim() : undefined,
          agenda: message.trim(),
        });
        toast.success(`Advising session scheduled for ${studentName}`);
      }
      onCompleted?.();
      onClose();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    channel === 'EMAIL'
      ? subject.trim().length > 0 && message.trim().length > 0
      : scheduledAt.length > 0 && message.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Proactive Advising</h2>
            <p className="text-xs text-slate-500">Reach out to {studentName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal" className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="size-4 text-slate-600" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { id: 'VIRTUAL' as const, label: 'Online', icon: Video },
            { id: 'SCHEDULED' as const, label: 'Offline', icon: CalendarPlus },
            { id: 'EMAIL' as const, label: 'Email', icon: Mail },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setChannel(id)}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold',
                channel === id
                  ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {channel === 'EMAIL' ? (
            <label className="block text-xs font-semibold text-slate-700">
              Subject
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. Attendance & Academic Progress Check-in"
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand)]"
              />
            </label>
          ) : (
            <>
              <label className="block text-xs font-semibold text-slate-700">
                Date & time
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand)]"
                />
              </label>
              {channel === 'VIRTUAL' ? (
                <label className="block text-xs font-semibold text-slate-700">
                  Meeting link
                  <input
                    value={meetingLink}
                    onChange={(event) => setMeetingLink(event.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand)]"
                  />
                </label>
              ) : (
                <label className="block text-xs font-semibold text-slate-700">
                  Office / Room location
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="e.g. Room 204, Alpha Building"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand)]"
                  />
                </label>
              )}
            </>
          )}

          <label className="block text-xs font-semibold text-slate-700">
            {channel === 'EMAIL' ? 'Advising message' : 'Session agenda'}
            <textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={channel === 'EMAIL' ? 'Write clear guidance and next steps...' : 'Topics to discuss during the session...'}
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-[var(--brand)]"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
            >
              {submitting ? 'Sending...' : channel === 'EMAIL' ? 'Send Advising Email' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
