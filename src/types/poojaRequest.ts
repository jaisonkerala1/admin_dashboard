export interface PoojaRequest {
  _id: string;
  
  // Customer info
  customerName: string;
  customerPhone: string;
  
  // Service info
  serviceName: string;
  serviceCategory: string;
  serviceId: string | null;
  
  // Astrologer reference
  astrologerId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  
  // Scheduling
  requestedDate: string;
  requestedTime: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  
  // Financial
  price: number;
  currency: 'INR' | 'USD' | 'EUR';
  
  // Details
  specialInstructions?: string;
  notes?: string;
  
  // Meta
  isManual: boolean;
  source: 'astrologer_app' | 'user_app' | 'admin';
  isDeleted: boolean;
  
  // Status history
  statusHistory: {
    status: string;
    timestamp: string;
    notes?: string;
    _id: string;
  }[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface PoojaRequestStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface UpdatePoojaRequestRequest {
  status?: 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  notes?: string;
}






