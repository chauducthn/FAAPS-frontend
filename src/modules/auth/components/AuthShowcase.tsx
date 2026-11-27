import campusLake from '@/assets/hero/campus-2.jpg';
import { cn } from '@/shared/lib/utils';

const FRAME_CLASS =
  'relative isolate flex h-full flex-col justify-end overflow-hidden rounded-lg bg-[#0b0b0b] p-10 text-white ' +
  '[view-transition-name:campus-frame]';

const PHOTO_CLASS =
  'absolute left-1/2 top-1/2 -z-10 h-svh w-screen max-w-none -translate-x-1/2 -translate-y-1/2 object-cover';

const PILLARS = ['Graduation tracking', 'AI study roadmap', '1-on-1 advising'];

/** Framed campus photo shown beside every auth form on large screens. Decorative only. */
export function AuthShowcase({ className }: { className?: string }) {
  return (
    <aside aria-hidden className={cn('sticky top-0 hidden h-svh p-3', className)}>
      <div className={FRAME_CLASS}>
        {/* Sized like the full-screen landing hero, so both photos share one crop and the route morph never jumps. */}
        <img src={campusLake} alt="" className={PHOTO_CLASS} />
        <div className="absolute inset-0 -z-10 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-linear-to-t from-[#0b0b0b] via-[#0b0b0b]/70 to-transparent" />

        <p className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
          <span className="h-px w-6 bg-brand" />
          FPT University · FAAPS
        </p>
        <p className="mt-5 max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.035em] xl:text-5xl">
          Your curriculum, roadmap and advisor in <span className="text-brand">one place</span>.
        </p>

        <div className="mt-10 grid grid-cols-3 border-t border-white/15 pt-5">
          {PILLARS.map((pillar, index) => (
            <div key={pillar} className="pr-4">
              <p className="text-xs font-semibold tabular-nums text-white/45">{String(index + 1).padStart(2, '0')}</p>
              <p className="mt-1.5 text-sm font-medium text-white/85">{pillar}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
