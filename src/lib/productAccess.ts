export const isFreeProduct = (price: number | null | undefined) => Number(price ?? 0) <= 0;

export const getProductDownloadUrl = (
  googleDriveLink: string | null | undefined,
  downloadOnlyLink?: string | null,
) => downloadOnlyLink?.trim() || googleDriveLink?.trim() || null;