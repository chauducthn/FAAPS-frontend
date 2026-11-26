import { useRef } from 'react';
import { Camera, SpinnerGap as Loader2, Trash } from '@phosphor-icons/react';
import { UserAvatar, initialsOf } from '@/shared/components/common/UserAvatar';
import { useAvatarUpload } from '@/shared/hooks/useAvatarUpload';

export { initialsOf };

interface ProfileHeroProps {
  fullName?: string | null;
  subtitle: string;
  avatarUrl?: string | null;
  roleBadge?: string;
  isLoading?: boolean;
  editableAvatar?: boolean;
  action?: React.ReactNode;
}

export function ProfileHero({
  fullName,
  subtitle,
  avatarUrl,
  roleBadge,
  isLoading,
  editableAvatar = true,
  action,
}: ProfileHeroProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, removeAvatar, isUploading, isRemoving } = useAvatarUpload();
  const busy = isUploading || isRemoving;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadAvatar(file);
    event.target.value = '';
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="h-2 w-full bg-gradient-to-r from-[#F26F21] via-orange-400 to-amber-300" aria-hidden />
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0">
            <UserAvatar
              name={fullName}
              avatarUrl={avatarUrl}
              className="size-16 rounded-2xl ring-2 ring-orange-100 sm:size-18"
              textClassName="text-xl font-bold"
              fallbackIconClassName="size-7"
            />
            {editableAvatar && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  aria-label="Upload profile photo"
                  className="hidden"
                  disabled={busy}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  title="Change profile photo"
                  aria-label="Change profile photo"
                  className="group absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 text-white transition-colors hover:bg-black/45 focus-visible:bg-black/45 focus-visible:outline-none disabled:cursor-wait"
                >
                  {busy ? (
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                  ) : (
                    <Camera className="size-5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
                  )}
                </button>
              </>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
                {isLoading ? 'My Profile' : (fullName || 'My Profile')}
              </h1>
              {roleBadge && (
                <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#C2410C] ring-1 ring-inset ring-orange-200/80">
                  {roleBadge}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[13px] text-gray-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {editableAvatar && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                {isUploading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeAvatar()}
                  className="inline-flex h-8.5 items-center gap-1 rounded-lg border border-transparent px-2.5 text-xs font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash className="size-3.5" />
                  Remove
                </button>
              )}
            </>
          )}
          {action}
        </div>
      </div>
    </section>
  );
}
