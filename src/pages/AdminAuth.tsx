import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminAuth() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, roleLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Không thể đăng nhập");
      }

      // Check if user has admin role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .single();

      if (!userRoles) {
        await supabase.auth.signOut();
        toast.error("Tài khoản không có quyền admin");
        setLoading(false);
        return;
      }

      toast.success("Đăng nhập thành công");
      navigate("/admin");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Đăng Nhập Admin</CardTitle>
          <CardDescription className="text-center">
            Vui lòng đăng nhập bằng tài khoản admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng Nhập"
              )}
            </Button>
          </form>

          <Alert className="mt-6">
            <AlertDescription className="text-sm">
              <strong>Lưu ý:</strong> Để gán quyền admin cho tài khoản, vui lòng chạy câu lệnh SQL sau trong Supabase:
              <code className="block mt-2 p-2 bg-muted rounded text-xs">
                INSERT INTO user_roles (user_id, role)<br />
                VALUES ('YOUR_USER_ID', 'admin');
              </code>
              Thay YOUR_USER_ID bằng ID của user trong bảng auth.users
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
