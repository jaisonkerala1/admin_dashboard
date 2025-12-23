// Support Ticket System Types

export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_user' | 'closed';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketCategory =
  | 'Account Issues'
  | 'Calendar Problems'
  | 'Consultation Issues'
  | 'Payment Problems'
  | 'Technical Support'
  | 'Feature Request'
  | 'Bug Report'
  | 'Other';

export type MessageSenderType = 'user' | 'admin' | 'system';

export interface TicketAttachment {
  url: string;
  filename: string;
  size: number;
  mimetype?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: MessageSenderType;
  message: string;
  isInternal: boolean;
  isSystemMessage: boolean;
  attachments?: TicketAttachment[];
  readBy?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  assignedTo: string | null;
  assignedToName: string | null;
  assignedAt?: string;
  messagesCount: number;
  attachments?: TicketAttachment[];
  internalNotes?: string;
  tags?: string[];
  responseTime?: number; // in minutes
  resolutionTime?: number; // in minutes
  userRating?: number; // 1-5
  userFeedback?: string;
  createdAt: string;
  updatedAt: string;
  firstResponseAt?: string;
  resolvedAt?: string;
}

export interface TicketDetail extends SupportTicket {
  messages: TicketMessage[];
  userHistory?: {
    totalTickets: number;
    closedTickets: number;
    avgRating: number;
  };
}

export interface TicketFilters {
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
  category?: TicketCategory | 'all';
  assignedTo?: string | 'me' | 'unassigned' | 'all';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  closedToday: number;
  avgResponseTime: number; // in minutes
  avgResolutionTime: number; // in minutes
  satisfactionRate?: number;
  byPriority: Record<TicketPriority, number>;
  byCategory: Partial<Record<TicketCategory, number>>;
}

export interface TicketListResponse {
  tickets: SupportTicket[];
  pagination: TicketPagination;
  stats: TicketStats;
}

export interface TicketTrend {
  date: string;
  opened: number;
  closed: number;
  avgResponseTime: number;
}

export interface TopCategory {
  category: TicketCategory;
  count: number;
}

export interface TopAdmin {
  adminId: string;
  name: string;
  ticketsResolved: number;
  avgResolutionTime: number;
}

export interface TicketStatistics {
  overview: {
    totalTickets: number;
    openTickets: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    satisfactionRate: number;
  };
  trends: TicketTrend[];
  topCategories: TopCategory[];
  topAdmins: TopAdmin[];
}

export interface CreateTicketMessageInput {
  message: string;
  isInternal?: boolean;
  attachments?: TicketAttachment[];
}

export interface UpdateTicketStatusInput {
  status: TicketStatus;
  internalNote?: string;
}

export interface AssignTicketInput {
  assignedTo: string | null;
  assignedToName: string | null;
}

export interface UpdateTicketPriorityInput {
  priority: TicketPriority;
}

export interface BulkActionInput {
  action: 'assign' | 'update_status' | 'update_priority' | 'close';
  ticketIds: string[];
  actionData?: {
    assignedTo?: string;
    assignedToName?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

