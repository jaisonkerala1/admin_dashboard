import type {
  ApprovalRequest,
  ApprovalStats,
  ApprovalFilters,
  ApprovalPagination,
  ApiResponse,
} from '@/types/approval';

// Mock astrologer names for generating requests
const astrologerNames = [
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
  'Pandit Agarwal',
  'Acharya Kapoor',
  'Guru Malhotra',
  'Swami Chaturvedi',
  'Rishi Gupta',
  'Jyotish Saxena',
  'Vedic Mishra',
  'Astro Tiwari',
];

const specializations = [
  'Vedic Astrology',
  'Numerology',
  'Palmistry',
  'Tarot Reading',
  'Vastu Shastra',
  'Gemstone Consultation',
  'Horoscope Matching',
  'Remedial Solutions',
];

// Generate mock approval requests
function generateMockApprovalRequests(): ApprovalRequest[] {
  const requests: ApprovalRequest[] = [];
  const now = new Date();

  // 60% Verification Badge requests
  for (let i = 0; i < 18; i++) {
    const submittedDaysAgo = Math.floor(Math.random() * 30);
    const submittedAt = new Date(now);
    submittedAt.setDate(submittedAt.getDate() - submittedDaysAgo);

    const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];
    const status = statuses[Math.floor(Math.random() * 3)];

    const reviewedAt = status !== 'pending' ? new Date(submittedAt.getTime() + Math.random() * 48 * 60 * 60 * 1000) : undefined;

    requests.push({
      _id: `verification_${i + 1}`,
      astrologerId: `astrologer_${i + 1}`,
      astrologerName: astrologerNames[i % astrologerNames.length],
      astrologerEmail: `astrologer${i + 1}@example.com`,
      astrologerPhone: `+91${Math.floor(9000000000 + Math.random() * 999999999)}`,
      astrologerAvatar: `https://i.pravatar.cc/150?img=${i + 1}`,
      requestType: 'verification_badge',
      status,
      submittedAt: submittedAt.toISOString(),
      reviewedAt: reviewedAt?.toISOString(),
      reviewedBy: status !== 'pending' ? 'admin' : undefined,
      rejectionReason: status === 'rejected' ? 'ID proof image quality is low. Please resubmit with clearer image.' : undefined,
      documents: [
        {
          type: 'id_proof',
          url: `https://picsum.photos/800/600?random=${i + 1}`,
          uploadedAt: submittedAt.toISOString(),
        },
        {
          type: 'certificate',
          url: `https://picsum.photos/800/600?random=${i + 100}`,
          uploadedAt: submittedAt.toISOString(),
        },
      ],
      astrologerData: {
        experience: Math.floor(Math.random() * 20) + 1,
        specializations: specializations.slice(0, Math.floor(Math.random() * 3) + 1),
        consultationsCount: Math.floor(Math.random() * 100) + 10,
        rating: Math.round((4 + Math.random() * 1) * 10) / 10,
      },
    });
  }

  // 25% Onboarding requests
  for (let i = 0; i < 7; i++) {
    const submittedDaysAgo = Math.floor(Math.random() * 14);
    const submittedAt = new Date(now);
    submittedAt.setDate(submittedAt.getDate() - submittedDaysAgo);

    const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];
    const status = statuses[Math.floor(Math.random() * 3)];

    const reviewedAt = status !== 'pending' ? new Date(submittedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined;

    requests.push({
      _id: `onboarding_${i + 1}`,
      astrologerId: `astrologer_${18 + i + 1}`,
      astrologerName: astrologerNames[(18 + i) % astrologerNames.length],
      astrologerEmail: `astrologer${18 + i + 1}@example.com`,
      astrologerPhone: `+91${Math.floor(9000000000 + Math.random() * 999999999)}`,
      astrologerAvatar: `https://i.pravatar.cc/150?img=${18 + i + 1}`,
      requestType: 'onboarding',
      status,
      submittedAt: submittedAt.toISOString(),
      reviewedAt: reviewedAt?.toISOString(),
      reviewedBy: status !== 'pending' ? 'admin' : undefined,
      rejectionReason: status === 'rejected' ? 'Incomplete profile information. Please complete all required fields.' : undefined,
      astrologerData: {
        experience: Math.floor(Math.random() * 10) + 1,
        specializations: specializations.slice(0, Math.floor(Math.random() * 2) + 1),
        consultationsCount: 0,
        rating: 0,
      },
    });
  }

  // 10% Service approvals
  for (let i = 0; i < 3; i++) {
    const submittedDaysAgo = Math.floor(Math.random() * 7);
    const submittedAt = new Date(now);
    submittedAt.setDate(submittedAt.getDate() - submittedDaysAgo);

    const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];
    const status = statuses[Math.floor(Math.random() * 3)];

    const reviewedAt = status !== 'pending' ? new Date(submittedAt.getTime() + Math.random() * 12 * 60 * 60 * 1000) : undefined;

    requests.push({
      _id: `service_${i + 1}`,
      astrologerId: `astrologer_${25 + i + 1}`,
      astrologerName: astrologerNames[(25 + i) % astrologerNames.length],
      astrologerEmail: `astrologer${25 + i + 1}@example.com`,
      astrologerPhone: `+91${Math.floor(9000000000 + Math.random() * 999999999)}`,
      astrologerAvatar: `https://i.pravatar.cc/150?img=${25 + i + 1}`,
      requestType: 'service_approval',
      status,
      submittedAt: submittedAt.toISOString(),
      reviewedAt: reviewedAt?.toISOString(),
      reviewedBy: status !== 'pending' ? 'admin' : undefined,
      rejectionReason: status === 'rejected' ? 'Service description does not meet platform guidelines.' : undefined,
      astrologerData: {
        experience: Math.floor(Math.random() * 15) + 5,
        specializations: specializations.slice(0, Math.floor(Math.random() * 3) + 1),
        consultationsCount: Math.floor(Math.random() * 200) + 50,
        rating: Math.round((4.2 + Math.random() * 0.8) * 10) / 10,
      },
    });
  }

  // 5% Profile updates
  for (let i = 0; i < 2; i++) {
    const submittedDaysAgo = Math.floor(Math.random() * 3);
    const submittedAt = new Date(now);
    submittedAt.setDate(submittedAt.getDate() - submittedDaysAgo);

    const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved'];
    const status = statuses[Math.floor(Math.random() * 2)];

    const reviewedAt = status !== 'pending' ? new Date(submittedAt.getTime() + Math.random() * 6 * 60 * 60 * 1000) : undefined;

    requests.push({
      _id: `profile_${i + 1}`,
      astrologerId: `astrologer_${28 + i + 1}`,
      astrologerName: astrologerNames[(28 + i) % astrologerNames.length],
      astrologerEmail: `astrologer${28 + i + 1}@example.com`,
      astrologerPhone: `+91${Math.floor(9000000000 + Math.random() * 999999999)}`,
      astrologerAvatar: `https://i.pravatar.cc/150?img=${28 + i + 1}`,
      requestType: 'profile_update',
      status,
      submittedAt: submittedAt.toISOString(),
      reviewedAt: reviewedAt?.toISOString(),
      reviewedBy: status !== 'pending' ? 'admin' : undefined,
      astrologerData: {
        experience: Math.floor(Math.random() * 20) + 5,
        specializations: specializations.slice(0, Math.floor(Math.random() * 4) + 1),
        consultationsCount: Math.floor(Math.random() * 300) + 100,
        rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
      },
    });
  }

  // Sort by submitted date (newest first)
  return requests.sort((a, b) => {
    const dateA = new Date(a.submittedAt).getTime();
    const dateB = new Date(b.submittedAt).getTime();
    return dateB - dateA;
  });
}

// Generate mock stats
function generateMockStats(): ApprovalStats {
  const requests = generateMockApprovalRequests();
  const pending = requests.filter((r) => r.status === 'pending');
  const approved = requests.filter((r) => r.status === 'approved');
  const rejected = requests.filter((r) => r.status === 'rejected');

  return {
    totalPending: pending.length,
    totalApproved: approved.length,
    totalRejected: rejected.length,
    pendingOnboarding: pending.filter((r) => r.requestType === 'onboarding').length,
    pendingVerification: pending.filter((r) => r.requestType === 'verification_badge').length,
    pendingServices: pending.filter((r) => r.requestType === 'service_approval').length,
    avgReviewTime: 18.5, // hours
    todayReviewed: Math.floor(Math.random() * 5) + 2,
  };
}

// Filter requests based on filters
function filterRequests(
  requests: ApprovalRequest[],
  filters: Partial<ApprovalFilters>
): ApprovalRequest[] {
  let filtered = [...requests];

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter((r) => r.requestType === filters.type);
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((r) => r.status === filters.status);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.astrologerName.toLowerCase().includes(searchLower) ||
        r.astrologerEmail.toLowerCase().includes(searchLower) ||
        r.astrologerPhone.includes(searchLower)
    );
  }

  return filtered;
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const approvalApi = {
  // Get approval requests with filters and pagination
  getApprovalRequests: async (params: {
    filters?: Partial<ApprovalFilters>;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ requests: ApprovalRequest[]; pagination: ApprovalPagination }>> => {
    await delay(300);

    const allRequests = generateMockApprovalRequests();
    const filtered = filterRequests(allRequests, params.filters || {});
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      success: true,
      data: {
        requests: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
        },
      },
    };
  },

  // Get approval statistics
  getApprovalStats: async (): Promise<ApiResponse<ApprovalStats>> => {
    await delay(200);

    return {
      success: true,
      data: generateMockStats(),
    };
  },

  // Get single request by ID
  getApprovalRequestById: async (requestId: string): Promise<ApiResponse<ApprovalRequest>> => {
    await delay(200);

    const allRequests = generateMockApprovalRequests();
    const request = allRequests.find((r) => r._id === requestId);

    if (!request) {
      return {
        success: false,
        message: 'Request not found',
      };
    }

    return {
      success: true,
      data: request,
    };
  },

  // Approve request
  approveRequest: async (
    requestId: string,
    data: { notes?: string }
  ): Promise<ApiResponse<ApprovalRequest>> => {
    await delay(500);

    const allRequests = generateMockApprovalRequests();
    const request = allRequests.find((r) => r._id === requestId);

    if (!request) {
      return {
        success: false,
        message: 'Request not found',
      };
    }

    const approved: ApprovalRequest = {
      ...request,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
      notes: data.notes,
    };

    return {
      success: true,
      data: approved,
    };
  },

  // Reject request
  rejectRequest: async (
    requestId: string,
    data: { rejectionReason: string }
  ): Promise<ApiResponse<ApprovalRequest>> => {
    await delay(500);

    const allRequests = generateMockApprovalRequests();
    const request = allRequests.find((r) => r._id === requestId);

    if (!request) {
      return {
        success: false,
        message: 'Request not found',
      };
    }

    const rejected: ApprovalRequest = {
      ...request,
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
      rejectionReason: data.rejectionReason,
    };

    return {
      success: true,
      data: rejected,
    };
  },
};

