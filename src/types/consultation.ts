export interface Consultation {
  _id: string;
  // Client information (stored as strings, not user reference)
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAge?: number;
  clientGender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferredLanguage?: string;
  
  // Astrologer reference (populated)
  astrologerId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  } | null;
  
  // Scheduling
  scheduledTime: string;
  duration: number; // in minutes
  originalScheduledTime?: string;
  
  // Financial
  amount: number;
  currency: 'INR' | 'USD' | 'EUR';
  
  // Consultation details
  type: 'phone' | 'video' | 'inPerson' | 'chat';
  status: 'scheduled' | 'inProgress' | 'completed' | 'cancelled' | 'noShow';
  consultationTopics?: string[];
  notes?: string;
  source: 'app' | 'website' | 'admin';
  isManual: boolean;
  
  // Timestamps
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'astrologer' | 'client' | 'system';
  cancellationReason?: string;
  
  // Ratings & Feedback
  rating?: number;
  feedback?: string;
  astrologerRating?: number;
  astrologerFeedback?: string;
  astrologerRatedAt?: string;
  
  // Rescheduling
  rescheduleCount: number;
  lastRescheduledAt?: string;
  
  // Sharing
  shareCount: number;
  lastSharedAt?: string;
  
  // Reminder
  reminderSent: boolean;
  reminderSentAt?: string;
  
  // Status history
  statusHistory?: {
    status: string;
    timestamp: string;
    notes?: string;
    scheduledTime?: string;
    _id: string;
  }[];
  
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

