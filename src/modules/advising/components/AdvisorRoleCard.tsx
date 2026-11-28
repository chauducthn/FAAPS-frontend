// Role facts of the signed-in advisor. Advising is a shared queue, so there is no fixed advisee load to show.
import { Briefcase, Hash, SealCheck as BadgeCheck, Stack as Layers } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { ProfileCard, ProfileMetaRow, profileMetaListClass } from '@/shared/components/profile/ProfileCard';
import { majorGroupLabel } from '../../academic/services/majorGroupService';
import type { AdvisorProfile as AdvisorProfileData } from '../services/advisorService';

const STATUS_STYLES: Record<string, { pill: string; dot: string; label: string }> = {
  ACTIVE: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
  INACTIVE: { pill: 'bg-line-soft text-ink-muted', dot: 'bg-ink-subtle', label: 'Inactive' },
  ON_LEAVE: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'On leave' },
};

export function AdvisorRoleCard({ profile }: { profile: AdvisorProfileData }) {
  const style = STATUS_STYLES[profile.status] ?? STATUS_STYLES.ACTIVE;
  return (
    <ProfileCard title="Advising" description="Your advising role">
      <dl className={profileMetaListClass}>
        <ProfileMetaRow icon={<Hash aria-hidden />} label="Advisor ID">
          <span className="font-mono">{profile.advisorCode || 'Not assigned'}</span>
        </ProfileMetaRow>
        <ProfileMetaRow icon={<Layers aria-hidden />} label="Major group">
          {majorGroupLabel(profile.majorGroupCode, profile.majorGroupName) ?? 'Not assigned yet'}
        </ProfileMetaRow>
        <ProfileMetaRow icon={<Briefcase aria-hidden />} label="Specialty">
          {profile.specialization || 'Not provided'}
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
