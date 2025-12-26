// Wallet period types
export type WalletPeriod = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear';

// Wallet balance information
export interface WalletBalance {
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  reservedBalance: number;
  growthPercentage: number;
}

// Wallet transaction types
export type WalletTransactionType = 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission' | 'payout';
export type WalletTransactionStatus = 'completed' | 'pending' | 'failed';

// Wallet transaction
export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  userType: 'user' | 'astrologer' | 'admin';
  description: string;
  timestamp: string;
  transactionId: string;
  metadata?: {
    consultationId?: string;
    serviceId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    notes?: string;
  };
}

// Wallet quick stats
export interface WalletStats {
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
  transactionCount: number;
  activeWallets: number;
  successRate: number;
}

// Wallet analytics data point
export interface WalletAnalyticsPoint {
  date: string;
  deposits: number;
  withdrawals: number;
  payments: number;
  total: number;
}

// Transaction breakdown by type
export interface TransactionTypeBreakdown {
  type: WalletTransactionType;
  amount: number;
  percentage: number;
  count: number;
}

// Transaction breakdown by status
export interface TransactionStatusBreakdown {
  status: WalletTransactionStatus;
  count: number;
  percentage: number;
}

// Peak hours analysis
export interface PeakHoursAnalysis {
  morning: { earnings: number; count: number };
  afternoon: { earnings: number; count: number };
  evening: { earnings: number; count: number };
  night: { earnings: number; count: number };
}

// Wallet analytics
export interface WalletAnalytics {
  averageTransactionValue: number;
  dailyActiveWallets: number;
  transactionSuccessRate: number;
  peakTransactionHour: string;
  weeklyTrend: WalletAnalyticsPoint[];
  dailyTrend: WalletAnalyticsPoint[];
  byType: TransactionTypeBreakdown[];
  byStatus: TransactionStatusBreakdown[];
  peakHours: PeakHoursAnalysis;
}

// Payout request
export type PayoutStatus = 'pending_review' | 'processing' | 'completed' | 'rejected';

export interface PayoutRequest {
  id: string;
  astrologerId: string;
  astrologerName: string;
  astrologerAvatar?: string;
  requestedAmount: number;
  requestDate: string;
  status: PayoutStatus;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  processedDate?: string;
  rejectionReason?: string;
  transactionId?: string;
}

// Payout summary
export interface PayoutSummary {
  pendingPayouts: number;
  completedThisMonth: number;
  failedPayouts: number;
  totalProcessed: number;
}

// Complete wallet data
export interface WalletData {
  period: WalletPeriod;
  balance: WalletBalance;
  stats: WalletStats;
  transactions: WalletTransaction[];
  analytics: WalletAnalytics;
  payouts: {
    summary: PayoutSummary;
    requests: PayoutRequest[];
  };
  lastUpdated: string;
}

// API response wrapper
export interface WalletApiResponse {
  success: boolean;
  data: WalletData;
}

