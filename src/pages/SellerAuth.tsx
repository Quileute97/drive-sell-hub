import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft, Store, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { SEO } from '@/components/SEO';
import { getAffiliateRefCode } from '@/lib/affiliate';

const SellerAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, profile } = useAuth();
  const { isSeller, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already a seller, redirect to seller dashboard
    if (user && isSeller && !roleLoading) {
      navigate('/seller-dashboard', { replace: true });
    }
  }, [user, isSeller, roleLoading, navigate]);

  // For logged-in users to register as seller
  const handleRegisterAsSeller = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Add seller role to user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'seller'
        });

      if (roleError) {
        if (roleError.code === '23505') {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Bạn đã đăng ký làm người bán rồi"
          });
        } else {
          throw roleError;
        }
        return;
      }

      // Update profile role
      await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('user_id', user.id);

      // Attribute seller signup to referring affiliate (cookie 30 days)
      const refCode = getAffiliateRefCode();
      if (refCode) {
        await supabase.rpc('set_seller_referrer', { _code: refCode });
      }

      toast({
        title: "Đăng ký thành công",
        description: "Bạn đã trở thành người bán! Đang chuyển đến trang quản lý..."
      });

      setTimeout(() => {
        navigate('/seller-dashboard', { replace: true });
      }, 1500);
    } catch (error) {
      console.error('Seller registration error:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể đăng ký làm người bán. Vui lòng thử lại."
      });
    } finally {
      setLoading(false);
    }
  };

  // For new users to sign up as seller
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

      const redirectUrl = `${window.location.origin}/seller-signup`;
      
      const { error } = await supabase.auth.signUp({
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
      } else {
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

  // Show loading while checking role
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Logged-in user who is not yet a seller
  if (user && !isSeller) {
    return (
      <>
      <SEO
        title="Đăng ký trở thành Người bán - Kiếm tiền từ sản phẩm digital"
        description="Đăng ký làm seller trên Salemylink.com. Bán ebook, tài liệu, khóa học online với hoa hồng chỉ từ 5%. Thanh toán nhanh, quản lý dễ dàng."
        keywords="đăng ký seller, bán hàng online, kiếm tiền digital, đăng ký người bán, salemylink seller"
        url="https://salemylink.com/seller-auth"
        noindex={true}
      />
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
          </div>

          <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Trở thành người bán
              </CardTitle>
              <CardDescription>
                Xin chào <span className="font-medium text-foreground">{profile?.full_name || user.email}</span>! 
                Bạn muốn bắt đầu bán hàng trên SaleMyLink?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Đăng bán sản phẩm số không giới hạn</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Nhận 85% doanh thu từ mỗi đơn hàng</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Rút tiền về tài khoản ngân hàng dễ dàng</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Dashboard quản lý sản phẩm & đơn hàng</span>
                </div>
              </div>

              <Button 
                onClick={handleRegisterAsSeller} 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký bán hàng ngay'}
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <Link to="/terms-of-service" className="text-primary hover:underline">
              Điều khoản bán hàng
            </Link>{' '}
            và{' '}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Chính sách bảo mật
            </Link>.
          </p>
        </div>
      </div>
    </>
    );
  }

  return (
    <>
    <SEO
      title="Đăng ký Người bán - Bắt đầu kinh doanh sản phẩm digital"
      description="Tạo tài khoản seller trên Salemylink.com để bán ebook, tài liệu, khóa học online. Hoa hồng thấp chỉ 5%, hỗ trợ thanh toán PayOS, quản lý đơn hàng tự động."
      keywords="đăng ký bán hàng, tạo tài khoản seller, bán sản phẩm digital, kiếm tiền online, salemylink"
      url="https://salemylink.com/seller-auth"
      noindex={true}
    />
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
          <Link to="/terms-of-service" className="text-primary hover:underline">
            Điều khoản bán hàng
          </Link>{' '}
          và{' '}
          <Link to="/privacy-policy" className="text-primary hover:underline">
            Chính sách bảo mật
          </Link>.
        </p>
      </div>
    </div>
  </>
  );
};

export default SellerAuth;