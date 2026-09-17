import { extractGoogleDriveFileId } from "./utils";
import { SITE_URL } from "./seoHead";

/**
 * Validates and sanitizes an image URL.
 * Returns null if the URL is empty or points to a placeholder service.
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes("placeholder")) return null;
  return trimmed;
}

/**
 * Sanitizes an array of image URLs, removing nulls and placeholders.
 */
export function sanitizeImageArray(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => (typeof img === "string" ? sanitizeImageUrl(img) : null))
    .filter((img): img is string => Boolean(img));
}

/**
 * Resolves all available images for a product as an array of full URLs.
 * Order of priority:
 * 1. Sanitized thumbnail_url
 * 2. Sanitized array of images
 * 3. High-resolution Google Drive preview thumbnail
 * 4. Fallback site og-image.png
 * Guarantees at least 1 image URL is returned so schema validation never fails.
 */
export function resolveAllProductImages(product: {
  thumbnail_url?: string | null | undefined;
  images?: string[] | null | undefined;
  google_drive_link?: string | null | undefined;
}): string[] {
  const list: string[] = [];
  const thumb = sanitizeImageUrl(product.thumbnail_url);
  if (thumb) {
    list.push(thumb.startsWith("http") ? thumb : `${SITE_URL}${thumb.startsWith("/") ? "" : "/"}${thumb}`);
  }

  const cleanImages = sanitizeImageArray(product.images);
  for (const img of cleanImages) {
    const fullImg = img.startsWith("http") ? img : `${SITE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    if (!list.includes(fullImg)) {
      list.push(fullImg);
    }
  }

  if (list.length === 0 && product.google_drive_link) {
    const fileId = extractGoogleDriveFileId(product.google_drive_link);
    if (fileId && !fileId.startsWith("sample")) {
      list.push(`https://lh3.googleusercontent.com/d/${fileId}=w1200`);
    }
  }

  if (list.length === 0) {
    list.push(`${SITE_URL}/og-image.png`);
  }

  return list;
}

/**
 * Resolves the best available unique image URL for a product:
 * 1. Explicit thumbnail_url (if not placeholder)
 * 2. First image from images array (if not placeholder)
 * 3. High-resolution Google Drive preview thumbnail via lh3.googleusercontent.com
 * 4. Fallback site og-image.png
 */
export function resolveProductImage(product: {
  thumbnail_url?: string | null | undefined;
  images?: string[] | null | undefined;
  google_drive_link?: string | null | undefined;
}): string {
  const all = resolveAllProductImages(product);
  return all[0] || `${SITE_URL}/og-image.png`;
}

