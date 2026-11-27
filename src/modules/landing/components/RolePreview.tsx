import type { RoleShowcaseItem } from './content';

type RolePreviewProps = Pick<RoleShowcaseItem, 'previewTitle' | 'previewBadge' | 'previewMetrics' | 'previewItems'>;

/** Faux application window that previews what each portal looks like. */
export function RolePreview({ previewTitle, previewBadge, previewMetrics, previewItems }: RolePreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-sunken shadow-[0_30px_60px_-35px_rgb(0_0_0/0.4)]">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
        </div>
        <p className="flex-1 truncate text-center text-xs font-medium text-ink-muted">{previewTitle}</p>
        <span className="hidden rounded-sm bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-ink sm:inline">
          {previewBadge}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2.5">
          {previewMetrics.map((metric) => (
            <div key={metric.label} className="rounded-md border border-line-soft bg-white p-3.5">
              <p className="text-[11px] font-medium text-ink-muted">{metric.label}</p>
              <p className="mt-1.5 text-base font-semibold tracking-tight text-ink-primary tabular-nums sm:text-lg">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 divide-y divide-line-soft overflow-hidden rounded-md border border-line-soft bg-white">
          {previewItems.map((item) => (
            <div key={item.title} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-primary">{item.title}</p>
                  <p className="truncate text-xs text-ink-muted">{item.meta}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-sm border border-line px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
