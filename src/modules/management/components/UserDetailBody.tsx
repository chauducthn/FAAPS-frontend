import { BookOpenCheck, CalendarClock, GraduationCap, LayoutGrid, Mail, ShieldCheck, UserRound } from 'lucide-react';
import type { AdminUserDetail } from '../types/admin';
import { formatUserDate, UserDetailField, UserDetailPanel } from './UserDetailBits';

export type UserDetailTabKey = 'profile' | 'academic' | 'status';

export function UserDetailBody({
  tab,
  user,
  isStudent,
}: {
  tab: UserDetailTabKey;
  user: AdminUserDetail;
  isStudent: boolean;
}) {
  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fafbfd] p-5 text-[13px]">
      {tab === 'profile' && (
        <UserDetailPanel icon={<LayoutGrid className="size-4" />} title="Personal information">
          <div className="grid gap-3 sm:grid-cols-2">
            <UserDetailField icon={<UserRound className="size-3.5" />} label="Full name" value={user.fullName} />
            <UserDetailField icon={<Mail className="size-3.5" />} label="Email" value={user.email} />
            <UserDetailField icon={<ShieldCheck className="size-3.5" />} label="Identifier" value={user.userId} mono />
          </div>
        </UserDetailPanel>
      )}

      {tab === 'academic' &&
        (isStudent ? (
          <UserDetailPanel icon={<GraduationCap className="size-4" />} title="Academic record">
            <div className="grid gap-3 sm:grid-cols-2">
              <UserDetailField icon={<BookOpenCheck className="size-3.5" />} label="Major" value={user.majorName} />
              <UserDetailField icon={<BookOpenCheck className="size-3.5" />} label="Curriculum" value={user.curriculumCode} mono />
              <UserDetailField icon={<GraduationCap className="size-3.5" />} label="Current semester" value={user.currentSemester} />
              <UserDetailField icon={<ShieldCheck className="size-3.5" />} label="Academic status" value={user.academicStatus} />
            </div>
          </UserDetailPanel>
        ) : (
          <UserDetailPanel icon={<UserRound className="size-4" />} title="Advisory work">
            <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-xs text-gray-500">
              No academic record for an advisor account.
            </p>
          </UserDetailPanel>
        ))}

      {tab === 'status' && (
        <>
          <UserDetailPanel icon={<ShieldCheck className="size-4" />} title="Account status">
            <div className="grid gap-3 sm:grid-cols-2">
              <UserDetailField icon={<ShieldCheck className="size-3.5" />} label="Status" value={user.status} />
              <UserDetailField icon={<GraduationCap className="size-3.5" />} label="Academic status" value={user.academicStatus} />
            </div>
          </UserDetailPanel>
          <UserDetailPanel icon={<CalendarClock className="size-4" />} title="Timeline">
            <div className="grid gap-3 sm:grid-cols-2">
              <UserDetailField icon={<CalendarClock className="size-3.5" />} label="Created" value={formatUserDate(user.createdAt)} />
              <UserDetailField icon={<CalendarClock className="size-3.5" />} label="Last updated" value={formatUserDate(user.updatedAt)} />
            </div>
          </UserDetailPanel>
        </>
      )}
    </div>
  );
}
