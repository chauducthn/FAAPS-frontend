import { CalendarDays, Clock, Shield, UserCheck } from 'lucide-react';
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
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Account overview</h2>
      <p className="mt-1 text-sm text-slate-600">Identity and access summary.</p>

      <ul className="mt-5 space-y-4 text-sm">
        <li className="flex items-start gap-3">
          <Shield className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
            <p className="font-semibold text-slate-900">{profile.role}</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <UserCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
            <p className="font-semibold text-slate-900">{profile.status}</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Clock className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last sign-in</p>
            <p className="font-semibold text-slate-900">{formatDateTime(profile.lastLoginAt)}</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member since</p>
            <p className="font-semibold text-slate-900">{formatDateTime(profile.createdAt)}</p>
          </div>
        </li>
      </ul>
    </aside>
  );
}
