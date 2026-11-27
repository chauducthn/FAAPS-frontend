import type { AdminUserDetail } from '../types/admin';
import { StatusBadge } from './StatusBadge';
import { formatUserDate, UserDetailField, UserDetailSection } from './UserDetailBits';

/**
 * Facts that are not already in the header (name, email, identifier, role and status live there).
 * Sized to fit the dialog without scrolling.
 */
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
    <div className="space-y-5 px-6 py-5">
      {isStudent ? (
        <UserDetailSection title="Academic record">
          <UserDetailField label="Major" value={majorDisplay} />
          <UserDetailField label="Curriculum" value={curriculumDisplay} />
          <UserDetailField label="Cohort" value={user.curriculumCode} mono />
          <UserDetailField
            label="Academic status"
            value={user.academicStatus ? <StatusBadge status={user.academicStatus} /> : null}
          />
          <UserDetailField
            label="Current semester"
            value={user.currentSemester != null ? `Semester ${user.currentSemester}` : null}
          />
          <UserDetailField label="Enrollment semester" value={user.enrollmentSemesterCode} mono />
          <UserDetailField label="Expected graduation" value={user.expectedGraduationSemesterCode} mono />
        </UserDetailSection>
      ) : (
        <UserDetailSection title="Role">
          <UserDetailField label="Role" value="Academic advisor" />
          <UserDetailField label="Academic record" value="Not applicable" />
        </UserDetailSection>
      )}

      <UserDetailSection title="Activity">
        <UserDetailField label="Created" value={formatUserDate(user.createdAt)} />
        <UserDetailField label="Last updated" value={formatUserDate(user.updatedAt)} />
      </UserDetailSection>
    </div>
  );
}
