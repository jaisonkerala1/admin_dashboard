export interface Consultation {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  astrologerId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  serviceId?: {
    _id: string;
    title: string;
  };
  type: 'chat' | 'call' | 'video';
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled' | 'rejected';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  notes?: string;
  rating?: number;
  review?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationStats {
  total: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averageDuration: number;
  averageRating: number;
}

export interface UpdateConsultationRequest {
  status?: string;
  notes?: string;
}

