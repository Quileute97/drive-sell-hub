export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type OrderVerificationState =
  | 'completed'
  | 'awaiting_qr_scan'
  | 'payment_only_sync_needed'
  | 'unverified_status'
  | 'cancelled'
  | 'refunded';

export interface OrderPaymentRecord {
  id?: string | null;
  status?: PaymentStatus | string | null;
  payment_method?: string | null;
  payment_id?: string | null;
  amount?: number | string | null;
  processed_at?: string | null;
  created_at?: string | null;
}

export interface OrderForCalculation {
  id: string;
  order_number?: string | null;
  seller_id?: string | null;
  status?: OrderStatus | string | null;
  total_amount?: number | string | null;
  commission_amount?: number | string | null;
  commission_rate?: number | string | null;
  seller_amount?: number | string | null;
  created_at: string;
  payments?: OrderPaymentRecord[] | OrderPaymentRecord | null;
}

export interface WithdrawalForCalculation {
  user_id?: string | null;
  amount?: number | string | null;
  fee?: number | string | null;
  net_amount?: number | string | null;
  status?: string | null;
}

export interface DashboardOrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingQrOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  unverifiedOrders: number;
  totalCompletedRevenue: number;
  totalCommission: number;
  totalSellerEarnings: number;
}

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  commission: number;
  completedOrders: number;
}

export interface SellerFinancialSummary {
  completedOrderCount: number;
  pendingQrOrderCount: number;
  grossSales: number;
  sellerEarnings: number;
  platformCommission: number;
  totalWithdrawn: number;
  pendingWithdrawalsAmount: number;
  remainingBalance: number;
}

export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getOrderPayments(order: Pick<OrderForCalculation, 'payments'> | null | undefined): OrderPaymentRecord[] {
  if (!order || !order.payments) {
    return [];
  }
  if (Array.isArray(order.payments)) {
    return order.payments.filter((p): p is OrderPaymentRecord => Boolean(p));
  }
  return [order.payments];
}

export function getPrimaryPayment(order: Pick<OrderForCalculation, 'payments'> | null | undefined): OrderPaymentRecord | null {
  const payments = getOrderPayments(order);
  if (payments.length === 0) {
    return null;
  }

  const sorted = [...payments].sort((a, b) => {
    const aCompleted = a.status === 'completed' ? 1 : 0;
    const bCompleted = b.status === 'completed' ? 1 : 0;
    if (aCompleted !== bCompleted) {
      return bCompleted - aCompleted;
    }

    const aTime = Date.parse(a.processed_at || a.created_at || '') || 0;
    const bTime = Date.parse(b.processed_at || b.created_at || '') || 0;
    return bTime - aTime;
  });

  return sorted[0] ?? null;
}

export function hasCompletedPayment(order: Pick<OrderForCalculation, 'payments'> | null | undefined): boolean {
  return getOrderPayments(order).some((payment) => payment.status === 'completed');
}

export function isPayOSOrder(
  order: Pick<OrderForCalculation, 'payments' | 'order_number'> | null | undefined,
): boolean {
  if (!order) {
    return false;
  }
  const payments = getOrderPayments(order);
  if (payments.some((payment) => payment.payment_method === 'payos')) {
    return true;
  }
  if (payments.length === 0 && typeof order.order_number === 'string') {
    return /^ORD\d{13,}$/.test(order.order_number.trim());
  }
  return false;
}

export function extractPayOSOrderCode(
  order: Pick<OrderForCalculation, 'payments' | 'order_number'> | null | undefined,
): string | null {
  if (!order) {
    return null;
  }

  const payments = getOrderPayments(order);
  const payosPayment = payments.find(
    (payment) => payment.payment_method === 'payos' && Boolean(payment.payment_id?.trim()),
  );
  if (payosPayment?.payment_id) {
    return payosPayment.payment_id.trim();
  }

  if (isPayOSOrder(order) && typeof order.order_number === 'string') {
    const match = /^ORD(\d{10,})$/.exec(order.order_number.trim());
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Classifies an order's true payment + fulfillment verification state.
 * Only orders where the customer has completed payment (e.g. scanned PayOS QR -> payments.status === 'completed')
 * AND the order itself is not pending/cancelled/refunded reach 'completed'.
 */
export function getOrderVerificationState(
  order: OrderForCalculation | null | undefined,
): OrderVerificationState {
  if (!order) {
    return 'awaiting_qr_scan';
  }

  if (order.status === 'refunded') {
    return 'refunded';
  }

  if (order.status === 'cancelled') {
    return 'cancelled';
  }

  const paid = hasCompletedPayment(order);

  if (order.status === 'delivered' || order.status === 'paid') {
    return paid ? 'completed' : 'unverified_status';
  }

  if (paid) {
    return 'payment_only_sync_needed';
  }

  const payments = getOrderPayments(order);
  if (payments.length > 0 && payments.every((payment) => payment.status === 'failed')) {
    return 'cancelled';
  }
  if (payments.some((payment) => payment.status === 'refunded')) {
    return 'refunded';
  }

  return 'awaiting_qr_scan';
}

export function isOrderCompleted(order: OrderForCalculation | null | undefined): boolean {
  return getOrderVerificationState(order) === 'completed';
}

export function getRecognizedOrderAmounts(order: OrderForCalculation | null | undefined): {
  grossAmount: number;
  commissionAmount: number;
  sellerAmount: number;
} {
  if (!isOrderCompleted(order) || !order) {
    return {
      grossAmount: 0,
      commissionAmount: 0,
      sellerAmount: 0,
    };
  }

  return {
    grossAmount: toNumber(order.total_amount),
    commissionAmount: toNumber(order.commission_amount),
    sellerAmount: toNumber(order.seller_amount),
  };
}

export function calculateDashboardOrderStats(orders: OrderForCalculation[]): DashboardOrderStats {
  const stats: DashboardOrderStats = {
    totalOrders: orders.length,
    completedOrders: 0,
    pendingQrOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
    unverifiedOrders: 0,
    totalCompletedRevenue: 0,
    totalCommission: 0,
    totalSellerEarnings: 0,
  };

  for (const order of orders) {
    const state = getOrderVerificationState(order);
    switch (state) {
      case 'completed':
        stats.completedOrders += 1;
        stats.totalCompletedRevenue += toNumber(order.total_amount);
        stats.totalCommission += toNumber(order.commission_amount);
        stats.totalSellerEarnings += toNumber(order.seller_amount);
        break;
      case 'awaiting_qr_scan':
        stats.pendingQrOrders += 1;
        break;
      case 'cancelled':
        stats.cancelledOrders += 1;
        break;
      case 'refunded':
        stats.refundedOrders += 1;
        break;
      case 'unverified_status':
      case 'payment_only_sync_needed':
        stats.unverifiedOrders += 1;
        break;
    }
  }

  return stats;
}

export function calculateMonthlyRevenue(
  orders: OrderForCalculation[],
  monthsCount = 6,
  referenceDate: Date = new Date(),
): MonthlyRevenuePoint[] {
  const completedOrders = orders.filter(isOrderCompleted);

  return Array.from({ length: monthsCount }, (_, index) => {
    const monthDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - (monthsCount - 1 - index),
      1,
    );
    const targetMonth = monthDate.getMonth();
    const targetYear = monthDate.getFullYear();

    let revenue = 0;
    let commission = 0;
    let orderCount = 0;

    for (const order of completedOrders) {
      const orderDate = new Date(order.created_at);
      if (Number.isNaN(orderDate.getTime())) {
        continue;
      }
      if (orderDate.getMonth() === targetMonth && orderDate.getFullYear() === targetYear) {
        revenue += toNumber(order.total_amount);
        commission += toNumber(order.commission_amount);
        orderCount += 1;
      }
    }

    return {
      month: `${targetMonth + 1}/${targetYear}`,
      revenue,
      commission,
      completedOrders: orderCount,
    };
  });
}

export function calculateSellerFinancials(
  sellerUserId: string,
  orders: OrderForCalculation[],
  withdrawals: WithdrawalForCalculation[],
): SellerFinancialSummary {
  const sellerOrders = orders.filter((order) => order.seller_id === sellerUserId);

  let completedOrderCount = 0;
  let pendingQrOrderCount = 0;
  let grossSales = 0;
  let sellerEarnings = 0;
  let platformCommission = 0;

  for (const order of sellerOrders) {
    const state = getOrderVerificationState(order);
    if (state === 'completed') {
      completedOrderCount += 1;
      grossSales += toNumber(order.total_amount);
      sellerEarnings += toNumber(order.seller_amount);
      platformCommission += toNumber(order.commission_amount);
    } else if (state === 'awaiting_qr_scan') {
      pendingQrOrderCount += 1;
    }
  }

  let totalWithdrawn = 0;
  let pendingWithdrawalsAmount = 0;

  for (const withdrawal of withdrawals) {
    if (withdrawal.user_id !== sellerUserId) {
      continue;
    }
    if (withdrawal.status === 'completed') {
      totalWithdrawn += toNumber(withdrawal.amount);
    } else if (withdrawal.status === 'pending' || withdrawal.status === 'processing') {
      pendingWithdrawalsAmount += toNumber(withdrawal.amount);
    }
  }

  return {
    completedOrderCount,
    pendingQrOrderCount,
    grossSales,
    sellerEarnings,
    platformCommission,
    totalWithdrawn,
    pendingWithdrawalsAmount,
    remainingBalance: sellerEarnings - totalWithdrawn,
  };
}

