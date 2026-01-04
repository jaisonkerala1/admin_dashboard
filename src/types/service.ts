export interface Service {
  _id: string;
  // Astrologer reference
  astrologerId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  
  // Basic info
  name: string;
  description: string;
  category: string;
  
  // Pricing & Duration
  price: number;
  currency: 'INR' | 'USD' | 'EUR';
  duration: string; // e.g., "1 hr", "30 mins"
  
  // Details
  requirements?: string;
  benefits?: string[];
  tags?: string[];
  
  // Media
  imageUrl?: string;
  images?: string[];
  
  // Status
  isActive: boolean;
  isDeleted: boolean;
  
  // Stats
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalRatings: number;
  
  // Availability
  availability?: {
    availableDays: number[]; // 0-6 for Sunday-Saturday
    startTime: string; // "09:00"
    endTime: string; // "18:00"
    maxBookingsPerDay: number;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  pending?: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  price?: number;
  duration?: string;
  isActive?: boolean;
  requirements?: string;
  benefits?: string[];
}
