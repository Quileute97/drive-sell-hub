import { useState, useCallback, useEffect, useRef } from "react";
import { getGoogleDriveThumbnailSources, extractGoogleDriveFileId } from "@/lib/utils";
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
  BookOpen,
} from "lucide-react";

const OFFICE_PREVIEW_FORMATS = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"];
const PREVIEWABLE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
];

interface ProductThumbnailProps {
  googleDriveLink: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  fileFormat?: string | null | undefined;
  title: string;
  size?: number | undefined;
  className?: string | undefined;
  /** Set to "eager" for above-the-fold images (LCP optimization) */
  loading?: "lazy" | "eager" | undefined;
  /** Set to "high" for LCP images */
  fetchPriority?: "high" | "low" | "auto" | undefined;
  /** Disable nested iframes inside cards by default for performance and accessibility */
  allowIframePreview?: boolean | undefined;
}

const getFileTypeConfig = (format: string | null | undefined) => {
  const normalizedFormat = (format || "").toLowerCase().trim();

  const configs: Record<string, { icon: typeof File; color: string; bgColor: string; label: string }> = {
    pdf: { icon: FileText, color: "text-red-700", bgColor: "bg-muted", label: "PDF" },
    doc: { icon: FileText, color: "text-primary", bgColor: "bg-muted", label: "DOC" },
    docx: { icon: FileText, color: "text-primary", bgColor: "bg-muted", label: "DOCX" },

    xls: { icon: FileSpreadsheet, color: "text-emerald-700", bgColor: "bg-muted", label: "XLS" },
    xlsx: { icon: FileSpreadsheet, color: "text-emerald-700", bgColor: "bg-muted", label: "XLSX" },
    csv: { icon: FileSpreadsheet, color: "text-emerald-700", bgColor: "bg-muted", label: "CSV" },

    ppt: { icon: Presentation, color: "text-amber-700", bgColor: "bg-muted", label: "PPT" },
    pptx: { icon: Presentation, color: "text-amber-700", bgColor: "bg-muted", label: "PPTX" },

    jpg: { icon: FileImage, color: "text-primary", bgColor: "bg-muted", label: "JPG" },
    jpeg: { icon: FileImage, color: "text-primary", bgColor: "bg-muted", label: "JPEG" },
    png: { icon: FileImage, color: "text-primary", bgColor: "bg-muted", label: "PNG" },
    gif: { icon: FileImage, color: "text-primary", bgColor: "bg-muted", label: "GIF" },
    webp: { icon: FileImage, color: "text-primary", bgColor: "bg-muted", label: "WEBP" },
    svg: { icon: FileImage, color: "text-primary", bgColor: "bg-muted", label: "SVG" },
    psd: { icon: FileImage, color: "text-primary", bgColor: "bg-muted", label: "PSD" },
    ai: { icon: FileImage, color: "text-amber-700", bgColor: "bg-muted", label: "AI" },

    mp4: { icon: FileVideo, color: "text-primary", bgColor: "bg-muted", label: "MP4" },
    mov: { icon: FileVideo, color: "text-primary", bgColor: "bg-muted", label: "MOV" },
    avi: { icon: FileVideo, color: "text-primary", bgColor: "bg-muted", label: "AVI" },
    mkv: { icon: FileVideo, color: "text-primary", bgColor: "bg-muted", label: "MKV" },

    mp3: { icon: FileAudio, color: "text-amber-700", bgColor: "bg-muted", label: "MP3" },
    wav: { icon: FileAudio, color: "text-amber-700", bgColor: "bg-muted", label: "WAV" },
    flac: { icon: FileAudio, color: "text-amber-700", bgColor: "bg-muted", label: "FLAC" },

    zip: { icon: FileArchive, color: "text-amber-700", bgColor: "bg-muted", label: "ZIP" },
    rar: { icon: FileArchive, color: "text-amber-700", bgColor: "bg-muted", label: "RAR" },
    "7z": { icon: FileArchive, color: "text-amber-700", bgColor: "bg-muted", label: "7Z" },

    html: { icon: FileCode, color: "text-primary", bgColor: "bg-muted", label: "HTML" },
    css: { icon: FileCode, color: "text-primary", bgColor: "bg-muted", label: "CSS" },
    js: { icon: FileCode, color: "text-amber-700", bgColor: "bg-muted", label: "JS" },
    json: { icon: FileCode, color: "text-muted-foreground", bgColor: "bg-muted", label: "JSON" },

    epub: { icon: BookOpen, color: "text-emerald-700", bgColor: "bg-muted", label: "EPUB" },
    mobi: { icon: BookOpen, color: "text-emerald-700", bgColor: "bg-muted", label: "MOBI" },
  };

  return (
    configs[normalizedFormat] || {
      icon: File,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      label: normalizedFormat?.toUpperCase() || "FILE",
    }
  );
};

const canShowPreview = (format: string | null | undefined): boolean => {
  if (!format) return true;
  return PREVIEWABLE_FORMATS.includes(format.toLowerCase().trim());
};

const isGoogleDriveWebUrl = (url: string): boolean => {
  if (!url) return false;
  if (url.includes("googleusercontent.com")) return false;
  if (url.includes("drive.google.com/thumbnail")) return false;
  if (url.includes("/export")) return false;
  return (
    url.includes("drive.google.com/") ||
    url.includes("docs.google.com/")
  );
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
  allowIframePreview = false,
}: ProductThumbnailProps) => {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrcIndex(0);
    setAllFailed(false);
    setLoaded(false);
  }, [thumbnailUrl, googleDriveLink, fileFormat]);

  const config = getFileTypeConfig(fileFormat);
  const IconComponent = config.icon;

  const imageSources: string[] = [];
  if (thumbnailUrl && thumbnailUrl !== "/placeholder.svg") {
    if (isGoogleDriveWebUrl(thumbnailUrl)) {
      imageSources.push(...getGoogleDriveThumbnailSources(thumbnailUrl, size));
    } else {
      imageSources.push(thumbnailUrl);
    }
  }

  const canPreview = canShowPreview(fileFormat);
  if (canPreview && googleDriveLink) {
    imageSources.push(...getGoogleDriveThumbnailSources(googleDriveLink, size));
  }

  const uniqueSources = [...new Set(imageSources)];

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete) {
      if (el.naturalWidth > 0) {
        setLoaded(true);
      } else {
        const nextIndex = currentSrcIndex + 1;
        if (nextIndex < uniqueSources.length) {
          setCurrentSrcIndex(nextIndex);
        } else {
          setAllFailed(true);
        }
      }
    }
  }, [currentSrcIndex, uniqueSources.length]);

  const handleError = useCallback(() => {
    const nextIndex = currentSrcIndex + 1;
    if (nextIndex < uniqueSources.length) {
      setCurrentSrcIndex(nextIndex);
    } else {
      setAllFailed(true);
    }
  }, [currentSrcIndex, uniqueSources.length]);

  const fallbackLayer = (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-1.5 ${config.bgColor} px-3 text-center`}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-surface ring-1 ring-border">
        <IconComponent className={`h-5 w-5 ${config.color}`} />
      </span>
      <span className="text-xs font-medium text-muted-foreground">Chưa có ảnh bìa</span>
      <span className="text-xs font-semibold text-foreground/80">{config.label}</span>
    </div>
  );

  if (uniqueSources.length === 0 || allFailed || !canPreview) {
    if (allowIframePreview) {
      const normalizedFormat = (fileFormat || "").toLowerCase().trim();
      const fileId = extractGoogleDriveFileId(googleDriveLink ?? null);
      const isWorkspace =
        googleDriveLink?.includes("/presentation/d/") ||
        googleDriveLink?.includes("/document/d/") ||
        googleDriveLink?.includes("/spreadsheets/d/");
      if (fileId && (OFFICE_PREVIEW_FORMATS.includes(normalizedFormat) || isWorkspace)) {
        let previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        if (googleDriveLink?.includes("/presentation/d/")) {
          previewUrl = `https://docs.google.com/presentation/d/${fileId}/preview`;
        } else if (googleDriveLink?.includes("/document/d/")) {
          previewUrl = `https://docs.google.com/document/d/${fileId}/preview`;
        } else if (googleDriveLink?.includes("/spreadsheets/d/")) {
          previewUrl = `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
        }
        return (
          <div className={`w-full h-full relative overflow-hidden ${config.bgColor} ${className}`}>
            <iframe
              src={previewUrl}
              title={`Xem trước ${title}`}
              className="absolute inset-0 w-full h-full pointer-events-none border-0"
              loading="lazy"
              scrolling="no"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-transparent" />
            <span className="absolute bottom-2 right-2 rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-foreground ring-1 ring-border">
              {config.label}
            </span>
          </div>
        );
      }
    }

    return <div className={`h-full w-full ${className}`}>{fallbackLayer}</div>;
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-muted ${className}`}>
      {!loaded && <div className="absolute inset-0">{fallbackLayer}</div>}
      <img
        ref={imgRef}
        src={uniqueSources[currentSrcIndex]}
        alt={`${title}${config.label && config.label !== "FILE" ? ` - ${config.label}` : ""}`}
        title={title}
        className={`relative h-full w-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        width={size}
        height={Math.round(size * 0.75)}
        onLoad={(e) => {
          if (e.currentTarget.naturalWidth === 0) {
            handleError();
          } else {
            setLoaded(true);
          }
        }}
        onError={handleError}
      />
    </div>
  );
};
