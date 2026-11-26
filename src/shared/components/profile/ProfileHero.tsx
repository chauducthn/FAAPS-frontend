import { User as UserRound } from '@phosphor-icons/react';

interface ProfileHeroProps {
  fullName?: string | null;
  subtitle: string;
  isLoading?: boolean;
  action?: React.ReactNode;
}

export function initialsOf(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  return parts
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function ProfileHero({ fullName, subtitle, isLoading, action }: ProfileHeroProps) {
  const initials = initialsOf(fullName);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--brand)] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-extrabold text-white ring-1 ring-inset ring-white/40"
          >
            {initials || <UserRound className="size-7" />}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-[26px]">
              {isLoading ? 'My Profile' : (fullName || 'My Profile')}
            </h1>
            <p className="mt-1.5 max-w-xl truncate text-sm font-medium text-white/95">
              {subtitle}
            </p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
