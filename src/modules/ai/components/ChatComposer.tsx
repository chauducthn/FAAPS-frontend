// Modern floating chat composer with file/image attachment, drag-and-drop, and clipboard paste.
import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent, type FormEvent } from 'react';
import { ArrowUp, FilePdf, FileText, FileXls, Image as ImageIcon, SpinnerGap as Loader2, Paperclip, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

const MAX_MESSAGE = 2000;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPT_FILES = '.xlsx,.xls,.csv,.pdf,.txt,.md,.png,.jpg,.jpeg,.webp';
const ACCEPT_IMAGES = 'image/png,image/jpeg,image/webp';

interface ChatComposerProps {
  draft: string; onDraftChange: (value: string) => void; isBusy: boolean; onSend: (text: string, file: File | null) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) return <FileXls className="size-4 text-emerald-600" weight="duotone" />;
  if (lower.endsWith('.pdf')) return <FilePdf className="size-4 text-red-600" weight="duotone" />;
  return <FileText className="size-4 text-[#F26F21]" weight="duotone" />;
}

export function ChatComposer({ draft, onDraftChange, isBusy, onSend }: ChatComposerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [draft]);

  const attachFile = (candidate: File | undefined) => {
    if (!candidate) return;
    if (candidate.size > MAX_FILE_BYTES) {
      toast.error('File must be 10 MB or smaller.');
      return;
    }
    setFile(candidate);
    textareaRef.current?.focus();
  };

  const canSend = !isBusy && (draft.trim().length > 0 || file !== null);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    const textToSend = draft.trim();
    const fileToSend = file;
    setFile(null);
    onSend(textToSend, fileToSend);
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedFile = Array.from(e.clipboardData.files ?? [])[0];
    if (pastedFile) {
      e.preventDefault();
      attachFile(pastedFile);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    attachFile(e.dataTransfer.files?.[0]);
  };

  return (
    <form onSubmit={submit} className="shrink-0 bg-white px-4 pb-4 pt-2 sm:px-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'mx-auto max-w-3xl rounded-2xl border bg-gray-50/70 transition-all',
          'focus-within:border-[#F26F21]/70 focus-within:bg-white focus-within:shadow-sm focus-within:ring-2 focus-within:ring-[#F26F21]/15',
          dragging ? 'border-[#F26F21] bg-orange-50/40 ring-2 ring-[#F26F21]/20' : 'border-gray-200/90',
        )}
      >
        {file && (
          <div className="flex items-center gap-2 border-b border-gray-200/70 px-3.5 py-2.5">
            <div className="inline-flex max-w-full items-center gap-2.5 rounded-xl border border-gray-200 bg-white py-1.5 pl-2 pr-2.5 shadow-2xs">
              {previewUrl ? (
                <img src={previewUrl} alt={file.name} className="size-9 rounded-lg object-cover ring-1 ring-black/5" />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-gray-200/80">
                  <FileTypeIcon name={file.name} />
                </span>
              )}
              <div className="min-w-0">
                <p className="max-w-[220px] truncate text-xs font-semibold text-gray-900">{file.name}</p>
                <p className="text-[11px] text-gray-400">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove attachment"
                className="ml-1 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          maxLength={MAX_MESSAGE}
          placeholder={
            file
              ? 'Nhắn yêu cầu cho AI (VD: "Đây là transcript của tôi, hãy cập nhật vào profile")...'
              : 'Nhắn với AI Advisor hoặc kéo thả ảnh / file transcript (.xlsx, .csv, .pdf)...'
          }
          aria-label="Enter a message for AI"
          className="block max-h-36 min-h-[44px] w-full resize-none bg-transparent px-4 pt-3 pb-1.5 text-sm leading-relaxed text-gray-900 outline-none placeholder:text-gray-400"
        />

        <div className="flex items-center justify-between gap-2 px-2.5 pb-2 pt-1">
          <div className="flex items-center gap-1">
            <input ref={fileInputRef} type="file" accept={ACCEPT_FILES} className="hidden" onChange={(e) => { attachFile(e.target.files?.[0]); e.target.value = ''; }} />
            <input ref={imageInputRef} type="file" accept={ACCEPT_IMAGES} className="hidden" onChange={(e) => { attachFile(e.target.files?.[0]); e.target.value = ''; }} />
            <button type="button" disabled={isBusy} onClick={() => fileInputRef.current?.click()} title="Attach transcript or document (.xlsx, .csv, .pdf, .txt)" aria-label="Attach file" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200/60 hover:text-gray-900 disabled:opacity-50">
              <Paperclip className="size-4" /><span className="hidden sm:inline">File</span>
            </button>
            <button type="button" disabled={isBusy} onClick={() => imageInputRef.current?.click()} title="Attach image (PNG, JPG, WebP)" aria-label="Attach image" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200/60 hover:text-gray-900 disabled:opacity-50">
              <ImageIcon className="size-4" /><span className="hidden sm:inline">Image</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {draft.length > 0 && (
              <span className="text-[11px] tabular-nums text-gray-400">
                {draft.length}/{MAX_MESSAGE}
              </span>
            )}
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
              className="inline-flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-[#F26F21] text-white shadow-2xs transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" weight="bold" />}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
