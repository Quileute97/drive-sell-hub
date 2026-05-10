import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Copy, TrendingUp, MousePointerClick, ShoppingCart, Wallet } from "lucide-react";
import { SEO } from "@/components/SEO";

interface Affiliate {
  id: string;
  code: string;
  status: string;
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  pending_earnings: number;
}

interface Commission {
  id: string;
  order_amount: number;
  commission_amount: number;
  status: string;
  source?: string;
  created_at: string;
}

const generateCode = (email: string) =>
  (email.split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() || "ref") +
  Math.random().toString(36).slice(2, 6);

export default function Affiliate() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [busy, setBusy] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [productUrl, setProductUrl] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setAffiliate(data as any);
      if (data) {
        const { data: cs } = await supabase
          .from("affiliate_commissions")
          .select("id, order_amount, commission_amount, status, source, created_at")
          .eq("affiliate_id", (data as any).id)
          .order("created_at", { ascending: false })
          .limit(50);
        setCommissions((cs as any) || []);
      }
      setFetched(true);
    })();
  }, [user]);

  const register = async () => {
    if (!user) return;
    setBusy(true);
    const code = generateCode(user.email || "");
    const { data, error } = await supabase
      .from("affiliates")
      .insert({ user_id: user.id, code })
      .select()
      .single();
    setBusy(false);
    if (error) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
      return;
    }
    setAffiliate(data as any);
    toast({ title: "Đăng ký thành công", description: `Mã affiliate: ${code}` });
  };

  const baseUrl = window.location.origin;
  const refLink = affiliate ? `${baseUrl}/?ref=${affiliate.code}` : "";
  const customLink =
    affiliate && productUrl
      ? (() => {
          try {
            const u = new URL(productUrl, baseUrl);
            u.searchParams.set("ref", affiliate.code);
            return u.toString();
          } catch {
            return "";
          }
        })()
      : "";

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Đã sao chép" });
  };

  if (loading || !fetched) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Affiliate - Kiếm hoa hồng 5%" description="Tham gia chương trình affiliate, nhận 5% hoa hồng cho mỗi đơn hàng giới thiệu thành công." noindex />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">Chương trình Affiliate</h1>
        <p className="text-muted-foreground mb-6">Nhận 5% hoa hồng cho mỗi đơn hàng từ link giới thiệu, và 5% doanh thu từ các seller bạn giới thiệu tham gia (cookie 30 ngày).</p>

        {!affiliate ? (
          <Card>
            <CardHeader><CardTitle>Đăng ký làm Affiliate</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>5% hoa hồng trên mỗi đơn hàng phát sinh từ link giới thiệu</li>
                <li>5% doanh thu của seller mới đăng ký qua link của bạn (lifetime)</li>
                <li>Cookie tracking 30 ngày</li>
                <li>Rút tiền qua hệ thống ngân hàng đã có</li>
              </ul>
              <Button onClick={register} disabled={busy}>
                {busy ? "Đang xử lý..." : "Đăng ký ngay"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={<MousePointerClick className="h-4 w-4" />} label="Lượt click" value={affiliate.total_clicks.toLocaleString()} />
              <StatCard icon={<ShoppingCart className="h-4 w-4" />} label="Đơn chuyển đổi" value={affiliate.total_conversions.toLocaleString()} />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Tỉ lệ chuyển đổi"
                value={
                  affiliate.total_clicks > 0
                    ? `${((affiliate.total_conversions / affiliate.total_clicks) * 100).toFixed(1)}%`
                    : "0%"
                }
              />
              <StatCard icon={<Wallet className="h-4 w-4" />} label="Tổng hoa hồng" value={`${Number(affiliate.total_earnings).toLocaleString()}đ`} />
            </div>

            <Card className="mb-6">
              <CardHeader><CardTitle>Link giới thiệu</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Mã của bạn</label>
                  <div className="flex gap-2 mt-1">
                    <Input value={affiliate.code} readOnly />
                    <Button variant="outline" size="icon" onClick={() => copy(affiliate.code)}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Link trang chủ</label>
                  <div className="flex gap-2 mt-1">
                    <Input value={refLink} readOnly />
                    <Button variant="outline" size="icon" onClick={() => copy(refLink)}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Tạo link cho sản phẩm cụ thể</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Dán URL sản phẩm vào đây"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                    />
                  </div>
                  {customLink && (
                    <div className="flex gap-2 mt-2">
                      <Input value={customLink} readOnly />
                      <Button variant="outline" size="icon" onClick={() => copy(customLink)}><Copy className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Lịch sử hoa hồng</CardTitle></CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có hoa hồng nào.</p>
                ) : (
                  <div className="space-y-2">
                    {commissions.map((c) => (
                      <div key={c.id} className="flex items-center justify-between border-b pb-2 text-sm">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {Number(c.commission_amount).toLocaleString()}đ
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {c.source === 'seller_referral' ? 'Giới thiệu seller' : 'Đơn hàng'}
                            </span>
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Đơn {Number(c.order_amount).toLocaleString()}đ · {new Date(c.created_at).toLocaleString("vi-VN")}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-muted">{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{icon}{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </CardContent>
  </Card>
);
