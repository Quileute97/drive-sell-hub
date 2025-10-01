import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract Google Drive file ID from various Google Drive URL formats
 * and return a thumbnail URL
 */
export function getGoogleDriveThumbnail(driveUrl: string | null, size: number = 400): string {
  if (!driveUrl) return "/placeholder.svg";
  
  // Extract file ID from various Google Drive URL formats
  let fileId: string | null = null;
  
  // Format: https://drive.google.com/file/d/{FILE_ID}/view
  const fileMatch = driveUrl.match(/\/file\/d\/([^\/]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  }
  
  // Format: https://drive.google.com/open?id={FILE_ID}
  const openMatch = driveUrl.match(/[?&]id=([^&]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }
  
  if (!fileId) return "/placeholder.svg";
  
  // Return Google Drive thumbnail URL
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}
