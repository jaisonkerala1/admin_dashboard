export interface Astrologer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  bio?: string;
  specialization: string[];
  languages: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  consultationCharge: number;
  callCharge: number;
  chatCharge: number;
  isActive: boolean;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  isSuspended: boolean;
  suspendedAt?: string;
  suspensionReason?: string;
  totalConsultations: number;
  totalEarnings: number;
  totalCallDuration: number;
  availabilityStatus: 'online' | 'offline' | 'busy';
  activeSession?: {
    type: string;
    startedAt: string;
    userId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AstrologerStats {
  totalConsultations: number;
  completedConsultations: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number;
  activeServices: number;
}

export interface ApproveAstrologerRequest {
  approvedBy: string;
}

export interface SuspendAstrologerRequest {
  reason: string;
}

export interface UpdateAstrologerRequest {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  specialization?: string[];
  languages?: string[];
  experience?: number;
  consultationCharge?: number;
  callCharge?: number;
  chatCharge?: number;
  isActive?: boolean;
}

