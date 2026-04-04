import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract Google Drive file ID from various Google Drive URL formats
 */
export function extractGoogleDriveFileId(driveUrl: string | null): string | null {
  if (!driveUrl) return null;
  
  // Format: https://drive.google.com/file/d/{FILE_ID}/view
  const fileMatch = driveUrl.match(/\/file\/d\/([^\/]+)/);
  if (fileMatch) return fileMatch[1];
  
  // Format: https://drive.google.com/open?id={FILE_ID}
  const openMatch = driveUrl.match(/[?&]id=([^&]+)/);
  if (openMatch) return openMatch[1];
  
  return null;
}

/**
 * Get primary Google Drive thumbnail URL
 */
export function getGoogleDriveThumbnail(driveUrl: string | null, size: number = 400): string {
  const fileId = extractGoogleDriveFileId(driveUrl);
  if (!fileId) return "/placeholder.svg";
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * Get fallback thumbnail URL via lh3.googleusercontent.com
 * More reliable for DOCX, PPTX, XLSX and other non-PDF formats
 */
export function getGoogleDriveThumbnailFallback(driveUrl: string | null, size: number = 400): string | null {
  const fileId = extractGoogleDriveFileId(driveUrl);
  if (!fileId) return null;
  return `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;
}
