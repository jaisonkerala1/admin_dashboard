import type {
  CommunicationStats,
  CommunicationTrend,
  AstrologerCommunicationStats,
  CallDurationStats,
  PeakHoursData,
  CallSuccessRateTrend,
  CommunicationPeriod,
} from '@/types/communication';
import type { ApiResponse } from '@/types';

// Generate dummy data based on period
const generateDummyStats = (period: CommunicationPeriod): CommunicationStats => {
  const baseMultiplier = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  
  return {
    totalMessages: Math.floor(1250 * baseMultiplier),
    totalVoiceCalls: Math.floor(450 * baseMultiplier),
    totalVideoCalls: Math.floor(320 * baseMultiplier),
    totalCommunications: Math.floor(2020 * baseMultiplier),
    avgCallDuration: 18.5,
    activeConversations: Math.floor(180 * (baseMultiplier / 7)),
    completedCalls: Math.floor(680 * baseMultiplier),
    missedCalls: Math.floor(90 * baseMultiplier),
    rejectedCalls: Math.floor(40 * baseMultiplier),
  };
};

const generateDummyTrends = (period: CommunicationPeriod): CommunicationTrend[] => {
  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const trends: CommunicationTrend[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const baseMessages = 45 + Math.floor(Math.random() * 20);
    const baseVoiceCalls = 12 + Math.floor(Math.random() * 8);
    const baseVideoCalls = 8 + Math.floor(Math.random() * 6);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      messages: baseMessages,
      voiceCalls: baseVoiceCalls,
      videoCalls: baseVideoCalls,
      total: baseMessages + baseVoiceCalls + baseVideoCalls,
    });
  }

  return trends;
};

const generateDummyAstrologerStats = (): AstrologerCommunicationStats[] => {
  const names = [
    'Dr. Sharma',
    'Pandit Verma',
    'Acharya Patel',
    'Guru Singh',
    'Swami Kumar',
    'Rishi Mehta',
    'Jyotish Reddy',
    'Vedic Iyer',
    'Astro Nair',
    'Sage Bhatt',
    'Mystic Joshi',
    'Oracle Desai',
  ];

  return names.map((name, index) => {
    const messages = 80 + Math.floor(Math.random() * 100);
    const voiceCalls = 30 + Math.floor(Math.random() * 50);
    const videoCalls = 20 + Math.floor(Math.random() * 40);
    
    return {
      astrologerId: `astrologer_${index + 1}`,
      astrologerName: name,
      messages,
      voiceCalls,
      videoCalls,
      total: messages + voiceCalls + videoCalls,
    };
  }).sort((a, b) => b.total - a.total);
};

const generateDummyCallDurationStats = (): CallDurationStats[] => {
  const names = [
    'Dr. Sharma',
    'Pandit Verma',
    'Acharya Patel',
    'Guru Singh',
    'Swami Kumar',
    'Rishi Mehta',
    'Jyotish Reddy',
    'Vedic Iyer',
    'Astro Nair',
    'Sage Bhatt',
  ];

  return names.map((name, index) => ({
    astrologerId: `astrologer_${index + 1}`,
    astrologerName: name,
    avgVoiceCallDuration: 15 + Math.random() * 10,
    avgVideoCallDuration: 20 + Math.random() * 15,
    totalVoiceCalls: 30 + Math.floor(Math.random() * 50),
    totalVideoCalls: 20 + Math.floor(Math.random() * 40),
  }));
};

const generateDummyPeakHours = (): PeakHoursData[] => {
  const hours: PeakHoursData[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    // Peak hours: 9 AM - 11 PM (higher activity)
    const isPeak = hour >= 9 && hour <= 23;
    const baseMultiplier = isPeak ? 1.5 : 0.3;
    
    const messages = Math.floor((20 + Math.random() * 30) * baseMultiplier);
    const voiceCalls = Math.floor((5 + Math.random() * 10) * baseMultiplier);
    const videoCalls = Math.floor((3 + Math.random() * 8) * baseMultiplier);
    
    hours.push({
      hour,
      messages,
      voiceCalls,
      videoCalls,
      total: messages + voiceCalls + videoCalls,
    });
  }
  
  return hours;
};

const generateDummySuccessRateTrends = (period: CommunicationPeriod): CallSuccessRateTrend[] => {
  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const trends: CallSuccessRateTrend[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      completedRate: 75 + Math.random() * 15, // 75-90%
      missedRate: 5 + Math.random() * 8, // 5-13%
      rejectedRate: 3 + Math.random() * 5, // 3-8%
    });
  }

  return trends;
};

export const communicationApi = {
  // Get overview statistics
  getCommunicationStats: async (period: CommunicationPeriod = '7d'): Promise<ApiResponse<CommunicationStats>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateDummyStats(period),
    };
  },

  // Get communication trends over time
  getCommunicationTrends: async (period: CommunicationPeriod = '7d'): Promise<ApiResponse<CommunicationTrend[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateDummyTrends(period),
    };
  },

  // Get communication stats by astrologer
  getAstrologerCommunicationStats: async (_period: CommunicationPeriod = '7d'): Promise<ApiResponse<AstrologerCommunicationStats[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateDummyAstrologerStats(),
    };
  },

  // Get call duration statistics
  getCallDurationStats: async (_period: CommunicationPeriod = '7d'): Promise<ApiResponse<CallDurationStats[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateDummyCallDurationStats(),
    };
  },

  // Get peak hours data
  getPeakHours: async (_period: CommunicationPeriod = '7d'): Promise<ApiResponse<PeakHoursData[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateDummyPeakHours(),
    };
  },

  // Get call success rate trends
  getCallSuccessRateTrends: async (period: CommunicationPeriod = '7d'): Promise<ApiResponse<CallSuccessRateTrend[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateDummySuccessRateTrends(period),
    };
  },
};

