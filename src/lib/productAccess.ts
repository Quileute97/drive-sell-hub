export const isFreeProduct = (price: number | null | undefined) => Number(price ?? 0) <= 0;

export const getProductDownloadUrl = (
  googleDriveLink: string | null | undefined,
  downloadOnlyLink?: string | null,
) => downloadOnlyLink?.trim() || googleDriveLink?.trim() || null;

/**
 * Convert a Google Drive link to a preview-only URL (no download allowed).
 * Falls back to the original link if the file ID cannot be extracted.
 */
export const getGoogleDrivePreviewUrl = (
  driveUrl: string | null | undefined,
): string | null => {
  if (!driveUrl) return null;
  const fileMatch = driveUrl.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  }
  const openMatch = driveUrl.match(/[?&]id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
  }
  return driveUrl;
};