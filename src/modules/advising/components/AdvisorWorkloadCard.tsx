import { Briefcase, CalendarBlank as CalendarDays, SealCheck as BadgeCheck } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { ProfileCard, ProfileMetaRow, profileMetaListClass } from '@/shared/components/profile/ProfileCard';
import type { AdvisorProfile as AdvisorProfileData } from '../services/advisorService';

const STATUS_STYLES: Record<string, { pill: string; dot: string; label: string }> = {
  ACTIVE: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
  INACTIVE: { pill: 'bg-line-soft text-ink-muted', dot: 'bg-ink-subtle', label: 'Inactive' },
  ON_LEAVE: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'On leave' },
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

/** Advising capacity and role facts of the signed-in advisor. */
export function AdvisorWorkloadCard({ profile }: AdvisorWorkloadCardProps) {
  const style = STATUS_STYLES[profile.status] ?? STATUS_STYLES.ACTIVE;
  const capacityPct =
    profile.maxAdvisees > 0
      ? Math.min(100, Math.round((profile.activeAdvisees / profile.maxAdvisees) * 100))
      : 0;

  return (
    <ProfileCard title="Advising" description="Your advisee load and advising role">
      <div>
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="text-ink-muted">Advising load</span>
          <span className="font-semibold tabular-nums text-ink-primary">
            {profile.activeAdvisees}/{profile.maxAdvisees}
            <span className="ml-1.5 font-normal text-ink-subtle">· {capacityPct}%</span>
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft"
          role="progressbar"
          aria-valuenow={capacityPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Advising capacity ${capacityPct}%`}
        >
          <span className="block h-full rounded-full bg-brand" style={{ width: `${capacityPct}%` }} />
        </div>
      </div>

      <dl className={cn(profileMetaListClass, 'mt-3')}>
        <ProfileMetaRow icon={<Briefcase aria-hidden />} label="Specialty">
          {profile.specialization || 'Not provided'}
        </ProfileMetaRow>
        <ProfileMetaRow icon={<CalendarDays aria-hidden />} label="Advising since">
          {formatDate(profile.assignmentStartDate)}
        </ProfileMetaRow>
        <ProfileMetaRow icon={<BadgeCheck aria-label="Verified advisor" />} label="Status">
          <span className={cn('inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[11px] font-medium', style.pill)}>
            <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
            {style.label}
          </span>
        </ProfileMetaRow>
      </dl>
    </ProfileCard>
  );
}
