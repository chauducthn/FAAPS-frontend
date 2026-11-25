import type { AdminUserDetail } from '../types/admin';
import { formatUserDate, UserDetailField, UserDetailSection } from './UserDetailBits';

export function UserDetailBody({
  user,
  isStudent,
}: {
  user: AdminUserDetail;
  isStudent: boolean;
}) {
  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-white px-6 py-5">
      <UserDetailSection title="Account">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <UserDetailField label="Full name" value={user.fullName} />
          <UserDetailField label="Identifier" value={user.userId} mono />
          <UserDetailField label="Email" value={user.email} />
          <UserDetailField label="Account status" value={user.status} />
        </div>
      </UserDetailSection>

      {isStudent && (
        <UserDetailSection title="Academic record" bordered>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <UserDetailField label="Major" value={user.majorName} />
            <UserDetailField label="Curriculum" value={user.curriculumCode} mono />
            <UserDetailField label="Current semester" value={user.currentSemester} />
            <UserDetailField label="Academic status" value={user.academicStatus} />
          </div>
        </UserDetailSection>
      )}

      <UserDetailSection title="Activity" bordered>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <UserDetailField label="Created" value={formatUserDate(user.createdAt)} />
          <UserDetailField label="Last updated" value={formatUserDate(user.updatedAt)} />
        </div>
      </UserDetailSection>
    </div>
  );
}
