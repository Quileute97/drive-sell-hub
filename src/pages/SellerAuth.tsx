import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

const SellerAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { isSeller } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Nếu đã là seller, chuyển đến dashboard
  useEffect(() => {
    if (user && isSeller) {
      navigate('/seller-dashboard', { replace: true });
    }
  }, [user, isSeller, navigate]);

  // Đăng ký seller cho user đã đăng nhập
  const handleRegisterAsSeller = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Thêm role seller vào user_roles table
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'seller'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Bạn đã đăng ký bán hàng rồi!"
          });
        } else {
          throw error;
        }
      } else {
        // Cập nhật role trong profiles table
        await supabase
          .from('profiles')
          .update({ role: 'seller' })
          .eq('user_id', user.id);

        toast({
          title: "Đăng ký thành công!",
          description: "Bạn đã trở thành người bán. Đang chuyển đến Dashboard..."
        });
        
        // Reload để cập nhật role
        setTimeout(() => {
          window.location.href = '/seller-dashboard';
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error registering as seller:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể đăng ký bán hàng"
      });
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký tài khoản mới với role seller
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Mật khẩu xác nhận không khớp"
        });
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/seller-dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: 'seller'
          }
        }
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Lỗi đăng ký",
          description: error.message
        });
      } else if (data.user) {
        // Thêm seller role vào user_roles table
        await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'seller'
          });

        toast({
          title: "Đăng ký thành công",
          description: "Vui lòng kiểm tra email để xác thực tài khoản người bán."
        });
      }
    } catch (error) {
      console.error('Seller auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nếu user đã đăng nhập nhưng chưa là seller, hiển thị form đăng ký seller
  if (user && !isSeller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link 
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay về trang chủ
            </Link>
            <div className="inline-flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SaleMyLink
              </h1>
            </div>
            <p className="text-muted-foreground">
              Đăng ký trở thành người bán
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Trở thành người bán
              </CardTitle>
              <CardDescription className="text-center">
                Bạn đã có tài khoản. Nhấn nút bên dưới để đăng ký bán hàng.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Đang đăng nhập với: <strong>{user.email}</strong>
                </p>
              </div>
              <Button 
                onClick={handleRegisterAsSeller} 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký bán hàng ngay'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link 
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay về trang chủ
          </Link>
          <div className="inline-flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SaleMyLink
            </h1>
          </div>
          <p className="text-muted-foreground">
            Đăng ký trở thành người bán
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Đăng ký bán hàng
            </CardTitle>
            <CardDescription className="text-center">
              Tạo tài khoản người bán để bắt đầu kinh doanh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký bán hàng'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Đã có tài khoản?{' '}
          <Link to="/auth" className="text-primary hover:underline">
            Đăng nhập tại đây
          </Link>
        </p>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Điều khoản bán hàng
          </Link>{' '}
          và{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Chính sách bảo mật
          </Link>.
        </p>
      </div>
    </div>
  );
};

export default SellerAuth;