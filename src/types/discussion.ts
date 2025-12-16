export interface Discussion {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  title: string;
  content: string;
  category: string;
  tags?: string[];
  images?: string[];
  likes: number;
  comments: DiscussionComment[];
  views: number;
  isHidden: boolean;
  hiddenReason?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionComment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  likes: number;
  isHidden: boolean;
  hiddenReason?: string;
  createdAt: string;
}

export interface DiscussionStats {
  total: number;
  hidden: number;
  totalComments: number;
  hiddenComments: number;
  totalViews: number;
}

export interface ModerateDiscussionRequest {
  isHidden: boolean;
  hiddenReason?: string;
}

