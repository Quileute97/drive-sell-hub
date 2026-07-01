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
  const fileMatch = driveUrl.match(/\/file\/d\/([^\/?#]+)/);
  if (fileMatch) return fileMatch[1];
  
  // Google Workspace URLs: /document/d/{ID}, /presentation/d/{ID}, /spreadsheets/d/{ID}, /forms/d/{ID}
  const workspaceMatch = driveUrl.match(/\/(?:document|presentation|spreadsheets|forms)\/d\/([^\/?#]+)/);
  if (workspaceMatch) return workspaceMatch[1];
  
  // Format: https://drive.google.com/open?id={FILE_ID} or ?id={FILE_ID}
  const openMatch = driveUrl.match(/[?&]id=([^&#]+)/);
  if (openMatch) return openMatch[1];
  
  // Folder URL (last resort): /folders/{ID}
  const folderMatch = driveUrl.match(/\/folders\/([^\/?#]+)/);
  if (folderMatch) return folderMatch[1];
  
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

/**
 * Get all possible Google Drive thumbnail URLs in priority order.
 * Office formats (DOCX, PPTX, XLSX) often need multiple fallbacks because
 * Google generates previews lazily and serves them from different hosts.
 */
export function getGoogleDriveThumbnailSources(driveUrl: string | null, size: number = 400): string[] {
  const fileId = extractGoogleDriveFileId(driveUrl);
  if (!fileId) return [];

  const sources: string[] = [];

  // Google Workspace native export endpoints (best for Slides/Docs/Sheets)
  if (driveUrl?.includes('/presentation/d/')) {
    sources.push(`https://docs.google.com/presentation/d/${fileId}/export/png?pageid=p1`);
    sources.push(`https://docs.google.com/presentation/d/${fileId}/export/png`);
  } else if (driveUrl?.includes('/document/d/')) {
    sources.push(`https://docs.google.com/document/d/${fileId}/export?format=png`);
  } else if (driveUrl?.includes('/spreadsheets/d/')) {
    sources.push(`https://docs.google.com/spreadsheets/d/${fileId}/export?format=png`);
  }

  sources.push(
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}-h${Math.round(size * 0.75)}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w${size}`,
    `https://lh3.googleusercontent.com/d/${fileId}=s${size}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w${size}-h${Math.round(size * 0.75)}`,
  );

  return sources;
}
