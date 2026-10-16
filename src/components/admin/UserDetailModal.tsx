import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { StatusBadge } from './StatusBadge';
import { UserAvatar } from './UserAvatar';
import { useAdminUser, useUpdateUser } from '../../hooks/queries/useAdminUsers';
import { apiErrorMessage } from '../../lib/apiError';
import type { AdminUserDetail } from '../../types/admin';
import { toast } from 'sonner';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

function ReadField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{label}</p>
      <div className="mt-1 text-sm font-semibold text-[#151c27]">{children ?? '—'}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[#151c27]">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const orDash = (v: string | number | null | undefined) => (v === null || v === undefined || v === '' ? '—' : v);

interface UserDetailModalProps {
  userId: string | null;
  startInEdit?: boolean;
  onClose: () => void;
}

export function UserDetailModal({ userId, startInEdit = false, onClose }: UserDetailModalProps) {
  const { data: user, isLoading, isError, refetch } = useAdminUser(userId);
  const [editing, setEditing] = useState(startInEdit);

  useEffect(() => setEditing(startInEdit), [userId, startInEdit]);

  return (
    <Modal open={!!userId} onClose={onClose} title="User Details">
      {isLoading || !user ? (
        <div className="p-8 text-center text-sm text-[#555f6f]">
          {isError ? (
            <>
              Could not load this account.{' '}
              <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
                Retry
              </button>
            </>
          ) : (
            'Loading...'
          )}
        </div>
      ) : editing ? (
        <EditForm user={user} onCancel={onClose} onSaved={() => setEditing(false)} />
      ) : (
        <ViewPanel user={user} onEdit={() => setEditing(true)} onClose={onClose} />
      )}
    </Modal>
  );
}

function Header({ user, right, mode }: { user: AdminUserDetail; right: React.ReactNode; mode?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#151c27]">User Details</h2>
        <p className="mt-1 text-[13px] text-[#555f6f]">
          {user.role === 'STUDENT' ? 'Roll Number' : user.role === 'ADVISOR' ? 'Advisor Code' : 'Admin'}: {user.userId}
          {user.majorName ? ` · ${user.majorName}` : ''}
          {mode ? ` · ${mode}` : ''}
        </p>
      </div>
      {right}
    </div>
  );
}

function ViewPanel({ user, onEdit, onClose }: { user: AdminUserDetail; onEdit: () => void; onClose: () => void }) {
  return (
    <>
      <Header
        user={user}
        right={
          <button type="button" onClick={onEdit} className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]">
            Edit
          </button>
        }
      />
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <Section title="Identity">
          <ReadField label={user.role === 'STUDENT' ? 'Roll Number' : user.role === 'ADVISOR' ? 'Advisor Code' : 'Login ID'}>
            {user.userId}
          </ReadField>
          <ReadField label="Name">
            <span className="flex items-center gap-2">
              <UserAvatar name={user.fullName} src={user.avatarUrl} className="size-9" />
              {user.fullName}
            </span>
          </ReadField>
          <ReadField label="Email">{user.email}</ReadField>
          <ReadField label="Phone">{orDash(user.phone)}</ReadField>
          <ReadField label="Role">{user.role}</ReadField>
          <ReadField label="Status">
            <StatusBadge status={user.status} />
          </ReadField>
          <ReadField label="Created At">{formatDate(user.createdAt)}</ReadField>
          <ReadField label="Updated At">{formatDate(user.updatedAt)}</ReadField>
        </Section>

        {user.role === 'STUDENT' && (
          <Section title="Academic">
            <ReadField label="Major">{orDash(user.majorName)}</ReadField>
            <ReadField label="Curriculum Code">{orDash(user.curriculumCode)}</ReadField>
            <ReadField label="Current Semester">{orDash(user.currentSemester)}</ReadField>
            <ReadField label="Academic Status">{orDash(user.academicStatus)}</ReadField>
          </Section>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-[#e5e7eb] p-4 sm:px-6">
        <p className="text-[13px] text-[#555f6f]">Read-only details</p>
        <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200">
          Close
        </button>
      </div>
    </>
  );
}

function EditForm({ user, onCancel, onSaved }: { user: AdminUserDetail; onCancel: () => void; onSaved: () => void }) {
  const update = useUpdateUser();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarFile) return setPreview(null);
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const onPickFile = (file?: File) => {
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) return setError('Avatar must be a JPEG, PNG or WebP image.');
    if (file.size > MAX_AVATAR_BYTES) return setError('Avatar must be 2 MB or smaller.');
    setError(null);
    setAvatarFile(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return setError('Full name is required.');
    if (fullName.trim().length > 255) return setError('Full name must be at most 255 characters.');
    if (phone.length > 20) return setError('Phone must be at most 20 characters.');
    setError(null);
    try {
      await update.mutateAsync({
        id: user.id,
        fullName: fullName.trim(),
        phone,
        avatarFile,
        avatarUrl: user.avatarUrl,
      });
      toast.success('Account updated.');
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const inputClass =
    'h-[38px] w-full rounded-lg border border-[#e5e7eb] px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
      <Header user={user} mode="Edit mode" right={<span className="text-xs font-medium uppercase text-[#f37021]">Edit mode</span>} />
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <Section title="Identity">
          <ReadField label={user.role === 'STUDENT' ? 'Roll Number' : user.role === 'ADVISOR' ? 'Advisor Code' : 'Login ID'}>
            {user.userId}
          </ReadField>
          <ReadField label="Email">{user.email}</ReadField>

          <label className="flex flex-col gap-1 text-sm font-semibold text-[#151c27]">
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={255} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[#151c27]">
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className={inputClass} placeholder="—" />
          </label>

          <div className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] p-3 sm:col-span-2">
            <UserAvatar name={fullName || user.fullName} src={preview ?? user.avatarUrl} className="size-14" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#151c27]">Avatar</p>
              <p className="truncate text-xs text-[#555f6f]">
                {avatarFile ? `${avatarFile.name} — saved with changes` : 'JPEG, PNG or WebP, up to 2 MB'}
              </p>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept={AVATAR_TYPES.join(',')}
              className="hidden"
              onChange={(e) => {
                onPickFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-[#f37021] px-3 py-1.5 text-xs font-semibold text-[#f37021] hover:bg-[#fff7ed]"
            >
              <Upload className="size-3.5" />
              Upload / Replace
            </button>
          </div>

          <ReadField label="Role">{user.role}</ReadField>
          <ReadField label="Status">
            <StatusBadge status={user.status} />
          </ReadField>
        </Section>

        {user.role === 'STUDENT' && (
          <Section title="Academic">
            <ReadField label="Major">{orDash(user.majorName)}</ReadField>
            <ReadField label="Curriculum Code">{orDash(user.curriculumCode)}</ReadField>
            <ReadField label="Current Semester">{orDash(user.currentSemester)}</ReadField>
            <ReadField label="Academic Status">{orDash(user.academicStatus)}</ReadField>
          </Section>
        )}

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>
      <div className="flex flex-col items-start justify-between gap-3 border-t border-[#e5e7eb] p-4 sm:flex-row sm:items-center sm:px-6">
        <p className="text-[13px] text-[#555f6f]">Save confirms all changes, including avatar. Cancel discards them.</p>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200">
            Cancel
          </button>
          <button
            type="submit"
            disabled={update.isPending}
            className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-60"
          >
            {update.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
