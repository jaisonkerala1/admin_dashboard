export interface Service {
  _id: string;
  astrologerId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  deliveryTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  isActive: boolean;
  features: string[];
  images?: string[];
  totalOrders: number;
  rating: number;
  totalReviews: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceStats {
  total: number;
  active: number;
  pending: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
}

export interface UpdateServiceRequest {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  deliveryTime?: string;
  status?: string;
  isActive?: boolean;
  rejectionReason?: string;
}

