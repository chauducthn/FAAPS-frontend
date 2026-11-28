import { CalendarBlank as CalendarDays, Clock, Shield, UserCheck } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { UserProfileDto } from '@/shared/services/profileService';
import { ProfileCard, ProfileMetaRow, profileMetaListClass } from './ProfileCard';

interface AccountMetaCardProps {
  profile: UserProfileDto;
}

function formatDateTime(value?: string | null): string {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AccountMetaCard({ profile }: AccountMetaCardProps) {
  const isActive = profile.status === 'ACTIVE';

  return (
    <ProfileCard as="aside" title="Account" description="Identity and access summary">
      <dl className={profileMetaListClass}>
        <ProfileMetaRow icon={<Shield aria-hidden />} label="Role">
          {profile.role}
        </ProfileMetaRow>
        <ProfileMetaRow icon={<UserCheck aria-hidden />} label="Status">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[11px] font-medium',
              isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-line-soft text-ink-muted',
            )}
          >
            <span className={cn('size-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-ink-subtle')} />
            <span className="inline-block lowercase first-letter:uppercase">{profile.status}</span>
          </span>
        </ProfileMetaRow>
        <ProfileMetaRow icon={<Clock aria-hidden />} label="Last sign-in">
          {formatDateTime(profile.lastLoginAt)}
        </ProfileMetaRow>
        <ProfileMetaRow icon={<CalendarDays aria-hidden />} label="Member since">
          {formatDateTime(profile.createdAt)}
        </ProfileMetaRow>
      </dl>
    </ProfileCard>
  );
}
