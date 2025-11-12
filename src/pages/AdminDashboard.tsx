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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Store, ShoppingCart, DollarSign, Users, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState({
    totalSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
  });
  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
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
          product:products(title)
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

      // Calculate stats
      const totalRevenue = ordersData?.reduce((sum, order) => 
        sum + parseFloat(String(order.commission_amount || 0)), 0
      ) || 0;

      const pendingWithdrawals = withdrawalsData?.filter(w => w.status === 'pending').length || 0;

      setStats({
        totalSellers: sellersData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        pendingWithdrawals,
      });

      setSellers(sellersData || []);
      setOrders(ordersData || []);
      setWithdrawals(withdrawalsData || []);
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
            <CardTitle className="text-sm font-medium">Tổng Người Bán</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSellers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đơn Hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Thu Hoa Hồng</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toLocaleString('vi-VN')} ₫
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yêu Cầu Rút Tiền Chờ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingWithdrawals}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sellers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sellers">Người Bán</TabsTrigger>
          <TabsTrigger value="orders">Đơn Hàng</TabsTrigger>
          <TabsTrigger value="withdrawals">Yêu Cầu Rút Tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Người Bán</CardTitle>
              <CardDescription>Danh sách tất cả người bán trên hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Xác Minh</TableHead>
                    <TableHead>Tổng Doanh Thu</TableHead>
                    <TableHead>Ngày Đăng Ký</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller.id}>
                      <TableCell>{seller.full_name || 'Chưa cập nhật'}</TableCell>
                      <TableCell>{seller.email}</TableCell>
                      <TableCell>
                        <Badge variant={seller.is_verified ? "default" : "secondary"}>
                          {seller.is_verified ? "Đã xác minh" : "Chưa xác minh"}
                        </Badge>
                      </TableCell>
                      <TableCell>{parseFloat(seller.total_sales || 0).toLocaleString('vi-VN')} ₫</TableCell>
                      <TableCell>{new Date(seller.created_at).toLocaleDateString('vi-VN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Đơn Hàng</CardTitle>
              <CardDescription>Danh sách tất cả đơn hàng trên hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Yêu Cầu Rút Tiền</CardTitle>
              <CardDescription>Danh sách tất cả yêu cầu rút tiền</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
