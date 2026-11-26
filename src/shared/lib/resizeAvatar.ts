/** Center-crops and resizes an uploaded image file to a crisp square avatar before upload. */
export async function resizeAvatarFile(file: File, size = 256): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/webp', 0.88),
    );
    if (!blob) return file;
    return new File([blob], 'avatar.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}
