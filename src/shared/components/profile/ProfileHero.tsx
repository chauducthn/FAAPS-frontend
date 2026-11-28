import { useRef } from 'react';
import { Camera, SpinnerGap as Loader2, Trash } from '@phosphor-icons/react';
import { UserAvatar, initialsOf } from '@/shared/components/common/UserAvatar';
import { useAvatarUpload } from '@/shared/hooks/useAvatarUpload';
import { toolbarButtonClass } from '@/shared/components/ui/MenuParts';

export { initialsOf };

const AVATAR_OVERLAY_CLASS =
  'group absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white transition-colors ' +
  'hover:bg-black/45 focus-visible:bg-black/45 focus-visible:outline-none disabled:cursor-wait';

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
    <section className="@container rounded-lg border border-line bg-white">
      <div className="flex flex-col gap-4 p-5 @[36rem]:flex-row @[36rem]:items-center @[36rem]:justify-between @[36rem]:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0">
            <UserAvatar
              name={fullName}
              avatarUrl={avatarUrl}
              className="size-16 rounded-full ring-1 ring-line"
              textClassName="text-lg font-semibold"
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
                  className={AVATAR_OVERLAY_CLASS}
                >
                  {busy ? (
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                  ) : (
                    <Camera
                      className="size-5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                      aria-hidden
                    />
                  )}
                </button>
              </>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-[-0.02em] text-ink-primary">
                {isLoading ? 'My Profile' : (fullName || 'My Profile')}
              </h1>
              {roleBadge && (
                <span className="inline-flex items-center rounded-sm bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium text-brand-ink">
                  {roleBadge}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[13px] text-ink-muted">{subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {editableAvatar && (
            <>
              {avatarUrl && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeAvatar()}
                  className={toolbarButtonClass('secondary', 'border-transparent hover:bg-red-50 hover:text-red-600')}
                >
                  <Trash className="size-4" />
                  Remove
                </button>
              )}
              <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={toolbarButtonClass()}>
                {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4 text-ink-subtle" />}
                {isUploading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
              </button>
            </>
          )}
          {action}
        </div>
      </div>
    </section>
  );
}
