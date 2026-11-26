import { CalendarBlank as CalendarDays, Clock, Shield, UserCheck } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { UserProfileDto } from '@/shared/services/profileService';

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
    <aside className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-bold text-gray-900">Account overview</h2>
        <p className="mt-0.5 text-xs text-gray-500">Identity and access summary</p>
      </div>

      <dl className="divide-y divide-gray-100 px-5 text-sm">
        <div className="flex items-center justify-between gap-3 py-3.5">
          <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Shield className="size-4 text-[#F26F21]" aria-hidden />
            Role
          </dt>
          <dd className="text-xs font-semibold text-gray-900">{profile.role}</dd>
        </div>

        <div className="flex items-center justify-between gap-3 py-3.5">
          <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <UserCheck className="size-4 text-emerald-600" aria-hidden />
            Status
          </dt>
          <dd>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700',
              )}
            >
              <span className={cn('size-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-gray-400')} />
              {profile.status}
            </span>
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 py-3.5">
          <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Clock className="size-4 text-gray-400" aria-hidden />
            Last sign-in
          </dt>
          <dd className="text-right text-xs font-medium tabular-nums text-gray-700">
            {formatDateTime(profile.lastLoginAt)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 py-3.5">
          <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <CalendarDays className="size-4 text-gray-400" aria-hidden />
            Member since
          </dt>
          <dd className="text-right text-xs font-medium tabular-nums text-gray-700">
            {formatDateTime(profile.createdAt)}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
