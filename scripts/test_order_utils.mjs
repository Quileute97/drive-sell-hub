import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDashboardOrderStats,
  calculateMonthlyRevenue,
  calculateSellerFinancials,
  extractPayOSOrderCode,
  getOrderVerificationState,
  getRecognizedOrderAmounts,
  hasCompletedPayment,
  isOrderCompleted,
  isPayOSOrder,
} from '../src/lib/orderUtils.ts';

test('pending PayOS QR display order is NOT counted as completed or commission', () => {
  const qrDisplayedOrder = {
    id: 'ord-qr-pending',
    order_number: 'ORD1740000000123',
    seller_id: 'seller-1',
    status: 'pending',
    total_amount: 200000,
    commission_rate: 15,
    commission_amount: 30000,
    seller_amount: 170000,
    created_at: '2026-03-15T10:00:00.000Z',
    payments: [
      {
        id: 'pay-1',
        payment_method: 'payos',
        payment_id: '1740000000123',
        status: 'pending',
        amount: 200000,
        processed_at: null,
        created_at: '2026-03-15T10:00:00.000Z',
      },
    ],
  };

  assert.equal(hasCompletedPayment(qrDisplayedOrder), false);
  assert.equal(getOrderVerificationState(qrDisplayedOrder), 'awaiting_qr_scan');
  assert.equal(isOrderCompleted(qrDisplayedOrder), false);
  assert.deepEqual(getRecognizedOrderAmounts(qrDisplayedOrder), {
    grossAmount: 0,
    commissionAmount: 0,
    sellerAmount: 0,
  });
  assert.equal(isPayOSOrder(qrDisplayedOrder), true);
  assert.equal(extractPayOSOrderCode(qrDisplayedOrder), '1740000000123');
});

test('completed PayOS QR payment (delivered + payment completed) IS counted accurately', () => {
  const paidQrOrder = {
    id: 'ord-qr-paid',
    order_number: 'ORD1740000000456',
    seller_id: 'seller-1',
    status: 'delivered',
    total_amount: 200000,
    commission_rate: 15,
    commission_amount: 30000,
    seller_amount: 170000,
    created_at: '2026-03-16T10:00:00.000Z',
    payments: [
      {
        id: 'pay-2',
        payment_method: 'payos',
        payment_id: '1740000000456',
        status: 'completed',
        amount: 200000,
        processed_at: '2026-03-16T10:02:00.000Z',
        created_at: '2026-03-16T10:00:00.000Z',
      },
    ],
  };

  assert.equal(hasCompletedPayment(paidQrOrder), true);
  assert.equal(getOrderVerificationState(paidQrOrder), 'completed');
  assert.equal(isOrderCompleted(paidQrOrder), true);
  assert.deepEqual(getRecognizedOrderAmounts(paidQrOrder), {
    grossAmount: 200000,
    commissionAmount: 30000,
    sellerAmount: 170000,
  });
});

test('legacy paid order with completed payment is counted as completed', () => {
  const legacyPaidOrder = {
    id: 'ord-legacy-paid',
    order_number: 'ORD1700000000001',
    seller_id: 'seller-1',
    status: 'paid',
    total_amount: 100000,
    commission_amount: 15000,
    seller_amount: 85000,
    created_at: '2026-02-10T10:00:00.000Z',
    payments: [{ payment_method: 'payos', status: 'completed' }],
  };

  assert.equal(getOrderVerificationState(legacyPaidOrder), 'completed');
  assert.equal(isOrderCompleted(legacyPaidOrder), true);
});

test('delivered/paid order WITHOUT completed payment is flagged unverified and NOT counted', () => {
  const tamperedOrder = {
    id: 'ord-tampered',
    order_number: 'ORD1740000000789',
    seller_id: 'seller-1',
    status: 'delivered',
    total_amount: 500000,
    commission_amount: 75000,
    seller_amount: 425000,
    created_at: '2026-03-17T10:00:00.000Z',
    payments: [{ payment_method: 'payos', payment_id: '1740000000789', status: 'pending' }],
  };

  const missingPaymentOrder = {
    id: 'ord-no-payment',
    order_number: 'ORD202603170001',
    seller_id: 'seller-1',
    status: 'delivered',
    total_amount: 300000,
    commission_amount: 45000,
    seller_amount: 255000,
    created_at: '2026-03-17T11:00:00.000Z',
    payments: [],
  };

  assert.equal(getOrderVerificationState(tamperedOrder), 'unverified_status');
  assert.equal(isOrderCompleted(tamperedOrder), false);
  assert.equal(getOrderVerificationState(missingPaymentOrder), 'unverified_status');
  assert.equal(isOrderCompleted(missingPaymentOrder), false);
  assert.equal(extractPayOSOrderCode(missingPaymentOrder), null);
});

test('cancelled, expired, and refunded orders yield 0 revenue and 0 commission', () => {
  const cancelledOrder = {
    id: 'ord-cancel',
    status: 'cancelled',
    total_amount: 150000,
    commission_amount: 22500,
    seller_amount: 127500,
    created_at: '2026-03-10T10:00:00.000Z',
    payments: [{ payment_method: 'payos', status: 'failed' }],
  };
  const failedPaymentOnly = {
    id: 'ord-expired',
    status: 'pending',
    total_amount: 150000,
    commission_amount: 22500,
    seller_amount: 127500,
    created_at: '2026-03-10T10:00:00.000Z',
    payments: [{ payment_method: 'payos', status: 'failed' }],
  };
  const refundedOrder = {
    id: 'ord-refund',
    status: 'refunded',
    total_amount: 150000,
    commission_amount: 22500,
    seller_amount: 127500,
    created_at: '2026-03-10T10:00:00.000Z',
    payments: [{ payment_method: 'payos', status: 'refunded' }],
  };

  assert.equal(getOrderVerificationState(cancelledOrder), 'cancelled');
  assert.equal(getOrderVerificationState(failedPaymentOnly), 'cancelled');
  assert.equal(getOrderVerificationState(refundedOrder), 'refunded');
  assert.equal(isOrderCompleted(cancelledOrder), false);
  assert.equal(isOrderCompleted(failedPaymentOnly), false);
  assert.equal(isOrderCompleted(refundedOrder), false);
});

test('calculateDashboardOrderStats and calculateSellerFinancials ignore unpaid QR orders', () => {
  const orders = [
    {
      id: '1',
      seller_id: 'seller-a',
      status: 'pending',
      total_amount: 500000,
      commission_amount: 75000,
      seller_amount: 425000,
      created_at: '2026-03-15T10:00:00.000Z',
      payments: [{ payment_method: 'payos', status: 'pending' }],
    },
    {
      id: '2',
      seller_id: 'seller-a',
      status: 'delivered',
      total_amount: 200000,
      commission_amount: 30000,
      seller_amount: 170000,
      created_at: '2026-03-16T10:00:00.000Z',
      payments: [{ payment_method: 'payos', status: 'completed' }],
    },
    {
      id: '3',
      seller_id: 'seller-a',
      status: 'cancelled',
      total_amount: 100000,
      commission_amount: 15000,
      seller_amount: 85000,
      created_at: '2026-03-17T10:00:00.000Z',
      payments: [{ payment_method: 'payos', status: 'failed' }],
    },
    {
      id: '4',
      seller_id: 'seller-b',
      status: 'delivered',
      total_amount: 100000,
      commission_amount: 15000,
      seller_amount: 85000,
      created_at: '2026-03-18T10:00:00.000Z',
      payments: [{ payment_method: 'payos', status: 'pending' }],
    },
  ];

  const withdrawals = [
    { user_id: 'seller-a', amount: 50000, status: 'completed' },
    { user_id: 'seller-a', amount: 20000, status: 'pending' },
  ];

  const stats = calculateDashboardOrderStats(orders);
  assert.deepEqual(stats, {
    totalOrders: 4,
    completedOrders: 1,
    pendingQrOrders: 1,
    cancelledOrders: 1,
    refundedOrders: 0,
    unverifiedOrders: 1,
    totalCompletedRevenue: 200000,
    totalCommission: 30000,
    totalSellerEarnings: 170000,
  });

  const sellerA = calculateSellerFinancials('seller-a', orders, withdrawals);
  assert.deepEqual(sellerA, {
    completedOrderCount: 1,
    pendingQrOrderCount: 1,
    grossSales: 200000,
    sellerEarnings: 170000,
    platformCommission: 30000,
    totalWithdrawn: 50000,
    pendingWithdrawalsAmount: 20000,
    remainingBalance: 120000,
  });

  const sellerB = calculateSellerFinancials('seller-b', orders, withdrawals);
  assert.equal(sellerB.grossSales, 0);
  assert.equal(sellerB.platformCommission, 0);
  assert.equal(sellerB.remainingBalance, 0);
});

test('calculateMonthlyRevenue avoids March-31 rollover bug and sums completed orders only', () => {
  const referenceDate = new Date(2026, 2, 31, 12, 0, 0); // March 31, 2026 local
  const orders = [
    {
      id: 'feb-paid',
      status: 'delivered',
      total_amount: 100000,
      commission_amount: 15000,
      seller_amount: 85000,
      created_at: '2026-02-15T12:00:00',
      payments: [{ status: 'completed' }],
    },
    {
      id: 'feb-pending-qr',
      status: 'pending',
      total_amount: 999000,
      commission_amount: 149850,
      seller_amount: 849150,
      created_at: '2026-02-20T12:00:00',
      payments: [{ status: 'pending' }],
    },
    {
      id: 'mar-paid',
      status: 'delivered',
      total_amount: 200000,
      commission_amount: 30000,
      seller_amount: 170000,
      created_at: '2026-03-05T12:00:00',
      payments: [{ status: 'completed' }],
    },
  ];

  const monthly = calculateMonthlyRevenue(orders, 6, referenceDate);
  assert.deepEqual(
    monthly.map((m) => m.month),
    ['10/2025', '11/2025', '12/2025', '1/2026', '2/2026', '3/2026'],
  );
  assert.deepEqual(monthly[4], {
    month: '2/2026',
    revenue: 100000,
    commission: 15000,
    completedOrders: 1,
  });
  assert.deepEqual(monthly[5], {
    month: '3/2026',
    revenue: 200000,
    commission: 30000,
    completedOrders: 1,
  });
});

