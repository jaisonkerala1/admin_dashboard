// Earnings period types
export type EarningsPeriod = 'today' | '7d' | '1m' | '3m' | '1y';

// Overview totals
export interface EarningsOverview {
  gmv: number; // Gross Merchandise Value (total user spend)
  netRevenue: number; // Platform's net after commissions
  payouts: number; // Total paid to astrologers
  pendingPayouts: number; // Awaiting payout
  refunds: number; // Total refunded
  growthPercentage: number; // Period-over-period growth
}

// Trend data point
export interface EarningsTrendPoint {
  date: string;
  gmv: number;
  net: number;
  payouts: number;
}

// Breakdown by consultation type
export interface EarningsBreakdown {
  type: string; // 'Voice', 'Video', 'Chat', 'Pooja'
  amount: number;
  percentage: number;
  count: number; // number of consultations
}

// Top earning astrologer
export interface TopEarningAstrologer {
  _id: string;
  name: string;
  profilePicture?: string;
  totalGmv: number; // Total revenue generated
  netContribution: number; // Platform's cut
  consultations: number;
  rating: number;
}

// Complete earnings data
export interface EarningsData {
  period: EarningsPeriod;
  overview: EarningsOverview;
  trends: EarningsTrendPoint[];
  breakdown: EarningsBreakdown[];
  topAstrologers: TopEarningAstrologer[];
  lastUpdated: string;
}

// API response wrapper
export interface EarningsApiResponse {
  success: boolean;
  data: EarningsData;
}

