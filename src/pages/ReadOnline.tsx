import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { getGoogleDrivePreviewUrl } from "@/lib/productAccess";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReadOnline = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from("products")
        .select("title, google_drive_link, read_only, status")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Không tìm thấy sản phẩm", variant: "destructive" });
        navigate("/");
        return;
      }
      if (!data.read_only) {
        toast({ title: "Sản phẩm không hỗ trợ đọc trực tuyến", variant: "destructive" });
        navigate(`/product/${slug}`);
        return;
      }
      const url = getGoogleDrivePreviewUrl(data.google_drive_link);
      if (!url) {
        toast({ title: "Không có link để xem trước", variant: "destructive" });
        navigate(`/product/${slug}`);
        return;
      }
      setTitle(data.title);
      setPreviewUrl(url);
      setLoading(false);
    };
    load();
  }, [slug, navigate, toast]);

  // Block common download / print / save shortcuts + right click
  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "u", "j"].includes(k)) {
        e.preventDefault();
        toast({ title: "Chế độ chỉ đọc", description: "Không cho phép tải hoặc in tài liệu." });
      }
    };
    const blockCtx = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("keydown", blockKeys);
    window.addEventListener("contextmenu", blockCtx);
    return () => {
      window.removeEventListener("keydown", blockKeys);
      window.removeEventListener("contextmenu", blockCtx);
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Đang tải trình đọc...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/product/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Link>
          </Button>
          <h1 className="font-semibold truncate">{title}</h1>
        </div>
        <div className="hidden md:flex items-center text-xs text-muted-foreground gap-1">
          <ShieldAlert className="h-4 w-4" />
          Chế độ chỉ đọc – không hỗ trợ tải xuống
        </div>
      </header>

      <div className="relative flex-1 select-none" style={{ userSelect: "none" }}>
        {previewUrl && (
          <iframe
            src={previewUrl}
            title={`Đọc trực tuyến ${title}`}
            className="absolute inset-0 w-full h-full border-0"
            allow=""
            referrerPolicy="no-referrer"
          />
        )}
        {/* Overlay covering Google Drive top-right action bar (download / popout / print) */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 h-14 w-40 bg-background pointer-events-auto"
          style={{ boxShadow: "0 0 0 1px hsl(var(--border))" }}
        />
      </div>
    </div>
  );
};

export default ReadOnline;
