import apiClient from './client';
import type {
  CommunicationStats,
  CommunicationTrend,
  AstrologerCommunicationStats,
  CallDurationStats,
  PeakHoursData,
  CallSuccessRateTrend,
  CommunicationPeriod,
  CommunicationType,
} from '@/types/communication';
import type { ApiResponse } from '@/types';

// Dummy data generators for customer-astrologer communication
const generateDummyStats = (period: CommunicationPeriod): CommunicationStats => {
  const multipliers: { [key: string]: number } = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
  };
  const multiplier = multipliers[period] || 7;

  return {
    totalMessages: Math.round(1500 * multiplier),
    totalVoiceCalls: Math.round(450 * multiplier),
    totalVideoCalls: Math.round(280 * multiplier),
    totalCommunications: Math.round(2230 * multiplier),
    avgCallDuration: 12.5 + Math.random() * 5,
    activeConversations: Math.round(120 * multiplier),
    completedCalls: Math.round(680 * multiplier * 0.85),
    missedCalls: Math.round(680 * multiplier * 0.10),
    rejectedCalls: Math.round(680 * multiplier * 0.05),
  };
};

const generateDummyTrends = (period: CommunicationPeriod): CommunicationTrend[] => {
  const dataPoints: { [key: string]: number } = {
    '1d': 24,
    '7d': 7,
    '30d': 30,
    '90d': 12,
    '1y': 12,
  };

  const count = dataPoints[period] || 7;
  const trends: CommunicationTrend[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const baseMessages = 150 + Math.random() * 100;
    const baseVoiceCalls = 45 + Math.random() * 30;
    const baseVideoCalls = 28 + Math.random() * 20;

    let dateLabel = '';
    if (period === '1d') {
      dateLabel = `${23 - i}:00`;
    } else if (period === '7d') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateLabel = days[date.getDay()];
    } else if (period === '30d') {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateLabel = `${date.getDate()}/${date.getMonth() + 1}`;
    } else if (period === '90d' || period === '1y') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      dateLabel = months[date.getMonth()];
    }

    trends.push({
      date: dateLabel,
      messages: Math.round(baseMessages),
      voiceCalls: Math.round(baseVoiceCalls),
      videoCalls: Math.round(baseVideoCalls),
      total: Math.round(baseMessages + baseVoiceCalls + baseVideoCalls),
    });
  }

  return trends;
};

const generateDummyAstrologerStats = (): AstrologerCommunicationStats[] => {
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

  return names.map((name, index) => {
    const messages = Math.round(200 - index * 15);
    const voiceCalls = Math.round(60 - index * 4);
    const videoCalls = Math.round(40 - index * 3);
    return {
      astrologerId: `astro_${index + 1}`,
      astrologerName: name,
      messages,
      voiceCalls,
      videoCalls,
      total: messages + voiceCalls + videoCalls,
    };
  });
};

const generateDummyCallDurationStats = (): CallDurationStats[] => {
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
    astrologerId: `astro_${index + 1}`,
    astrologerName: name,
    avgVoiceCallDuration: 10 + Math.random() * 8,
    avgVideoCallDuration: 15 + Math.random() * 10,
    totalVoiceCalls: Math.round(60 - index * 4),
    totalVideoCalls: Math.round(40 - index * 3),
  }));
};

const generateDummyPeakHours = (): PeakHoursData[] => {
  const peakHours: PeakHoursData[] = [];
  for (let hour = 0; hour < 24; hour++) {
    // Peak hours: 9 AM - 11 PM (higher activity)
    const isPeak = hour >= 9 && hour <= 23;
    const baseMultiplier = isPeak ? 1.5 : 0.3;
    
    peakHours.push({
      hour,
      messages: Math.round((50 + Math.random() * 30) * baseMultiplier),
      voiceCalls: Math.round((15 + Math.random() * 10) * baseMultiplier),
      videoCalls: Math.round((10 + Math.random() * 8) * baseMultiplier),
      total: 0, // Will be calculated
    });
    
    // Calculate total
    const last = peakHours[peakHours.length - 1];
    last.total = last.messages + last.voiceCalls + last.videoCalls;
  }
  return peakHours;
};

const generateDummySuccessRateTrends = (period: CommunicationPeriod): CallSuccessRateTrend[] => {
  const dataPoints: { [key: string]: number } = {
    '1d': 24,
    '7d': 7,
    '30d': 30,
    '90d': 12,
    '1y': 12,
  };

  const count = dataPoints[period] || 7;
  const trends: CallSuccessRateTrend[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const completedRate = 80 + Math.random() * 10; // 80-90%
    const missedRate = 5 + Math.random() * 5; // 5-10%
    const rejectedRate = 5 + Math.random() * 5; // 5-10%
    
    // Normalize to ensure they sum to 100
    const total = completedRate + missedRate + rejectedRate;
    
    trends.push({
      date: period === '1d' ? `${23 - i}:00` : period === '7d' ? `Day ${count - i}` : `Period ${count - i}`,
      completedRate: Math.round((completedRate / total) * 100),
      missedRate: Math.round((missedRate / total) * 100),
      rejectedRate: Math.round((rejectedRate / total) * 100),
    });
  }

  return trends;
};

export const communicationApi = {
  // Get overview statistics
  getCommunicationStats: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'customer-astrologer'
  ): Promise<ApiResponse<CommunicationStats>> => {
    // Use dummy data for customer-astrologer, backend for admin-astrologer
    if (type === 'customer-astrologer') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        data: generateDummyStats(period),
      };
    }
    
    const response = await apiClient.get<ApiResponse<CommunicationStats>>('/admin/communications/stats', {
      params: { period, type },
    });
    return response.data;
  },

  // Get communication trends over time
  getCommunicationTrends: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'customer-astrologer'
  ): Promise<ApiResponse<CommunicationTrend[]>> => {
    // Use dummy data for customer-astrologer, backend for admin-astrologer
    if (type === 'customer-astrologer') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        data: generateDummyTrends(period),
      };
    }
    
    const response = await apiClient.get<ApiResponse<CommunicationTrend[]>>('/admin/communications/trends', {
      params: { period, type },
    });
    return response.data;
  },

  // Get communication stats by astrologer
  getAstrologerCommunicationStats: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'customer-astrologer'
  ): Promise<ApiResponse<AstrologerCommunicationStats[]>> => {
    // Use dummy data for customer-astrologer, backend for admin-astrologer
    if (type === 'customer-astrologer') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        data: generateDummyAstrologerStats(),
      };
    }
    
    const response = await apiClient.get<ApiResponse<AstrologerCommunicationStats[]>>('/admin/communications/astrologers', {
      params: { period, type },
    });
    return response.data;
  },

  // Get call duration statistics
  getCallDurationStats: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'customer-astrologer'
  ): Promise<ApiResponse<CallDurationStats[]>> => {
    // Use dummy data for customer-astrologer, backend for admin-astrologer
    if (type === 'customer-astrologer') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        data: generateDummyCallDurationStats(),
      };
    }
    
    const response = await apiClient.get<ApiResponse<CallDurationStats[]>>('/admin/communications/call-duration', {
      params: { period, type },
    });
    return response.data;
  },

  // Get peak hours data
  getPeakHours: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'customer-astrologer'
  ): Promise<ApiResponse<PeakHoursData[]>> => {
    // Use dummy data for customer-astrologer, backend for admin-astrologer
    if (type === 'customer-astrologer') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        data: generateDummyPeakHours(),
      };
    }
    
    const response = await apiClient.get<ApiResponse<PeakHoursData[]>>('/admin/communications/peak-hours', {
      params: { period, type },
    });
    return response.data;
  },

  // Get call success rate trends
  getCallSuccessRateTrends: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'customer-astrologer'
  ): Promise<ApiResponse<CallSuccessRateTrend[]>> => {
    // Use dummy data for customer-astrologer, backend for admin-astrologer
    if (type === 'customer-astrologer') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        data: generateDummySuccessRateTrends(period),
      };
    }
    
    const response = await apiClient.get<ApiResponse<CallSuccessRateTrend[]>>('/admin/communications/success-rates', {
      params: { period, type },
    });
    return response.data;
  },
};

