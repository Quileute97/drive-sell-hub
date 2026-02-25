import { useState } from "react";
import { getGoogleDriveThumbnail } from "@/lib/utils";
import { 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileArchive, 
  FileCode, 
  File,
  BookOpen
} from "lucide-react";

interface ProductThumbnailProps {
  googleDriveLink: string | null;
  thumbnailUrl?: string | null;
  fileFormat?: string | null;
  title: string;
  size?: number;
  className?: string;
  /** Set to "eager" for above-the-fold images (LCP optimization) */
  loading?: "lazy" | "eager";
  /** Set to "high" for LCP images */
  fetchPriority?: "high" | "low" | "auto";
}

// File formats that can show preview from Google Drive
const PREVIEWABLE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

// Get icon and color based on file format
const getFileTypeConfig = (format: string | null | undefined) => {
  const normalizedFormat = (format || '').toLowerCase().trim();
  
  const configs: Record<string, { icon: typeof File; color: string; bgColor: string; label: string }> = {
    // Documents
    'pdf': { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950', label: 'PDF' },
    'doc': { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950', label: 'DOC' },
    'docx': { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950', label: 'DOCX' },
    
    // Spreadsheets
    'xls': { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950', label: 'XLS' },
    'xlsx': { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950', label: 'XLSX' },
    'csv': { icon: FileSpreadsheet, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950', label: 'CSV' },
    
    // Presentations
    'ppt': { icon: Presentation, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950', label: 'PPT' },
    'pptx': { icon: Presentation, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950', label: 'PPTX' },
    
    // Images
    'jpg': { icon: FileImage, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950', label: 'JPG' },
    'jpeg': { icon: FileImage, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950', label: 'JPEG' },
    'png': { icon: FileImage, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950', label: 'PNG' },
    'gif': { icon: FileImage, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950', label: 'GIF' },
    'webp': { icon: FileImage, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950', label: 'WEBP' },
    'svg': { icon: FileImage, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950', label: 'SVG' },
    'psd': { icon: FileImage, color: 'text-blue-700', bgColor: 'bg-blue-50 dark:bg-blue-950', label: 'PSD' },
    'ai': { icon: FileImage, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950', label: 'AI' },
    
    // Video
    'mp4': { icon: FileVideo, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-950', label: 'MP4' },
    'mov': { icon: FileVideo, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-950', label: 'MOV' },
    'avi': { icon: FileVideo, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-950', label: 'AVI' },
    'mkv': { icon: FileVideo, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-950', label: 'MKV' },
    
    // Audio
    'mp3': { icon: FileAudio, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950', label: 'MP3' },
    'wav': { icon: FileAudio, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950', label: 'WAV' },
    'flac': { icon: FileAudio, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950', label: 'FLAC' },
    
    // Archives
    'zip': { icon: FileArchive, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950', label: 'ZIP' },
    'rar': { icon: FileArchive, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950', label: 'RAR' },
    '7z': { icon: FileArchive, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950', label: '7Z' },
    
    // Code
    'html': { icon: FileCode, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950', label: 'HTML' },
    'css': { icon: FileCode, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950', label: 'CSS' },
    'js': { icon: FileCode, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950', label: 'JS' },
    'json': { icon: FileCode, color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-900', label: 'JSON' },
    
    // Ebook
    'epub': { icon: BookOpen, color: 'text-teal-500', bgColor: 'bg-teal-50 dark:bg-teal-950', label: 'EPUB' },
    'mobi': { icon: BookOpen, color: 'text-teal-500', bgColor: 'bg-teal-50 dark:bg-teal-950', label: 'MOBI' },
  };
  
  return configs[normalizedFormat] || { icon: File, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-900', label: normalizedFormat?.toUpperCase() || 'FILE' };
};

// Check if file format supports Google Drive preview
const canShowPreview = (format: string | null | undefined): boolean => {
  if (!format) return true; // Try preview if no format specified
  return PREVIEWABLE_FORMATS.includes(format.toLowerCase().trim());
};

export const ProductThumbnail = ({
  googleDriveLink,
  thumbnailUrl,
  fileFormat,
  title,
  size = 600,
  className = "",
  loading = "lazy",
  fetchPriority = "auto",
}: ProductThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const config = getFileTypeConfig(fileFormat);
  const IconComponent = config.icon;
  
  // Get the image source - check if it's a valid URL (not placeholder)
  const rawImageSrc = thumbnailUrl || getGoogleDriveThumbnail(googleDriveLink, size);
  const hasValidImage = rawImageSrc && rawImageSrc !== "/placeholder.svg";
  const canPreview = canShowPreview(fileFormat);
  
  // Show default icon if: no valid image, or image failed, or format can't preview
  const shouldShowIcon = !hasValidImage || imageError || !canPreview;
  
  if (shouldShowIcon) {
    // Show default thumbnail based on file format
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center ${config.bgColor} ${className}`}>
        <IconComponent className={`w-16 h-16 md:w-20 md:h-20 ${config.color} mb-3`} strokeWidth={1.5} />
        <span className={`text-sm font-semibold ${config.color} px-3 py-1 rounded-full bg-white/80 dark:bg-black/30`}>
          {config.label}
        </span>
      </div>
    );
  }
  
  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <IconComponent className={`w-12 h-12 ${config.color} opacity-50`} />
        </div>
      )}
      
      <img
        src={rawImageSrc}
        alt={`Hình ảnh sản phẩm ${title}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        width={size}
        height={Math.round(size * 0.75)}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
      />
    </div>
  );
};
