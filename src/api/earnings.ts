import { EarningsApiResponse, EarningsPeriod } from '@/types/earnings';

/**
 * Mock Earnings API
 * Returns deterministic dummy data based on period
 * Ready to swap with real backend endpoints
 */

const generateTrendData = (period: EarningsPeriod) => {
  const dataPoints: { [key: string]: number } = {
    today: 24,
    '7d': 7,
    '1m': 30,
    '3m': 12,
    '1y': 12,
  };

  const count = dataPoints[period] || 7;
  const trends = [];

  for (let i = count - 1; i >= 0; i--) {
    const baseGmv = 45000 + Math.random() * 15000;
    const baseNet = baseGmv * 0.20; // 20% platform cut
    const basePayout = baseGmv * 0.75; // 75% to astrologers

    let label = '';
    if (period === 'today') {
      label = `${i}:00`;
    } else if (period === '7d') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const date = new Date();
      date.setDate(date.getDate() - i);
      label = days[date.getDay()];
    } else if (period === '1m') {
      label = `Day ${count - i}`;
    } else if (period === '3m' || period === '1y') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      label = months[date.getMonth()];
    }

    trends.push({
      date: label,
      gmv: Math.round(baseGmv),
      net: Math.round(baseNet),
      payouts: Math.round(basePayout),
    });
  }

  return trends;
};

const generateBreakdown = () => {
  return [
    { type: 'Voice Calls', amount: 625000, percentage: 50, count: 1250 },
    { type: 'Video Calls', amount: 400000, percentage: 32, count: 800 },
    { type: 'Chat', amount: 150000, percentage: 12, count: 600 },
    { type: 'Pooja', amount: 75000, percentage: 6, count: 150 },
  ];
};

const generateTopAstrologers = () => {
  const names = [
    'Rajesh Kumar',
    'Priya Sharma',
    'Amit Patel',
    'Sneha Desai',
    'Rahul Verma',
    'Ananya Singh',
    'Vikram Joshi',
    'Kavita Mehta',
    'Sanjay Reddy',
    'Divya Nair',
  ];

  return names.map((name, index) => ({
    _id: `astro_${index + 1}`,
    name,
    profilePicture: undefined,
    totalGmv: 150000 - index * 12000,
    netContribution: (150000 - index * 12000) * 0.20,
    consultations: 300 - index * 20,
    rating: 4.8 - index * 0.1,
  }));
};

export const earningsApi = {
  getEarnings: async (period: EarningsPeriod = '1m'): Promise<EarningsApiResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const trends = generateTrendData(period);
    const totalGmv = trends.reduce((sum, t) => sum + t.gmv, 0);
    const totalNet = trends.reduce((sum, t) => sum + t.net, 0);
    const totalPayouts = trends.reduce((sum, t) => sum + t.payouts, 0);

    return {
      success: true,
      data: {
        period,
        overview: {
          gmv: totalGmv,
          netRevenue: totalNet,
          payouts: totalPayouts,
          pendingPayouts: 45000,
          refunds: 12000,
          growthPercentage: 12.5,
        },
        trends,
        breakdown: generateBreakdown(),
        topAstrologers: generateTopAstrologers(),
        lastUpdated: new Date().toISOString(),
      },
    };
  },
};

