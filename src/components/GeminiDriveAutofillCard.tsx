import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Link2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY_STORAGE = "salemylink_gemini_api_key";

export interface GeminiCategoryOption {
  id: string;
  name: string;
}

export interface GeminiGeneratedProductFields {
  title: string;
  meta_title: string;
  short_description: string;
  meta_description: string;
  focus_keyword: string;
  description_html: string;
  tags: string[];
  file_format: string;
  suggested_category_id: string | null;
  suggested_category_name: string | null;
  detected_file_name: string | null;
  drive_public_readable: boolean;
  model_used: string;
}

export function isGoogleDriveUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (host !== "drive.google.com" && host !== "docs.google.com") {
      return false;
    }
    return (
      /\/(file|document|spreadsheets|presentation)\/(?:u\/\d+\/)?d\/[a-zA-Z0-9_-]{10,}/.test(
        parsed.pathname
      ) ||
      /\/drive\/(?:u\/\d+\/)?folders\/[a-zA-Z0-9_-]{10,}/.test(parsed.pathname) ||
      /[?&]id=[a-zA-Z0-9_-]{10,}/.test(parsed.search)
    );
  } catch {
    return false;
  }
}

interface GeminiDriveAutofillCardProps {
  googleDriveLink: string;
  onGoogleDriveLinkChange: (value: string) => void;
  existingTitle?: string;
  categoryId?: string;
  categories?: GeminiCategoryOption[];
  defaultAutoOnPaste?: boolean;
  hasExistingContent?: boolean;
  onApplyResult: (result: GeminiGeneratedProductFields) => void;
}

export function GeminiDriveAutofillCard({
  googleDriveLink,
  onGoogleDriveLinkChange,
  existingTitle = "",
  categoryId = "",
  categories = [],
  defaultAutoOnPaste = true,
  hasExistingContent = false,
  onApplyResult,
}: GeminiDriveAutofillCardProps) {
  const [userHint, setUserHint] = useState("");
  const [autoOnPaste, setAutoOnPaste] = useState(defaultAutoOnPaste);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [lastResultInfo, setLastResultInfo] = useState<{
    fileName: string | null;
    modelUsed: string;
  } | null>(null);

  const lastTriggeredUrlRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.sessionStorage.getItem(SESSION_KEY_STORAGE) || "";
      if (saved) setCustomApiKey(saved);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const handleCustomKeyChange = (val: string) => {
    setCustomApiKey(val);
    if (typeof window === "undefined") return;
    try {
      const clean = val.trim();
      if (clean) {
        window.sessionStorage.setItem(SESSION_KEY_STORAGE, clean);
      } else {
        window.sessionStorage.removeItem(SESSION_KEY_STORAGE);
      }
    } catch {
      // Ignore
    }
  };

  const triggerGenerate = async (targetUrl?: string) => {
    const link = (targetUrl ?? googleDriveLink).trim();
    if (!link) {
      toast.error("Vui lòng dán link Google Drive trước khi tạo bằng Gemini.");
      return;
    }
    if (!isGoogleDriveUrl(link)) {
      const msg =
        "Link chưa đúng định dạng Google Drive / Docs / Sheets / Slides.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    lastTriggeredUrlRef.current = link;

    try {
      let {
        data: { session },
      } = await supabase.auth.getSession();

      const expiresAtMs = (session?.expires_at ?? 0) * 1000;
      if (!session?.access_token || (expiresAtMs > 0 && expiresAtMs - Date.now() < 60_000)) {
        const refreshed = await supabase.auth.refreshSession();
        if (refreshed.data.session?.access_token) {
          session = refreshed.data.session;
        }
      }

      if (!session?.access_token) {
        throw new Error("Vui lòng đăng nhập lại để sử dụng Gemini AI.");
      }

      const categoryName =
        categories.find((c) => c.id === categoryId)?.name || "";

      const payloadBody = JSON.stringify({
        googleDriveLink: link,
        userHint: userHint.trim(),
        existingTitle: existingTitle.trim(),
        categoryName,
        categories,
      });

      const callGeminiSeoEndpoint = async (accessToken: string) => {
        const headers: Record<string, string> = {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        };
        if (customApiKey.trim()) {
          headers["x-gemini-api-key"] = customApiKey.trim();
        }
        return fetch("/api/gemini-seo", {
          method: "POST",
          headers,
          body: payloadBody,
        });
      };

      let res = await callGeminiSeoEndpoint(session.access_token);

      // If token just expired right before the request, refresh session once and retry
      if (res.status === 401) {
        const refreshed = await supabase.auth.refreshSession();
        if (refreshed.data.session?.access_token) {
          res = await callGeminiSeoEndpoint(refreshed.data.session.access_token);
        }
      }

      const data = (await res.json().catch(() => ({}))) as Partial<
        GeminiGeneratedProductFields
      > & { error?: string; errorCode?: string };

      if (!res.ok) {
        if (
          data.errorCode === "MISSING_API_KEY" ||
          data.errorCode === "INVALID_API_KEY"
        ) {
          setShowKeyInput(true);
        }
        throw new Error(
          data.error || "Không thể tạo nội dung SEO từ Gemini lúc này."
        );
      }

      const generated = data as GeminiGeneratedProductFields;
      onApplyResult(generated);
      setLastResultInfo({
        fileName: generated.detected_file_name,
        modelUsed: generated.model_used,
      });

      toast.success(
        generated.detected_file_name
          ? `Gemini đã tạo Tiêu đề & SEO từ "${generated.detected_file_name}"`
          : "Gemini đã tạo Tiêu đề & Giới thiệu chuẩn SEO!"
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi gọi Gemini.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLinkInputChange = (nextValue: string) => {
    const prevWasDrive = isGoogleDriveUrl(googleDriveLink);
    onGoogleDriveLinkChange(nextValue);
    setErrorMsg(null);

    const trimmed = nextValue.trim();
    if (
      autoOnPaste &&
      !hasExistingContent &&
      !isGenerating &&
      !prevWasDrive &&
      isGoogleDriveUrl(trimmed) &&
      trimmed !== lastTriggeredUrlRef.current
    ) {
      void triggerGenerate(trimmed);
    }
  };

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Gemini AI — Tự động tạo Tiêu đề & Bài giới thiệu chuẩn SEO
              </span>
              <Badge variant="secondary" className="text-[11px]">
                Google Drive
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Dán link Google Drive (file, Docs, Sheets, Slides hoặc thư mục),
              AI sẽ tự sinh tiêu đề, mô tả ngắn, bài SEO & thẻ meta.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground"
          onClick={() => setShowKeyInput((v) => !v)}
          title="Cấu hình Gemini API Key dự phòng"
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>{customApiKey.trim() ? "Đã nhập Key" : "API Key"}</span>
        </Button>
      </div>

      {/* Drive Link Input + Generate Action */}
      <div className="space-y-2">
        <Label htmlFor="gemini_drive_link_input" className="text-xs font-medium">
          Link Google Drive *
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="gemini_drive_link_input"
              value={googleDriveLink}
              onChange={(e) => handleLinkInputChange(e.target.value)}
              placeholder="https://drive.google.com/file/d/.../view hoặc link Docs/Folder"
              className="bg-background pl-9"
              disabled={isGenerating}
            />
          </div>
          <Button
            type="button"
            onClick={() => triggerGenerate()}
            disabled={isGenerating || !googleDriveLink.trim()}
            className="gap-1.5 shrink-0 min-h-10"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang phân tích...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>
                  {lastResultInfo ? "Tạo lại với Gemini" : "Tạo SEO bằng Gemini"}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Optional context hint + Auto-on-paste switch */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={userHint}
          onChange={(e) => setUserHint(e.target.value)}
          placeholder="Gợi ý thêm cho AI nếu file riêng tư (VD: Sách IELTS 4 kỹ năng Band 8.0)"
          className="h-9 bg-background text-xs sm:max-w-md"
          disabled={isGenerating}
        />

        <div className="flex items-center gap-2 shrink-0">
          <Switch
            id="gemini-auto-on-paste"
            checked={autoOnPaste}
            onCheckedChange={setAutoOnPaste}
          />
          <Label
            htmlFor="gemini-auto-on-paste"
            className="cursor-pointer text-xs text-muted-foreground"
          >
            Tự sinh khi dán link
          </Label>
        </div>
      </div>

      {/* Optional Client Fallback API Key Input */}
      {showKeyInput && (
        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="gemini_custom_api_key" className="text-xs font-medium">
              Gemini API Key cá nhân (chỉ cần nếu server chưa cài{" "}
              <code className="font-mono">GEMINI_API_KEY</code>)
            </Label>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <span>Lấy Key miễn phí</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Input
            id="gemini_custom_api_key"
            type="password"
            value={customApiKey}
            onChange={(e) => handleCustomKeyChange(e.target.value)}
            placeholder="AIza..."
            className="h-9 font-mono text-xs"
            autoComplete="off"
          />
          <p className="text-[11px] text-muted-foreground">
            Key chỉ lưu tạm trong phiên trình duyệt hiện tại để gửi qua{" "}
            <code className="font-mono">/api/gemini-seo</code>. Khi triển khai chính
            thức, hãy cấu hình <code className="font-mono">GEMINI_API_KEY</code> ở biến
            môi trường server (.env / Cloudflare Pages).
          </p>
        </div>
      )}

      {/* Result / Error banner */}
      {lastResultInfo && !errorMsg && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Đã điền Tiêu đề, URL slug, Mô tả ngắn, Bài giới thiệu chuẩn SEO, Từ khóa
            chính & Tags
            {lastResultInfo.fileName ? (
              <>
                {" "}
                từ file <strong>{lastResultInfo.fileName}</strong>
              </>
            ) : null}
            .
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

