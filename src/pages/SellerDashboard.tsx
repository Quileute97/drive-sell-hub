import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AddProductForm from '@/components/AddProductForm';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Edit2, 
  Plus,
  Eye,
  MoreHorizontal,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Withdrawal from './Withdrawal';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SellerDashboard = () => {
  const { user, profile } = useAuth();
  const { isSeller, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('shop');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Kiểm tra quyền seller
  useEffect(() => {
    if (!roleLoading && !isSeller && user) {
      navigate('/seller-signup', { replace: true });
    }
  }, [isSeller, roleLoading, user, navigate]);
  
  // Form state for shop information
  const [shopForm, setShopForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    description: '',
    phone: '',
    address: ''
  });
  
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

  // Calculate revenue chart data
  const revenueChartData = () => {
    if (!orders.length) return [];
    
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      };
    });

    const revenueByMonth = orders
      .filter(order => order.status === 'delivered')
      .reduce((acc, order) => {
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + Number(order.seller_amount);
        return acc;
      }, {} as Record<string, number>);

    return last6Months.map(({ month, monthKey }) => ({
      name: month,
      revenue: revenueByMonth[monthKey] || 0
    }));
  };

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

  const handleAddProductSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['seller-products', user?.id] });
  };

  const handleUpdateProfile = async () => {
    try {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: shopForm.full_name
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin cửa hàng",
      });
      
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin cửa hàng",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: "pending" | "paid" | "delivered" | "cancelled" | "refunded") => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái đơn hàng",
      });
      
      queryClient.invalidateQueries({ queryKey: ['seller-orders', user?.id] });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái đơn hàng",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

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
          <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
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
            <TabsTrigger value="withdrawal" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Rút tiền
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
                      value={shopForm.full_name}
                      onChange={(e) => setShopForm(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shop-email">Email liên hệ</Label>
                    <Input
                      id="shop-email"
                      type="email"
                      placeholder="shop@example.com"
                      value={shopForm.email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shop-phone">Số điện thoại</Label>
                    <Input
                      id="shop-phone"
                      placeholder="Nhập số điện thoại"
                      value={shopForm.phone}
                      onChange={(e) => setShopForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shop-address">Địa chỉ</Label>
                    <Input
                      id="shop-address"
                      placeholder="Nhập địa chỉ"
                      value={shopForm.address}
                      onChange={(e) => setShopForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="shop-description">Mô tả cửa hàng</Label>
                  <Textarea
                    id="shop-description"
                    placeholder="Giới thiệu về cửa hàng và sản phẩm của bạn..."
                    rows={4}
                    value={shopForm.description}
                    onChange={(e) => setShopForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button className="w-full" onClick={handleUpdateProfile}>
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
              <Button onClick={() => setShowAddProductForm(true)}>
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
                    <Button onClick={() => setShowAddProductForm(true)}>
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
                      
                      <div className="text-right space-y-2">
                        <div>
                          <Label className="text-xs">Trạng thái đơn hàng</Label>
                          <Select
                            value={order.status as string}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value as "pending" | "paid" | "delivered" | "cancelled" | "refunded")}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Chờ xử lý</SelectItem>
                              <SelectItem value="paid">Đã thanh toán</SelectItem>
                              <SelectItem value="delivered">Đã giao</SelectItem>
                              <SelectItem value="cancelled">Đã hủy</SelectItem>
                              <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-sm text-muted-foreground">
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
                <CardDescription>
                  Doanh thu 6 tháng gần nhất (chỉ tính đơn đã giao)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revenueChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatPrice(value)}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Doanh thu"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chưa có dữ liệu doanh thu
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawal Tab */}
          <TabsContent value="withdrawal" className="space-y-6">
            <Withdrawal />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
      
      {showAddProductForm && (
        <AddProductForm
          onClose={() => setShowAddProductForm(false)}
          onSuccess={handleAddProductSuccess}
        />
      )}
    </div>
  );
};

export default SellerDashboard;