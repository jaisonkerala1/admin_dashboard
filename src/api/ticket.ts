import apiClient from './client';
import type {
  ApiResponse,
  AssignTicketInput,
  BulkActionInput,
  CreateTicketMessageInput,
  SupportTicket,
  TicketDetail,
  TicketFilters,
  TicketListResponse,
  TicketStatistics,
  UpdateTicketPriorityInput,
  UpdateTicketStatusInput,
} from '@/types/ticket';

export const ticketApi = {
  // Get all tickets with filters
  getTickets: async (
    filters: TicketFilters = {},
    page = 1,
    limit = 20
  ): Promise<ApiResponse<TicketListResponse>> => {
    const params: any = {
      page,
      limit,
      ...filters,
    };

    const response = await apiClient.get('/admin/support/tickets', { params });
    return response.data;
  },

  // Get ticket details
  getTicketById: async (ticketId: string): Promise<ApiResponse<TicketDetail>> => {
    const response = await apiClient.get(`/admin/support/tickets/${ticketId}`);
    return response.data;
  },

  // Assign ticket to admin
  assignTicket: async (
    ticketId: string,
    data: AssignTicketInput
  ): Promise<ApiResponse<SupportTicket>> => {
    const response = await apiClient.patch(
      `/admin/support/tickets/${ticketId}/assign`,
      data
    );
    return response.data;
  },

  // Update ticket status
  updateTicketStatus: async (
    ticketId: string,
    data: UpdateTicketStatusInput
  ): Promise<ApiResponse<SupportTicket>> => {
    const response = await apiClient.patch(
      `/admin/support/tickets/${ticketId}/status`,
      data
    );
    return response.data;
  },

  // Update ticket priority
  updateTicketPriority: async (
    ticketId: string,
    data: UpdateTicketPriorityInput
  ): Promise<ApiResponse<SupportTicket>> => {
    const response = await apiClient.patch(
      `/admin/support/tickets/${ticketId}/priority`,
      data
    );
    return response.data;
  },

  // Add admin reply or internal note
  addMessage: async (
    ticketId: string,
    data: CreateTicketMessageInput
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(
      `/admin/support/tickets/${ticketId}/messages`,
      data
    );
    return response.data;
  },

  // Add internal note
  addInternalNote: async (
    ticketId: string,
    note: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(
      `/admin/support/tickets/${ticketId}/internal-notes`,
      { note }
    );
    return response.data;
  },

  // Bulk actions
  bulkAction: async (data: BulkActionInput): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/admin/support/tickets/bulk-action', data);
    return response.data;
  },

  // Get ticket statistics
  getStatistics: async (period = '7d'): Promise<ApiResponse<TicketStatistics>> => {
    const response = await apiClient.get('/admin/support/stats', {
      params: { period },
    });
    return response.data;
  },
};

