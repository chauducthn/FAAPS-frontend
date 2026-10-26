import { Modal } from '../ui/Modal';
import { StatusBadge } from './StatusBadge';
import { useAdminUser } from '../../hooks/queries/useAdminUsers';

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: '2-digit',
});

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return <div className="rounded-lg bg-[#f7f8fa] px-3 py-2.5">
    <p className="text-[11px] font-semibold uppercase text-[#555f6f]">{label}</p>
    <p className="mt-1 text-sm font-semibold text-[#151c27]">{value || '—'}</p>
  </div>;
}

export function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { data: user, isLoading, isError, refetch } = useAdminUser(userId);
  return <Modal open={!!userId} onClose={onClose} title="User Details">
    {!user ? <div className="p-8 text-center text-sm text-[#555f6f]">
      {isLoading ? 'Loading...' : isError ? <button type="button" onClick={() => refetch()}>Could not load this account. Retry</button> : null}
    </div> : <>
      <div className="border-b border-[#e5e7eb] p-6">
        <h2 className="text-xl font-semibold text-[#151c27]">User Details</h2>
        <p className="mt-1 text-sm text-[#555f6f]">{user.userId}</p>
      </div>
      <div className="grid max-h-[65vh] gap-3 overflow-y-auto p-6 sm:grid-cols-2">
        <Field label={user.role === 'STUDENT' ? 'Roll Number' : 'User ID'} value={user.userId} />
        <Field label="Full Name" value={user.fullName} />
        <Field label="Email" value={user.email} />
        <Field label="Role" value={user.role} />
        <div className="rounded-lg bg-[#f7f8fa] px-3 py-2.5"><p className="text-[11px] font-semibold uppercase text-[#555f6f]">Status</p><StatusBadge status={user.status} /></div>
        <Field label="Created At" value={formatDate(user.createdAt)} />
        <Field label="Updated At" value={formatDate(user.updatedAt)} />
        {user.role === 'STUDENT' && <>
          <Field label="Major" value={user.majorName} />
          <Field label="Curriculum" value={user.curriculumCode} />
          <Field label="Current Semester" value={user.currentSemester} />
          <Field label="Academic Status" value={user.academicStatus} />
        </>}
      </div>
      <div className="flex justify-end border-t border-[#e5e7eb] p-4">
        <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold">Close</button>
      </div>
    </>}
  </Modal>;
}
