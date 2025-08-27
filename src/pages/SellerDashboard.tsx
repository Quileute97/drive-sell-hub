import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Edit2, 
  Plus,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SellerDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('shop');
  
  // Fetch seller's products
  const { data: products = [] } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch seller's orders
  const { data: orders = [] } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(title, price)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Calculate revenue stats
  const completedOrders = orders.filter(order => order.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.seller_amount), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Bán hàng</h1>
          <p className="text-muted-foreground">
            Quản lý cửa hàng và theo dõi hiệu suất bán hàng của bạn
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Cửa hàng
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Sản phẩm
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Doanh thu
            </TabsTrigger>
          </TabsList>

          {/* Shop Customization Tab */}
          <TabsContent value="shop" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Thông tin cửa hàng
                </CardTitle>
                <CardDescription>
                  Tuỳ chỉnh thông tin và giao diện cửa hàng của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shop-name">Tên cửa hàng</Label>
                    <Input
                      id="shop-name"
                      placeholder="Nhập tên cửa hàng"
                      defaultValue={profile?.full_name}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shop-email">Email liên hệ</Label>
                    <Input
                      id="shop-email"
                      type="email"
                      placeholder="shop@example.com"
                      defaultValue={profile?.email}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="shop-description">Mô tả cửa hàng</Label>
                  <Textarea
                    id="shop-description"
                    placeholder="Giới thiệu về cửa hàng và sản phẩm của bạn..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="shop-logo">Logo cửa hàng</Label>
                  <Input
                    id="shop-logo"
                    type="file"
                    accept="image/*"
                  />
                </div>

                <Button className="w-full">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Cập nhật thông tin
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Sản phẩm của tôi</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm mới
              </Button>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-muted-foreground text-sm">
                            {product.short_description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="font-medium">{formatPrice(product.price)}</span>
                            <span className="text-sm text-muted-foreground">
                              Trạng thái: {product.status}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Lượt xem: {product.view_count}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {products.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm nào</h3>
                    <p className="text-muted-foreground mb-4">
                      Bắt đầu bán hàng bằng cách thêm sản phẩm đầu tiên của bạn
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm sản phẩm đầu tiên
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-semibold">Đơn hàng</h2>
            
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">#{order.order_number}</h3>
                        <p className="text-muted-foreground text-sm">
                          {order.products?.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span>Khách hàng: {order.buyer_name}</span>
                          <span>Số lượng: {order.quantity}</span>
                          <span className="font-medium">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {orders.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng nào</h3>
                    <p className="text-muted-foreground">
                      Đơn hàng sẽ xuất hiện ở đây khi khách hàng mua sản phẩm của bạn
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <h2 className="text-2xl font-semibold">Báo cáo doanh thu</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng doanh thu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Từ {completedOrders.length} đơn hàng hoàn thành
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Tất cả đơn hàng
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    Sản phẩm đang bán
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê doanh thu theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Biểu đồ doanh thu sẽ được hiển thị tại đây
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerDashboard;