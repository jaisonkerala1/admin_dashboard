import { WalletApiResponse, WalletPeriod, WalletTransaction, WalletAnalytics, PayoutRequest } from '@/types/wallet';

/**
 * Mock Wallet API
 * Returns deterministic dummy data based on period
 * Ready to swap with real backend endpoints
 */

const generateTransactions = (count: number): WalletTransaction[] => {
  const types: WalletTransaction['type'][] = ['deposit', 'withdrawal', 'payment', 'refund', 'commission', 'payout'];
  const statuses: WalletTransaction['status'][] = ['completed', 'pending', 'failed'];
  const userTypes: WalletTransaction['userType'][] = ['user', 'astrologer', 'admin'];
  
  const names = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Desai', 'Rahul Verma',
    'Ananya Singh', 'Vikram Joshi', 'Kavita Mehta', 'Sanjay Reddy', 'Divya Nair',
    'Arjun Menon', 'Meera Iyer', 'Karan Malhotra', 'Shreya Gupta', 'Rohan Kapoor'
  ];

  const transactions: WalletTransaction[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
    const userName = names[Math.floor(Math.random() * names.length)];
    
    // Generate realistic amounts based on type
    let amount = 0;
    if (type === 'deposit') {
      amount = Math.floor(Math.random() * 50000) + 1000; // 1000-51000
    } else if (type === 'withdrawal' || type === 'payout') {
      amount = Math.floor(Math.random() * 30000) + 5000; // 5000-35000
    } else if (type === 'payment') {
      amount = Math.floor(Math.random() * 5000) + 100; // 100-5100
    } else if (type === 'refund') {
      amount = Math.floor(Math.random() * 3000) + 50; // 50-3050
    } else {
      amount = Math.floor(Math.random() * 2000) + 100; // 100-2100
    }

    // Generate timestamp (spread over last 30 days)
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);

    const descriptions: Record<WalletTransaction['type'], string> = {
      deposit: 'Wallet top-up via Razorpay',
      withdrawal: 'Withdrawal request',
      payment: 'Service payment',
      refund: 'Refund processed',
      commission: 'Platform commission',
      payout: 'Astrologer payout',
    };

    transactions.push({
      id: `txn_${i + 1}_${Date.now()}`,
      type,
      status,
      amount,
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      userName,
      userAvatar: undefined,
      userType,
      description: descriptions[type],
      timestamp: timestamp.toISOString(),
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`,
      metadata: {
        consultationId: type === 'payment' ? `cons_${Math.floor(Math.random() * 1000)}` : undefined,
        serviceId: type === 'payment' ? `svc_${Math.floor(Math.random() * 100)}` : undefined,
        razorpayOrderId: type === 'deposit' ? `order_${Date.now()}` : undefined,
        razorpayPaymentId: type === 'deposit' ? `pay_${Date.now()}` : undefined,
      },
    });
  }

  // Sort by timestamp (newest first)
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateAnalytics = (period: WalletPeriod): WalletAnalytics => {
  const baseAmount = period === 'today' ? 50000 : period === 'thisWeek' ? 350000 : period === 'thisMonth' ? 1500000 : 18000000;
  
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      deposits: Math.floor(baseAmount * 0.4 * (0.8 + Math.random() * 0.4)),
      withdrawals: Math.floor(baseAmount * 0.3 * (0.8 + Math.random() * 0.4)),
      payments: Math.floor(baseAmount * 0.25 * (0.8 + Math.random() * 0.4)),
      total: 0,
    };
  }).map(point => ({
    ...point,
    total: point.deposits + point.withdrawals + point.payments,
  }));

  const dailyTrend = Array.from({ length: 24 }, (_, i) => ({
    date: `${i}:00`,
    deposits: Math.floor((baseAmount / 30) * 0.4 * (0.5 + Math.random() * 1)),
    withdrawals: Math.floor((baseAmount / 30) * 0.3 * (0.3 + Math.random() * 0.7)),
    payments: Math.floor((baseAmount / 30) * 0.25 * (0.4 + Math.random() * 0.8)),
    total: 0,
  })).map(point => ({
    ...point,
    total: point.deposits + point.withdrawals + point.payments,
  }));

  return {
    averageTransactionValue: Math.floor(baseAmount / 1000),
    dailyActiveWallets: Math.floor(500 + Math.random() * 200),
    transactionSuccessRate: 95 + Math.random() * 4,
    peakTransactionHour: '20:00',
    weeklyTrend,
    dailyTrend,
    byType: [
      { type: 'deposit', amount: baseAmount * 0.4, percentage: 40, count: 500 },
      { type: 'withdrawal', amount: baseAmount * 0.3, percentage: 30, count: 300 },
      { type: 'payment', amount: baseAmount * 0.2, percentage: 20, count: 2000 },
      { type: 'refund', amount: baseAmount * 0.05, percentage: 5, count: 50 },
      { type: 'commission', amount: baseAmount * 0.03, percentage: 3, count: 2000 },
      { type: 'payout', amount: baseAmount * 0.02, percentage: 2, count: 100 },
    ],
    byStatus: [
      { status: 'completed', count: 2800, percentage: 92 },
      { status: 'pending', count: 200, percentage: 6.5 },
      { status: 'failed', count: 50, percentage: 1.5 },
    ],
    peakHours: {
      morning: { earnings: baseAmount * 0.15, count: 200 },
      afternoon: { earnings: baseAmount * 0.25, count: 400 },
      evening: { earnings: baseAmount * 0.35, count: 600 },
      night: { earnings: baseAmount * 0.25, count: 300 },
    },
  };
};

const generatePayoutRequests = (): PayoutRequest[] => {
  const astrologers = [
    { name: 'Rajesh Kumar', id: 'astro_1' },
    { name: 'Priya Sharma', id: 'astro_2' },
    { name: 'Amit Patel', id: 'astro_3' },
    { name: 'Sneha Desai', id: 'astro_4' },
    { name: 'Rahul Verma', id: 'astro_5' },
  ];

  const banks = [
    { name: 'HDFC Bank', ifsc: 'HDFC0001234' },
    { name: 'ICICI Bank', ifsc: 'ICIC0005678' },
    { name: 'SBI Bank', ifsc: 'SBIN0009012' },
    { name: 'Axis Bank', ifsc: 'UTIB0003456' },
  ];

  const statuses: PayoutRequest['status'][] = ['pending_review', 'processing', 'completed', 'rejected'];

  return astrologers.map((astro, index) => {
    const bank = banks[index % banks.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const requestDate = new Date();
    requestDate.setDate(requestDate.getDate() - Math.floor(Math.random() * 30));

    return {
      id: `payout_${index + 1}`,
      astrologerId: astro.id,
      astrologerName: astro.name,
      astrologerAvatar: undefined,
      requestedAmount: Math.floor(Math.random() * 50000) + 10000,
      requestDate: requestDate.toISOString(),
      status,
      bankAccount: {
        bankName: bank.name,
        accountNumber: `****${Math.floor(Math.random() * 10000)}`,
        ifscCode: bank.ifsc,
        accountHolderName: astro.name,
      },
      processedDate: status === 'completed' ? new Date(requestDate.getTime() + 86400000 * 2).toISOString() : undefined,
      rejectionReason: status === 'rejected' ? 'Invalid bank account details' : undefined,
      transactionId: status === 'completed' ? `TXN${Date.now()}${index}` : undefined,
    };
  });
};

export const walletApi = {
  getWalletData: async (period: WalletPeriod = 'thisMonth'): Promise<WalletApiResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const analytics = generateAnalytics(period);
    const transactions = generateTransactions(300);
    const payouts = generatePayoutRequests();

    // Calculate balance from transactions
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions
      .filter(t => (t.type === 'withdrawal' || t.type === 'payout') && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount), 0);

    const baseBalance = 5000000; // 50L base
    const availableBalance = baseBalance + totalDeposits - totalWithdrawals;
    const reservedBalance = Math.floor(availableBalance * 0.1); // 10% reserved

    return {
      success: true,
      data: {
        period,
        balance: {
          totalBalance: availableBalance + reservedBalance,
          availableBalance: availableBalance - reservedBalance,
          pendingBalance: Math.max(0, pendingAmount),
          reservedBalance,
          growthPercentage: 12.5 + Math.random() * 5,
        },
        stats: {
          totalDeposits,
          totalWithdrawals,
          pendingTransactions,
          transactionCount: transactions.length,
          activeWallets: 2500 + Math.floor(Math.random() * 500),
          successRate: analytics.transactionSuccessRate,
        },
        transactions,
        analytics,
        payouts: {
          summary: {
            pendingPayouts: payouts.filter(p => p.status === 'pending_review' || p.status === 'processing').length,
            completedThisMonth: payouts.filter(p => p.status === 'completed').length,
            failedPayouts: payouts.filter(p => p.status === 'rejected').length,
            totalProcessed: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.requestedAmount, 0),
          },
          requests: payouts,
        },
        lastUpdated: new Date().toISOString(),
      },
    };
  },
};

