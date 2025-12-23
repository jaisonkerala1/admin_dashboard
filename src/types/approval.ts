export type ApprovalRequestType = 'onboarding' | 'verification_badge' | 'service_approval' | 'profile_update';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalDocument {
  type: 'id_proof' | 'certificate' | 'storefront';
  url: string;
  uploadedAt: Date | string;
}

export interface ApprovalRequest {
  _id: string;
  astrologerId: string;
  astrologerName: string;
  astrologerEmail: string;
  astrologerPhone: string;
  astrologerAvatar?: string;
  requestType: ApprovalRequestType;
  status: ApprovalStatus;
  submittedAt: Date | string;
  reviewedAt?: Date | string;
  reviewedBy?: string;
  rejectionReason?: string;
  documents?: ApprovalDocument[];
  notes?: string;
  astrologerData: {
    experience: number;
    specializations: string[];
    consultationsCount: number;
    rating: number;
  };
}

export interface ApprovalStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  pendingOnboarding: number;
  pendingVerification: number;
  pendingServices: number;
  avgReviewTime: number; // in hours
  todayReviewed: number;
}

export interface ApprovalFilters {
  type: ApprovalRequestType | 'all';
  status: ApprovalStatus | 'all';
  search: string;
}

export interface ApprovalPagination {
  page: number;
  limit: number;
  total: number;
}

export interface ApproveRequestInput {
  requestId: string;
  notes?: string;
}

export interface RejectRequestInput {
  requestId: string;
  rejectionReason: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

