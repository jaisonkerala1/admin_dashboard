export interface Review {
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
  consultationId?: {
    _id: string;
    type: string;
  };
  rating: number;
  comment: string;
  isHidden: boolean;
  hiddenReason?: string;
  replies?: ReviewReply[];
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReply {
  _id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface ModerateReviewRequest {
  isHidden: boolean;
  hiddenReason?: string;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  hidden: number;
  byRating: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

