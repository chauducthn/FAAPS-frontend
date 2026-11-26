import { SealCheck as BadgeCheck, Briefcase, CalendarBlank as CalendarDays, EnvelopeSimple as Mail, Phone, UsersThree as UsersRound } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdvisorProfile as AdvisorProfileData } from '../services/advisorService';

const STATUS_STYLES: Record<string, { pill: string; dot: string; label: string }> = {
  ACTIVE: { pill: 'bg-emerald-100 text-emerald-900 ring-emerald-300', dot: 'bg-emerald-600', label: 'Active' },
  INACTIVE: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'Inactive' },
  ON_LEAVE: { pill: 'bg-amber-100 text-amber-900 ring-amber-300', dot: 'bg-amber-500', label: 'On leave' },
};

function formatDate(iso: string | null): string {
  if (!iso) return 'Not assigned';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface AdvisorWorkloadCardProps {
  profile: AdvisorProfileData;
}

export function AdvisorWorkloadCard({ profile }: AdvisorWorkloadCardProps) {
  const style = STATUS_STYLES[profile.status] ?? STATUS_STYLES.ACTIVE;
  const capacityPct =
    profile.maxAdvisees > 0
      ? Math.min(100, Math.round((profile.activeAdvisees / profile.maxAdvisees) * 100))
      : 0;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-base font-bold text-slate-900">
          {profile.fullName}
          <BadgeCheck className="size-4 shrink-0 text-[var(--brand)]" aria-label="Verified advisor" />
        </p>
        <span
          className={cn(
            'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold ring-1 ring-inset',
            style.pill,
          )}
        >
          <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
          {style.label}
        </span>
      </div>

      <ul className="mt-5 space-y-3.5 text-sm">
        <li className="flex items-start gap-2.5">
          <Mail className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <p className="truncate font-semibold text-slate-900">{profile.email}</p>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <Phone className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
            <p className="font-semibold tabular-nums text-slate-900">{profile.phone || 'Not provided'}</p>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <Briefcase className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Specialty</p>
            <p className="font-semibold text-slate-900">{profile.specialization || 'Not provided'}</p>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Advising since</p>
            <p className="font-semibold text-slate-900">{formatDate(profile.assignmentStartDate)}</p>
          </div>
        </li>
      </ul>

      <div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
        <p className="flex items-center justify-between text-sm font-bold text-slate-900">
          <span className="inline-flex items-center gap-1.5">
            <UsersRound className="size-4 text-slate-500" aria-hidden />
            Advising load
          </span>
          <span className="tabular-nums">
            {profile.activeAdvisees}/{profile.maxAdvisees}
          </span>
        </p>
        <div
          className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={capacityPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Advising capacity ${capacityPct}%`}
        >
          <span
            className="block h-full rounded-full bg-[var(--brand)]"
            style={{ width: `${capacityPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-slate-600">{capacityPct}% of capacity</p>
      </div>
    </aside>
  );
}
