import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  Store,
  ShoppingCart,
  DollarSign,
  CheckCircle,
  XCircle,
  Package,
  TrendingUp,
  Calendar,
  RefreshCw,
  QrCode,
  AlertTriangle,
  Search,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  calculateDashboardOrderStats,
  calculateMonthlyRevenue,
  calculateSellerFinancials,
  extractPayOSOrderCode,
  getOrderPayments,
  getOrderVerificationState,
  getPrimaryPayment,
  getRecognizedOrderAmounts,
  hasCompletedPayment,
  isPayOSOrder,
  toNumber,
  type OrderForCalculation,
  type OrderStatus,
  type OrderVerificationState,
  type WithdrawalForCalculation,
} from "@/lib/orderUtils";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type BankAccountRow = Database["public"]["Tables"]["bank_accounts"]["Row"];
type WithdrawalRow = Database["public"]["Tables"]["withdrawal_requests"]["Row"];

interface ProfileSummary {
  full_name: string | null;
  email: string;
}

interface AdminOrder extends OrderRow {
  buyer?: ProfileSummary | null;
  seller?: ProfileSummary | null;
  product?: { title: string; category_id: string } | null;
  payments?: Array<
    Pick<PaymentRow, "id" | "status" | "payment_method" | "payment_id" | "amount" | "processed_at" | "created_at">
  > | null;
}

interface AdminWithdrawal extends WithdrawalRow {
  bank_accounts?: Pick<BankAccountRow, "bank_name" | "account_number" | "account_holder_name"> | null;
  user?: { user_id: string; full_name: string | null; email: string } | null;
}

interface AdminProduct extends ProductRow {
  seller?: ProfileSummary | null;
  category?: { name: string } | null;
}

type OrderFilterValue =
  | "all"
  | "completed"
  | "awaiting_qr_scan"
  | "cancelled"
  | "refunded"
  | "needs_attention";

interface PendingManualConfirmState {
  order: AdminOrder;
  targetStatus: OrderStatus;
}

interface RejectWithdrawalState {
  withdrawalId: string;
  reason: string;
}

const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] || "https://dfalphamyvdfewixrnju.supabase.co";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "#82ca9d",
  "#ffc658",
  "#8884d8",
];

function getVerificationBadgeMeta(state: OrderVerificationState): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className?: string;
} {
  switch (state) {
    case "completed":
      return {
        label: "Đã quét QR / Hoàn tất",
        variant: "default",
        className: "bg-emerald-600 hover:bg-emerald-700 text-white",
      };
    case "awaiting_qr_scan":
      return {
        label: "Chờ quét mã QR",
        variant: "secondary",
      };
    case "payment_only_sync_needed":
      return {
        label: "Đã thanh toán - Chờ đồng bộ",
        variant: "outline",
        className: "border-amber-500 text-amber-700 dark:text-amber-400",
      };
    case "unverified_status":
      return {
        label: "Chưa xác thực QR",
        variant: "destructive",
      };
    case "refunded":
      return {
        label: "Đã hoàn tiền",
        variant: "outline",
      };
    case "cancelled":
      return {
        label: "Đã hủy / Hết hạn QR",
        variant: "destructive",
      };
  }
}

function getOrderStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case "pending":
      return "Chờ quét mã QR";
    case "paid":
      return "Đã thanh toán";
    case "delivered":
      return "Hoàn thành";
    case "refunded":
      return "Hoàn tiền";
    case "cancelled":
      return "Đã hủy";
    default:
      return status || "Không xác định";
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const [sellers, setSellers] = useState<ProfileRow[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [orderFilter, setOrderFilter] = useState<OrderFilterValue>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [syncingAllPayOS, setSyncingAllPayOS] = useState(false);

  const [confirmManualOrder, setConfirmManualOrder] = useState<PendingManualConfirmState | null>(null);
  const [rejectDialog, setRejectDialog] = useState<RejectWithdrawalState | null>(null);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchDashboardData = useCallback(async (isBackgroundRefresh = false) => {
    try {
      if (isBackgroundRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        sellersRes,
        ordersRes,
        withdrawalsRes,
        profilesRes,
        productsRes,
        categoriesRes,
        bankAccountsRes,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("role", "seller")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select(`
            *,
            buyer:profiles!orders_buyer_id_fkey(full_name, email),
            seller:profiles!orders_seller_id_fkey(full_name, email),
            product:products(title, category_id),
            payments(id, status, payment_method, payment_id, amount, processed_at, created_at)
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("withdrawal_requests")
          .select(`
            *,
            bank_accounts(bank_name, account_number, account_holder_name)
          `)
          .order("requested_at", { ascending: false }),
        supabase.from("profiles").select("user_id, full_name, email"),
        supabase
          .from("products")
          .select(`
            *,
            seller:profiles!products_seller_id_fkey(full_name, email),
            category:categories(name)
          `)
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*"),
        supabase
          .from("bank_accounts")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (sellersRes.error) throw sellersRes.error;
      if (withdrawalsRes.error) throw withdrawalsRes.error;
      if (productsRes.error) throw productsRes.error;

      const profilesData = profilesRes.data || [];
      const withdrawalsWithProfiles = (withdrawalsRes.data || []).map((w) => ({
        ...w,
        user: profilesData.find((p) => p.user_id === w.user_id) || null,
      }));

      setSellers(sellersRes.data || []);
      setOrders((ordersRes.data as AdminOrder[] | null) || []);
      setWithdrawals(withdrawalsWithProfiles as AdminWithdrawal[]);
      setProducts((productsRes.data as AdminProduct[] | null) || []);
      setCategories(categoriesRes.data || []);
      setBankAccounts(bankAccountsRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu quản trị");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData(false);
    }
  }, [isAdmin, fetchDashboardData]);

  const orderStats = useMemo(
    () => calculateDashboardOrderStats(orders as OrderForCalculation[]),
    [orders],
  );

  const revenueData = useMemo(
    () => calculateMonthlyRevenue(orders as OrderForCalculation[], 6),
    [orders],
  );

  const currentMonthRevenue = useMemo(
    () =>
      revenueData.at(-1) ?? {
        month: "",
        revenue: 0,
        commission: 0,
        completedOrders: 0,
      },
    [revenueData],
  );

  const categoryData = useMemo(
    () =>
      categories
        .map((cat) => ({
          name: cat.name,
          value: products.filter((p) => p.category_id === cat.id).length,
        }))
        .filter((c) => c.value > 0),
    [categories, products],
  );

  const activeProductsCount = useMemo(
    () => products.filter((p) => p.status === "active").length,
    [products],
  );

  const pendingWithdrawalsCount = useMemo(
    () => withdrawals.filter((w) => w.status === "pending").length,
    [withdrawals],
  );

  const pendingPayosOrders = useMemo(
    () =>
      orders.filter((order) => {
        const state = getOrderVerificationState(order as OrderForCalculation);
        return (
          (state === "awaiting_qr_scan" || state === "payment_only_sync_needed") &&
          Boolean(extractPayOSOrderCode(order as OrderForCalculation))
        );
      }),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const keyword = orderSearch.trim().toLowerCase();

    return orders.filter((order) => {
      const state = getOrderVerificationState(order as OrderForCalculation);
      if (orderFilter === "needs_attention") {
        if (state !== "unverified_status" && state !== "payment_only_sync_needed") {
          return false;
        }
      } else if (orderFilter !== "all" && state !== orderFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const primaryPayment = getPrimaryPayment(order as OrderForCalculation);
      const haystack = [
        order.order_number,
        order.buyer?.full_name,
        order.buyer_email,
        order.seller?.full_name,
        order.product?.title,
        primaryPayment?.payment_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [orders, orderFilter, orderSearch]);

  const callPayosVerifyEndpoint = async (orderCode: string, accessToken: string) => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/payos-verify-payment?orderCode=${encodeURIComponent(orderCode)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        response.status === 403
          ? "Edge function payos-verify-payment cần được deploy phiên bản hỗ trợ quyền admin."
          : payload?.error || `Lỗi kiểm tra PayOS (${response.status})`;
      throw new Error(message);
    }

    return payload;
  };

  const verifyPayOSOrder = async (order: AdminOrder) => {
    const orderCode = extractPayOSOrderCode(order as OrderForCalculation);
    if (!orderCode) {
      toast.error("Đơn hàng này không có mã giao dịch PayOS hợp lệ");
      return;
    }

    try {
      setVerifyingOrderId(order.id);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        return;
      }

      const result = await callPayosVerifyEndpoint(orderCode, session.access_token);
      const payosStatus = result?.status;

      if (payosStatus === "PAID") {
        toast.success(`Đơn ${order.order_number} đã được quét QR thanh toán thành công trên PayOS`);
      } else if (payosStatus === "CANCELLED" || payosStatus === "EXPIRED" || payosStatus === "FAILED") {
        toast.info(`Đơn ${order.order_number} đã hủy/hết hạn trên PayOS (${payosStatus})`);
      } else {
        toast.info(`Đơn ${order.order_number}: khách chưa quét mã thanh toán (${payosStatus || "PENDING"})`);
      }

      await fetchDashboardData(true);
    } catch (error) {
      console.error("Error verifying PayOS order:", error);
      toast.error(error instanceof Error ? error.message : "Không thể kiểm tra PayOS");
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const verifyAllPendingPayOS = async () => {
    if (pendingPayosOrders.length === 0) return;

    try {
      setSyncingAllPayOS(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        return;
      }

      let paidCount = 0;
      let cancelledCount = 0;
      let pendingCount = 0;
      let errorCount = 0;

      for (const order of pendingPayosOrders) {
        const orderCode = extractPayOSOrderCode(order as OrderForCalculation);
        if (!orderCode) continue;

        try {
          const result = await callPayosVerifyEndpoint(orderCode, session.access_token);
          if (result?.status === "PAID") {
            paidCount += 1;
          } else if (
            result?.status === "CANCELLED" ||
            result?.status === "EXPIRED" ||
            result?.status === "FAILED"
          ) {
            cancelledCount += 1;
          } else {
            pendingCount += 1;
          }
        } catch (err) {
          console.error(`PayOS sync failed for ${order.order_number}:`, err);
          errorCount += 1;
        }
      }

      if (errorCount > 0 && paidCount === 0 && cancelledCount === 0 && pendingCount === 0) {
        toast.error("Không thể đồng bộ PayOS. Hãy kiểm tra deploy edge function payos-verify-payment.");
      } else {
        toast.success(
          `Đồng bộ xong: ${paidCount} đã quét QR, ${cancelledCount} hủy/hết hạn, ${pendingCount} vẫn chờ quét` +
            (errorCount > 0 ? `, ${errorCount} lỗi` : ""),
        );
      }

      await fetchDashboardData(true);
    } finally {
      setSyncingAllPayOS(false);
    }
  };

  const executeOrderStatusUpdate = async (
    order: AdminOrder,
    newStatus: OrderStatus,
    confirmManualPayment: boolean,
  ) => {
    try {
      // Important: column grant restricts `orders` client updates to `status` only
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", order.id);

      if (orderError) throw orderError;

      const existingPayments = getOrderPayments(order as OrderForCalculation);

      if (confirmManualPayment && (newStatus === "delivered" || newStatus === "paid")) {
        const nowIso = new Date().toISOString();
        if (existingPayments.length > 0) {
          const { error: payUpdateError } = await supabase
            .from("payments")
            .update({
              status: "completed",
              processed_at: nowIso,
            })
            .eq("order_id", order.id);
          if (payUpdateError) throw payUpdateError;
        } else {
          const { error: payInsertError } = await supabase.from("payments").insert({
            order_id: order.id,
            amount: toNumber(order.total_amount),
            currency: "VND",
            payment_method: "manual_admin_confirm",
            status: "completed",
            processed_at: nowIso,
          });
          if (payInsertError) throw payInsertError;
        }
      } else if (newStatus === "cancelled" && existingPayments.length > 0) {
        const { error: payCancelError } = await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("order_id", order.id)
          .neq("status", "refunded");
        if (payCancelError) throw payCancelError;
      } else if (newStatus === "refunded" && existingPayments.length > 0) {
        const { error: payRefundError } = await supabase
          .from("payments")
          .update({ status: "refunded" })
          .eq("order_id", order.id);
        if (payRefundError) throw payRefundError;
      } else if (newStatus === "pending" && existingPayments.length > 0) {
        const { error: payResetError } = await supabase
          .from("payments")
          .update({ status: "pending", processed_at: null })
          .eq("order_id", order.id);
        if (payResetError) throw payResetError;
      }

      toast.success("Cập nhật trạng thái đơn hàng thành công");
      await fetchDashboardData(true);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Không thể cập nhật đơn hàng");
    }
  };

  const handleOrderStatusSelect = (order: AdminOrder, newStatus: OrderStatus) => {
    if (order.status === newStatus) {
      return;
    }

    if (
      (newStatus === "paid" || newStatus === "delivered") &&
      !hasCompletedPayment(order as OrderForCalculation)
    ) {
      setConfirmManualOrder({ order, targetStatus: newStatus });
      return;
    }

    void executeOrderStatusUpdate(order, newStatus, false);
  };

  const updateWithdrawalStatus = async (
    withdrawalId: string,
    newStatus: "pending" | "processing" | "completed" | "rejected",
    notes?: string,
  ) => {
    try {
      const updateData: Database["public"]["Tables"]["withdrawal_requests"]["Update"] = {
        status: newStatus,
        processed_at: new Date().toISOString(),
      };

      if (notes) {
        if (newStatus === "rejected") {
          updateData.rejected_reason = notes;
        } else {
          updateData.admin_notes = notes;
        }
      }

      const { error } = await supabase
        .from("withdrawal_requests")
        .update(updateData)
        .eq("id", withdrawalId);

      if (error) throw error;

      toast.success("Cập nhật yêu cầu rút tiền thành công");
      await fetchDashboardData(true);
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      toast.error("Không thể cập nhật yêu cầu rút tiền");
    }
  };

  const updateProductStatus = async (
    productId: string,
    newStatus: "draft" | "active" | "inactive",
  ) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ status: newStatus })
        .eq("id", productId);

      if (error) throw error;

      toast.success("Cập nhật trạng thái sản phẩm thành công");
      await fetchDashboardData(true);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Không thể cập nhật sản phẩm");
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản Trị Hệ Thống</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <QrCode className="h-4 w-4 text-primary shrink-0" />
            <span>
              Chỉ ghi nhận đơn hoàn thành, doanh thu, hoa hồng và số dư Seller khi khách hàng đã
              quét mã QR thanh toán thành công.
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pendingPayosOrders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={verifyAllPendingPayOS}
              disabled={syncingAllPayOS || refreshing}
            >
              {syncingAllPayOS ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4 mr-2" />
              )}
              Đồng bộ PayOS ({pendingPayosOrders.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Thu Thực Tế (Đã Quét QR)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderStats.totalCompletedRevenue.toLocaleString("vi-VN")} ₫
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tháng này: {currentMonthRevenue.revenue.toLocaleString("vi-VN")} ₫ ·{" "}
              {orderStats.completedOrders} đơn hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoa Hồng Sàn Thực Nhận</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {orderStats.totalCommission.toLocaleString("vi-VN")} ₫
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tháng này: {currentMonthRevenue.commission.toLocaleString("vi-VN")} ₫ · Từ đơn đã
              xác thực thanh toán
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạng Thái Đơn Hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderStats.completedOrders} / {orderStats.totalOrders} đơn
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Chờ quét QR: {orderStats.pendingQrOrders} · Hủy/Hoàn:{" "}
              {orderStats.cancelledOrders + orderStats.refundedOrders}
              {orderStats.unverifiedOrders > 0 && (
                <span className="text-amber-600 font-medium">
                  {" "}
                  · Cần kiểm tra: {orderStats.unverifiedOrders}
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Cửa Hàng</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Người bán đã đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản Phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeProductsCount}/{products.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Đang hoạt động / Tổng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yêu Cầu Rút Tiền</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingWithdrawalsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Đang chờ xử lý</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Doanh Thu 6 Tháng Gần Đây</CardTitle>
            <CardDescription>
              Chỉ tính đơn hàng đã quét mã QR thanh toán thành công (loại trừ đơn chờ QR / hủy)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => {
                    const num = Number(value);
                    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
                    if (num >= 1_000) return `${Math.round(num / 1_000)}k`;
                    return String(num);
                  }}
                />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString("vi-VN")} ₫`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  name="Doanh thu thực tế"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="hsl(var(--accent))"
                  name="Hoa hồng sàn"
                  strokeWidth={2}
                />
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
                  {categoryData.map((_entry, index) => (
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
          <TabsTrigger value="sellers">Cửa Hàng ({sellers.length})</TabsTrigger>
          <TabsTrigger value="products">Sản Phẩm ({products.length})</TabsTrigger>
          <TabsTrigger value="orders">
            Đơn Hàng ({orders.length})
            {orderStats.unverifiedOrders > 0 && (
              <Badge variant="destructive" className="ml-1.5 px-1.5 py-0 text-[10px]">
                {orderStats.unverifiedOrders}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            Rút Tiền
            {pendingWithdrawalsCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px]">
                {pendingWithdrawalsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Cửa Hàng</CardTitle>
              <CardDescription>
                Doanh số, hoa hồng sàn và số dư chỉ tính trên các đơn hàng đã quét mã QR thanh toán
                thành công
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên Cửa Hàng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead>Thông Tin Ngân Hàng</TableHead>
                      <TableHead>Sản Phẩm</TableHead>
                      <TableHead>Đơn Hoàn Thành</TableHead>
                      <TableHead>Tổng Doanh Thu</TableHead>
                      <TableHead>Hoa Hồng Sàn</TableHead>
                      <TableHead>Số Tiền Còn Lại</TableHead>
                      <TableHead>Ngày Đăng Ký</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellers.map((seller) => {
                      const sellerProducts = products.filter(
                        (p) => p.seller_id === seller.user_id,
                      ).length;
                      const financials = calculateSellerFinancials(
                        seller.user_id,
                        orders as OrderForCalculation[],
                        withdrawals as WithdrawalForCalculation[],
                      );
                      const sellerBankAccounts = bankAccounts.filter(
                        (ba) => ba.user_id === seller.user_id,
                      );

                      return (
                        <TableRow key={seller.id}>
                          <TableCell className="font-medium">
                            {seller.full_name || "Chưa cập nhật"}
                          </TableCell>
                          <TableCell>{seller.email}</TableCell>
                          <TableCell>
                            <Badge variant={seller.is_verified ? "default" : "secondary"}>
                              {seller.is_verified ? "Đã xác minh" : "Chưa xác minh"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sellerBankAccounts.length > 0 ? (
                              <div className="space-y-1">
                                {sellerBankAccounts.map((ba) => (
                                  <div key={ba.id} className="text-xs">
                                    <div className="font-medium">{ba.bank_name}</div>
                                    <div className="text-muted-foreground">
                                      {ba.account_number} - {ba.account_holder_name}
                                    </div>
                                    {ba.is_primary && (
                                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                                        Chính
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Chưa đăng ký</span>
                            )}
                          </TableCell>
                          <TableCell>{sellerProducts}</TableCell>
                          <TableCell>
                            <div className="font-medium">{financials.completedOrderCount}</div>
                            {financials.pendingQrOrderCount > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {financials.pendingQrOrderCount} chờ QR
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {financials.grossSales.toLocaleString("vi-VN")} ₫
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Seller nhận: {financials.sellerEarnings.toLocaleString("vi-VN")} ₫
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {financials.platformCommission.toLocaleString("vi-VN")} ₫
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-primary">
                              {financials.remainingBalance.toLocaleString("vi-VN")} ₫
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Đã rút: {financials.totalWithdrawn.toLocaleString("vi-VN")} ₫
                              {financials.pendingWithdrawalsAmount > 0 &&
                                ` · Đang chờ: ${financials.pendingWithdrawalsAmount.toLocaleString("vi-VN")} ₫`}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(seller.created_at).toLocaleDateString("vi-VN")}
                          </TableCell>
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
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {product.title}
                        </TableCell>
                        <TableCell>{product.seller?.full_name || product.seller?.email}</TableCell>
                        <TableCell>{product.category?.name}</TableCell>
                        <TableCell>
                          {toNumber(product.price).toLocaleString("vi-VN")} ₫
                        </TableCell>
                        <TableCell>{product.view_count || 0}</TableCell>
                        <TableCell>{product.download_count || 0}</TableCell>
                        <TableCell>
                          {product.rating_average
                            ? `⭐ ${product.rating_average.toFixed(1)} (${product.rating_count})`
                            : "Chưa có"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === "active"
                                ? "default"
                                : product.status === "draft"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {product.status === "active"
                              ? "Hoạt động"
                              : product.status === "draft"
                                ? "Nháp"
                                : "Tạm ngừng"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={product.status ?? "draft"}
                            onValueChange={(value) =>
                              updateProductStatus(product.id, value as "draft" | "active" | "inactive")
                            }
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
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Quản Lý Đơn Hàng</CardTitle>
                  <CardDescription>
                    Theo dõi trạng thái quét mã QR PayOS và phân phối hoa hồng thực tế
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative w-full sm:w-[260px]">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-2.5 top-3" />
                    <Input
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Tìm mã đơn, email, sản phẩm..."
                      className="pl-8"
                    />
                  </div>
                  <Select
                    value={orderFilter}
                    onValueChange={(val) => setOrderFilter(val as OrderFilterValue)}
                  >
                    <SelectTrigger className="w-full sm:w-[230px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả ({orders.length})</SelectItem>
                      <SelectItem value="completed">
                        Hoàn thành - Đã quét QR ({orderStats.completedOrders})
                      </SelectItem>
                      <SelectItem value="awaiting_qr_scan">
                        Chờ quét mã QR ({orderStats.pendingQrOrders})
                      </SelectItem>
                      <SelectItem value="cancelled">
                        Đã hủy / Hết hạn QR ({orderStats.cancelledOrders})
                      </SelectItem>
                      <SelectItem value="refunded">
                        Hoàn tiền ({orderStats.refundedOrders})
                      </SelectItem>
                      {orderStats.unverifiedOrders > 0 && (
                        <SelectItem value="needs_attention">
                          Chưa xác thực QR / Lệch trạng thái ({orderStats.unverifiedOrders})
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã Đơn</TableHead>
                      <TableHead>Người Mua</TableHead>
                      <TableHead>Sản Phẩm</TableHead>
                      <TableHead>Giá Trị Đơn</TableHead>
                      <TableHead>Hoa Hồng / Seller</TableHead>
                      <TableHead>Xác Thực QR</TableHead>
                      <TableHead>Trạng Thái Đơn</TableHead>
                      <TableHead>Ngày Tạo</TableHead>
                      <TableHead>Hành Động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Không có đơn hàng phù hợp với bộ lọc
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => {
                        const verificationState = getOrderVerificationState(
                          order as OrderForCalculation,
                        );
                        const verificationBadge = getVerificationBadgeMeta(verificationState);
                        const recognized = getRecognizedOrderAmounts(order as OrderForCalculation);
                        const primaryPayment = getPrimaryPayment(order as OrderForCalculation);
                        const payosCode = extractPayOSOrderCode(order as OrderForCalculation);
                        const isPayos = isPayOSOrder(order as OrderForCalculation);
                        const canVerifyPayos =
                          Boolean(payosCode) && verificationState !== "completed";

                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              <div>{order.order_number}</div>
                              <div className="text-xs text-muted-foreground">
                                {isPayos
                                  ? `PayOS QR${payosCode ? ` #${payosCode}` : ""}`
                                  : primaryPayment?.payment_method || "Chưa rõ kênh"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>{order.buyer?.full_name || "Khách"}</div>
                              <div className="text-xs text-muted-foreground">
                                {order.buyer?.email || order.buyer_email}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <div className="truncate font-medium">
                                {order.product?.title || "Sản phẩm"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Shop: {order.seller?.full_name || order.seller?.email || "—"}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {toNumber(order.total_amount).toLocaleString("vi-VN")} ₫
                            </TableCell>
                            <TableCell>
                              {verificationState === "completed" ? (
                                <div className="text-xs space-y-0.5">
                                  <div className="font-semibold text-primary">
                                    HH: {recognized.commissionAmount.toLocaleString("vi-VN")} ₫
                                  </div>
                                  <div className="text-muted-foreground">
                                    Seller: {recognized.sellerAmount.toLocaleString("vi-VN")} ₫
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground">
                                  <div className="font-medium">0 ₫</div>
                                  <div>Chưa ghi nhận</div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={verificationBadge.variant}
                                className={verificationBadge.className ?? ""}
                              >
                                {verificationState === "unverified_status" && (
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                )}
                                {verificationState === "awaiting_qr_scan" && (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {verificationBadge.label}
                              </Badge>
                              {primaryPayment?.processed_at && verificationState === "completed" && (
                                <div className="text-[11px] text-muted-foreground mt-1">
                                  Quét:{" "}
                                  {new Date(primaryPayment.processed_at).toLocaleString("vi-VN", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.status === "delivered"
                                    ? "default"
                                    : order.status === "pending"
                                      ? "secondary"
                                      : order.status === "paid"
                                        ? "outline"
                                        : "destructive"
                                }
                              >
                                {getOrderStatusLabel(order.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                              {new Date(order.created_at).toLocaleString("vi-VN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={order.status ?? "pending"}
                                  onValueChange={(value) =>
                                    handleOrderStatusSelect(order, value as OrderStatus)
                                  }
                                >
                                  <SelectTrigger className="w-[145px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Chờ quét mã QR</SelectItem>
                                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                                    <SelectItem value="delivered">Hoàn thành</SelectItem>
                                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    <SelectItem value="refunded">Hoàn tiền</SelectItem>
                                  </SelectContent>
                                </Select>
                                {canVerifyPayos && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => verifyPayOSOrder(order)}
                                    disabled={verifyingOrderId === order.id}
                                    title="Kiểm tra trạng thái quét QR thực tế trên PayOS"
                                  >
                                    {verifyingOrderId === order.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <QrCode className="h-3.5 w-3.5 mr-1" />
                                    )}
                                    Kiểm tra
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
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
                        <TableCell>
                          {withdrawal.user?.full_name || withdrawal.user?.email}
                        </TableCell>
                        <TableCell>
                          {toNumber(withdrawal.amount).toLocaleString("vi-VN")} ₫
                        </TableCell>
                        <TableCell>
                          {toNumber(withdrawal.fee).toLocaleString("vi-VN")} ₫
                        </TableCell>
                        <TableCell className="font-medium">
                          {toNumber(withdrawal.net_amount).toLocaleString("vi-VN")} ₫
                        </TableCell>
                        <TableCell>
                          {withdrawal.bank_accounts?.bank_name}
                          <br />
                          <span className="text-sm text-muted-foreground">
                            {withdrawal.bank_accounts?.account_number}
                          </span>
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {withdrawal.bank_accounts?.account_holder_name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              withdrawal.status === "completed"
                                ? "default"
                                : withdrawal.status === "pending"
                                  ? "secondary"
                                  : withdrawal.status === "processing"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {withdrawal.status === "pending"
                              ? "Chờ duyệt"
                              : withdrawal.status === "processing"
                                ? "Đang xử lý"
                                : withdrawal.status === "completed"
                                  ? "Hoàn tất"
                                  : "Từ chối"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(withdrawal.requested_at).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell>
                          {withdrawal.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateWithdrawalStatus(withdrawal.id, "completed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Đã chi tiền
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setRejectDialog({ withdrawalId: withdrawal.id, reason: "" })
                                }
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Từ chối
                              </Button>
                            </div>
                          )}
                          {withdrawal.status === "completed" && (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Đã thanh toán
                            </span>
                          )}
                          {withdrawal.status === "rejected" && (
                            <span className="text-destructive text-sm">
                              {withdrawal.rejected_reason}
                            </span>
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

      {/* Confirmation dialog when marking an unverified QR order as paid/delivered */}
      <AlertDialog
        open={Boolean(confirmManualOrder)}
        onOpenChange={(open) => {
          if (!open) setConfirmManualOrder(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Đơn hàng chưa có xác nhận quét mã QR
            </AlertDialogTitle>
            <AlertDialogDescription>
              Đơn hàng <strong>{confirmManualOrder?.order?.order_number}</strong> hiện chưa được
              PayOS xác nhận đã quét mã thanh toán thành công. Nếu xác nhận thủ công, hệ thống sẽ
              ghi nhận thanh toán hoàn tất, cộng doanh thu, hoa hồng sàn và hoa hồng affiliate (nếu
              có).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            {confirmManualOrder &&
              extractPayOSOrderCode(confirmManualOrder.order as OrderForCalculation) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const target = confirmManualOrder.order;
                    setConfirmManualOrder(null);
                    void verifyPayOSOrder(target);
                  }}
                >
                  <QrCode className="h-4 w-4 mr-1.5" />
                  Kiểm tra PayOS trước
                </Button>
              )}
            <AlertDialogAction
              onClick={() => {
                if (!confirmManualOrder) return;
                const { order, targetStatus } = confirmManualOrder;
                setConfirmManualOrder(null);
                void executeOrderStatusUpdate(order, targetStatus, true);
              }}
            >
              Xác nhận đã thu tiền
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Withdrawal rejection reason dialog */}
      <Dialog
        open={Boolean(rejectDialog)}
        onOpenChange={(open) => {
          if (!open) setRejectDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối để cửa hàng nắm thông tin chi tiết.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason">Lý do từ chối</Label>
            <Input
              id="reject-reason"
              value={rejectDialog?.reason ?? ""}
              onChange={(e) =>
                setRejectDialog((prev) => (prev ? { ...prev, reason: e.target.value } : null))
              }
              placeholder="Ví dụ: Thông tin tài khoản ngân hàng chưa khớp..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectDialog?.reason.trim()}
              onClick={() => {
                if (!rejectDialog) return;
                const reason = rejectDialog.reason.trim();
                const id = rejectDialog.withdrawalId;
                setRejectDialog(null);
                void updateWithdrawalStatus(id, "rejected", reason);
              }}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
