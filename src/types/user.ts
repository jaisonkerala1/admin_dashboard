export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  isActive: boolean;
  isBanned: boolean;
  bannedAt?: string;
  banReason?: string;
  totalConsultations: number;
  totalSpent: number;
  lastActiveAt: string;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalConsultations: number;
  totalSpent: number;
  favoriteAstrologers: number;
  totalReviews: number;
  joinedDate: string;
  lastActive: string;
}

export interface BanUserRequest {
  reason: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserActivity {
  _id: string;
  userId: string;
  type: 'consultation' | 'call' | 'chat' | 'review' | 'discussion';
  description: string;
  createdAt: string;
}

