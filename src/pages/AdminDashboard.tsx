import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Store, ShoppingCart, DollarSign, Users, CheckCircle, XCircle, Package, TrendingUp, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState({
    totalSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    totalProducts: 0,
    activeProducts: 0,
  });
  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch sellers
      const { data: sellersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .order('created_at', { ascending: false });

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(full_name, email),
          seller:profiles!orders_seller_id_fkey(full_name, email),
          product:products(title, category_id)
        `)
        .order('created_at', { ascending: false });

      // Fetch withdrawals
      const { data: withdrawalsData } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          user:profiles!withdrawal_requests_user_id_fkey(full_name, email),
          bank_account:bank_accounts(bank_name, account_number)
        `)
        .order('requested_at', { ascending: false });

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles!products_seller_id_fkey(full_name, email),
          category:categories(name)
        `)
        .order('created_at', { ascending: false });

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      // Calculate stats
      const totalRevenue = ordersData?.reduce((sum, order) => 
        sum + parseFloat(String(order.commission_amount || 0)), 0
      ) || 0;

      const pendingWithdrawals = withdrawalsData?.filter(w => w.status === 'pending').length || 0;
      const activeProducts = productsData?.filter(p => p.status === 'active').length || 0;

      setStats({
        totalSellers: sellersData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        pendingWithdrawals,
        totalProducts: productsData?.length || 0,
        activeProducts,
      });

      // Calculate revenue by month (last 6 months)
      const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        const monthRevenue = ordersData?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        }).reduce((sum, order) => sum + parseFloat(String(order.total_amount || 0)), 0) || 0;

        const commission = ordersData?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        }).reduce((sum, order) => sum + parseFloat(String(order.commission_amount || 0)), 0) || 0;

        return {
          month: monthYear,
          revenue: monthRevenue,
          commission: commission,
        };
      });

      // Calculate products by category
      const productsByCategory = categoriesData?.map(cat => ({
        name: cat.name,
        value: productsData?.filter(p => p.category_id === cat.id).length || 0,
      })).filter(c => c.value > 0) || [];

      setRevenueData(revenueByMonth);
      setCategoryData(productsByCategory);
      setSellers(sellersData || []);
      setOrders(ordersData || []);
      setWithdrawals(withdrawalsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'paid' | 'delivered' | 'cancelled' | 'refunded') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success("Cập nhật trạng thái đơn hàng thành công");
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Không thể cập nhật đơn hàng");
    }
  };

  const updateWithdrawalStatus = async (withdrawalId: string, newStatus: 'pending' | 'processing' | 'completed' | 'rejected', notes?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        processed_at: new Date().toISOString(),
      };

      if (notes) {
        if (newStatus === 'rejected') {
          updateData.rejected_reason = notes;
        } else {
          updateData.admin_notes = notes;
        }
      }

      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updateData)
        .eq('id', withdrawalId);

      if (error) throw error;

      toast.success("Cập nhật yêu cầu rút tiền thành công");
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      toast.error("Không thể cập nhật yêu cầu rút tiền");
    }
  };

  const updateProductStatus = async (productId: string, newStatus: 'draft' | 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;

      toast.success("Cập nhật trạng thái sản phẩm thành công");
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Không thể cập nhật sản phẩm");
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#82ca9d', '#ffc658', '#8884d8'];

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Quản Trị Hệ Thống</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Cửa Hàng</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSellers}</div>
            <p className="text-xs text-muted-foreground mt-1">Người bán đã đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản Phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}/{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Đang hoạt động/Tổng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Thu Tháng</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(revenueData[revenueData.length - 1]?.revenue || 0).toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hoa hồng: {(revenueData[revenueData.length - 1]?.commission || 0).toLocaleString('vi-VN')} ₫</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yêu Cầu Rút Tiền</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingWithdrawals}</div>
            <p className="text-xs text-muted-foreground mt-1">Đang chờ xử lý</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Doanh Thu 6 Tháng Gần Đây</CardTitle>
            <CardDescription>Biểu đồ doanh thu và hoa hồng theo tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} ₫`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Doanh thu" strokeWidth={2} />
                <Line type="monotone" dataKey="commission" stroke="hsl(var(--accent))" name="Hoa hồng" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân Bố Sản Phẩm</CardTitle>
            <CardDescription>Số lượng sản phẩm theo danh mục</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sellers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sellers">Cửa Hàng</TabsTrigger>
          <TabsTrigger value="products">Sản Phẩm</TabsTrigger>
          <TabsTrigger value="orders">Đơn Hàng</TabsTrigger>
          <TabsTrigger value="withdrawals">Rút Tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Cửa Hàng</CardTitle>
              <CardDescription>Danh sách tất cả cửa hàng đã đăng ký và doanh số bán hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên Cửa Hàng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead>Số Sản Phẩm</TableHead>
                      <TableHead>Tổng Doanh Thu</TableHead>
                      <TableHead>Hoa Hồng (15%)</TableHead>
                      <TableHead>Số Tiền Còn Lại</TableHead>
                      <TableHead>Ngày Đăng Ký</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellers.map((seller) => {
                      const sellerProducts = products.filter(p => p.seller_id === seller.user_id).length;
                      const sellerOrders = orders.filter(o => o.seller_id === seller.user_id);
                      const totalSales = sellerOrders.reduce((sum, o) => sum + parseFloat(String(o.seller_amount || 0)), 0);
                      const totalWithdrawn = withdrawals
                        .filter(w => w.user_id === seller.user_id && w.status === 'completed')
                        .reduce((sum, w) => sum + parseFloat(String(w.amount || 0)), 0);
                      const balance = totalSales - totalWithdrawn;

                      return (
                        <TableRow key={seller.id}>
                          <TableCell className="font-medium">{seller.full_name || 'Chưa cập nhật'}</TableCell>
                          <TableCell>{seller.email}</TableCell>
                          <TableCell>
                            <Badge variant={seller.is_verified ? "default" : "secondary"}>
                              {seller.is_verified ? "Đã xác minh" : "Chưa xác minh"}
                            </Badge>
                          </TableCell>
                          <TableCell>{sellerProducts}</TableCell>
                          <TableCell className="font-medium">{totalSales.toLocaleString('vi-VN')} ₫</TableCell>
                          <TableCell>{(totalSales * 0.15).toLocaleString('vi-VN')} ₫</TableCell>
                          <TableCell className="font-bold text-primary">{balance.toLocaleString('vi-VN')} ₫</TableCell>
                          <TableCell>{new Date(seller.created_at).toLocaleDateString('vi-VN')}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Sản Phẩm</CardTitle>
              <CardDescription>Danh sách tất cả sản phẩm từ các cửa hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên Sản Phẩm</TableHead>
                      <TableHead>Cửa Hàng</TableHead>
                      <TableHead>Danh Mục</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Lượt Xem</TableHead>
                      <TableHead>Đã Bán</TableHead>
                      <TableHead>Đánh Giá</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead>Hành Động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{product.title}</TableCell>
                        <TableCell>{product.seller?.full_name || product.seller?.email}</TableCell>
                        <TableCell>{product.category?.name}</TableCell>
                        <TableCell>{parseFloat(product.price).toLocaleString('vi-VN')} ₫</TableCell>
                        <TableCell>{product.view_count || 0}</TableCell>
                        <TableCell>{product.download_count || 0}</TableCell>
                        <TableCell>
                          {product.rating_average ? `⭐ ${product.rating_average.toFixed(1)} (${product.rating_count})` : 'Chưa có'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            product.status === 'active' ? 'default' :
                            product.status === 'draft' ? 'secondary' : 'outline'
                          }>
                            {product.status === 'active' ? 'Hoạt động' :
                             product.status === 'draft' ? 'Nháp' : 'Tạm ngừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={product.status}
                            onValueChange={(value) => updateProductStatus(product.id, value as any)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Hoạt động</SelectItem>
                              <SelectItem value="inactive">Tạm ngừng</SelectItem>
                              <SelectItem value="draft">Nháp</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Đơn Hàng</CardTitle>
              <CardDescription>Danh sách tất cả đơn hàng và phân phối hoa hồng</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã Đơn</TableHead>
                    <TableHead>Người Mua</TableHead>
                    <TableHead>Sản Phẩm</TableHead>
                    <TableHead>Tổng Tiền</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                    <TableHead>Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.buyer?.full_name || order.buyer_email}</TableCell>
                      <TableCell>{order.product?.title}</TableCell>
                      <TableCell>{parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'paid' ? 'outline' : 'destructive'
                        }>
                          {order.status === 'pending' ? 'Chờ xử lý' :
                           order.status === 'paid' ? 'Đã thanh toán' :
                           order.status === 'delivered' ? 'Đã giao' :
                           order.status === 'refunded' ? 'Hoàn tiền' : 'Đã hủy'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value as any)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="paid">Đã thanh toán</SelectItem>
                            <SelectItem value="delivered">Đã giao</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                            <SelectItem value="refunded">Hoàn tiền</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Yêu Cầu Rút Tiền</CardTitle>
              <CardDescription>Xử lý thanh toán hàng tháng cho các cửa hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người Yêu Cầu</TableHead>
                    <TableHead>Số Tiền</TableHead>
                    <TableHead>Phí</TableHead>
                    <TableHead>Thực Nhận</TableHead>
                    <TableHead>Ngân Hàng</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Ngày Yêu Cầu</TableHead>
                    <TableHead>Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>{withdrawal.user?.full_name || withdrawal.user?.email}</TableCell>
                      <TableCell>{parseFloat(withdrawal.amount).toLocaleString('vi-VN')} ₫</TableCell>
                      <TableCell>{parseFloat(withdrawal.fee || 0).toLocaleString('vi-VN')} ₫</TableCell>
                      <TableCell className="font-medium">
                        {parseFloat(withdrawal.net_amount).toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell>
                        {withdrawal.bank_account?.bank_name}<br />
                        <span className="text-sm text-muted-foreground">
                          {withdrawal.bank_account?.account_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          withdrawal.status === 'completed' ? 'default' :
                          withdrawal.status === 'pending' ? 'secondary' :
                          withdrawal.status === 'processing' ? 'outline' : 'destructive'
                        }>
                          {withdrawal.status === 'pending' ? 'Chờ duyệt' :
                           withdrawal.status === 'processing' ? 'Đang xử lý' :
                           withdrawal.status === 'completed' ? 'Hoàn tất' : 'Từ chối'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(withdrawal.requested_at).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateWithdrawalStatus(withdrawal.id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt('Lý do từ chối:');
                                if (reason) updateWithdrawalStatus(withdrawal.id, 'rejected', reason);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
