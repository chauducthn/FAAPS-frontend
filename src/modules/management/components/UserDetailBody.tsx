import type { AdminUserDetail } from '../types/admin';
import { formatUserDate, UserDetailField, UserDetailSection } from './UserDetailBits';

export function UserDetailBody({
  user,
  isStudent,
}: {
  user: AdminUserDetail;
  isStudent: boolean;
}) {
  const majorDisplay =
    user.majorCode && user.majorName
      ? `${user.majorCode} — ${user.majorName}`
      : (user.majorName ?? user.majorCode);
  const curriculumDisplay =
    user.curriculumName && user.curriculumCode
      ? `${user.majorCode ? `${user.majorCode} ` : ''}${user.curriculumCode} — ${user.curriculumName}`
      : (user.curriculumName ?? user.curriculumCode);

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

      {isStudent ? (
        <UserDetailSection title="Academic record" bordered>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <UserDetailField label="Major" value={majorDisplay} />
            <UserDetailField label="Cohort" value={user.curriculumCode} mono />
            <UserDetailField label="Curriculum" value={curriculumDisplay} />
            <UserDetailField label="Academic status" value={user.academicStatus} />
            <UserDetailField label="Enrollment semester" value={user.enrollmentSemesterCode} mono />
            <UserDetailField label="Current semester" value={user.currentSemester} />
            <UserDetailField label="Expected graduation" value={user.expectedGraduationSemesterCode} mono />
          </div>
        </UserDetailSection>
      ) : (
        <UserDetailSection title="Role details" bordered>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <UserDetailField label="Role" value="Academic Advisor" />
            <UserDetailField label="Academic record" value="Not applicable" />
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
