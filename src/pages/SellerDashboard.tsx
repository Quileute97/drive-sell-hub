import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SellerDashboardPanel } from '@/components/SellerDashboardPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Link } from '@/lib/router-compat';
import { Loader2, LogIn, Shield, Store } from 'lucide-react';

const SellerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isSeller, loading: roleLoading } = useUserRole();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {authLoading || (user && roleLoading) ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <Card className="mx-auto max-w-md my-12">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Đăng nhập để bán hàng</CardTitle>
              <CardDescription>
                Vui lòng đăng nhập tài khoản người bán hoặc admin để mở Dashboard Bán hàng.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Đăng nhập ngay
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : !isSeller ? (
          <Card className="mx-auto max-w-md my-12">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Bạn chưa kích hoạt tài khoản bán hàng</CardTitle>
              <CardDescription>
                Đăng ký trở thành người bán miễn phí để đăng sản phẩm và theo dõi doanh thu.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link to="/seller-signup">Đăng ký bán hàng ngay</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <SellerDashboardPanel
            headerAction={
              isAdmin ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">
                    <Shield className="h-4 w-4 mr-2" />
                    Quản trị hệ thống
                  </Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
