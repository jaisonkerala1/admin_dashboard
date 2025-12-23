import apiClient from './client';
import type {
  ApprovalRequest,
  ApprovalStats,
  ApprovalFilters,
  ApprovalPagination,
  ApprovalRequestType,
  ApprovalStatus,
  ApiResponse,
} from '@/types/approval';

// Helper to transform backend response to frontend format
function transformApprovalRequest(backendRequest: any): ApprovalRequest {
  return {
    _id: backendRequest._id,
    astrologerId: backendRequest.astrologerId?._id || backendRequest.astrologerId,
    astrologerName: backendRequest.astrologerName,
    astrologerEmail: backendRequest.astrologerEmail,
    astrologerPhone: backendRequest.astrologerPhone,
    astrologerAvatar: backendRequest.astrologerAvatar || backendRequest.astrologerId?.profilePicture,
    requestType: backendRequest.requestType,
    status: backendRequest.status,
    submittedAt: backendRequest.submittedAt,
    reviewedAt: backendRequest.reviewedAt,
    reviewedBy: backendRequest.reviewedBy,
    rejectionReason: backendRequest.rejectionReason,
    notes: backendRequest.notes,
    documents: backendRequest.documents || [], // Backend doesn't return documents yet, but keep for compatibility
    astrologerData: backendRequest.astrologerData || {
      experience: backendRequest.astrologerId?.experience || 0,
      specializations: backendRequest.astrologerId?.specializations || [],
      consultationsCount: 0,
      rating: 0,
    },
  };
}

export const approvalApi = {
  // Get approval requests with filters and pagination
  getApprovalRequests: async (params: {
    type?: ApprovalRequestType | 'all';
    status?: ApprovalStatus | 'all';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ requests: ApprovalRequest[]; pagination: ApprovalPagination }>> => {
    try {
      const queryParams: any = {
        page: params.page || 1,
        limit: params.limit || 20,
      };

      if (params.type && params.type !== 'all') {
        queryParams.type = params.type;
      }

      if (params.status && params.status !== 'all') {
        queryParams.status = params.status;
      }

      if (params.search) {
        queryParams.search = params.search;
      }

      const response = await apiClient.get('/admin/approvals', { params: queryParams });

      if (response.data.success && response.data.data) {
        const requests = response.data.data.map(transformApprovalRequest);
        return {
          success: true,
          data: {
            requests: requests,
            pagination: {
              page: response.data.pagination.page,
              limit: response.data.pagination.limit,
              total: response.data.pagination.total,
            },
          },
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to fetch approval requests',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch approval requests',
      };
    }
  },

  // Get approval statistics
  getApprovalStats: async (): Promise<ApiResponse<ApprovalStats>> => {
    try {
      const response = await apiClient.get('/admin/approvals/stats');

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: {
            totalPending: response.data.data.totalPending || 0,
            totalApproved: response.data.data.totalApproved || 0,
            totalRejected: response.data.data.totalRejected || 0,
            pendingOnboarding: response.data.data.pendingOnboarding || 0,
            pendingVerification: response.data.data.pendingVerification || 0,
            pendingServices: response.data.data.pendingServices || 0,
            avgReviewTime: response.data.data.avgReviewTime || 0,
            todayReviewed: response.data.data.todayReviewed || 0,
          },
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to fetch approval statistics',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch approval statistics',
      };
    }
  },

  // Get single request by ID
  getApprovalRequestById: async (requestId: string): Promise<ApiResponse<ApprovalRequest>> => {
    try {
      const response = await apiClient.get(`/admin/approvals/${requestId}`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: transformApprovalRequest(response.data.data),
        };
      }

      return {
        success: false,
        message: response.data.message || 'Request not found',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch approval request',
      };
    }
  },

  // Approve request
  approveRequest: async (
    requestId: string,
    notes?: string
  ): Promise<ApiResponse<ApprovalRequest>> => {
    try {
      const response = await apiClient.post(`/admin/approvals/${requestId}/approve`, {
        notes,
      });

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: transformApprovalRequest(response.data.data),
          message: response.data.message || 'Request approved successfully',
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to approve request',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to approve request',
      };
    }
  },

  // Reject request
  rejectRequest: async (
    requestId: string,
    reason: string
  ): Promise<ApiResponse<ApprovalRequest>> => {
    try {
      const response = await apiClient.post(`/admin/approvals/${requestId}/reject`, {
        reason,
      });

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: transformApprovalRequest(response.data.data),
          message: response.data.message || 'Request rejected successfully',
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to reject request',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to reject request',
      };
    }
  },
};

