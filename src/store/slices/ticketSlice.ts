import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  SupportTicket,
  TicketDetail,
  TicketFilters,
  TicketListResponse,
  TicketStatistics,
  AssignTicketInput,
  UpdateTicketStatusInput,
  UpdateTicketPriorityInput,
  CreateTicketMessageInput,
  BulkActionInput,
} from '@/types/ticket';

interface TicketState {
  // Ticket List
  tickets: SupportTicket[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  stats: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    closedToday: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    satisfactionRate?: number;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  } | null;
  filters: TicketFilters;
  selectedTicketIds: string[];
  
  // Ticket Detail
  currentTicket: TicketDetail | null;
  
  // Statistics
  statistics: TicketStatistics | null;
  statisticsPeriod: string;
  
  // Loading States
  isLoadingTickets: boolean;
  isLoadingTicketDetail: boolean;
  isLoadingStatistics: boolean;
  isSendingMessage: boolean;
  isUpdatingTicket: boolean;
  
  // Error States
  error: string | null;
  ticketDetailError: string | null;
  statisticsError: string | null;
}

const initialState: TicketState = {
  tickets: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  stats: null,
  filters: {
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  selectedTicketIds: [],
  currentTicket: null,
  statistics: null,
  statisticsPeriod: '7d',
  isLoadingTickets: false,
  isLoadingTicketDetail: false,
  isLoadingStatistics: false,
  isSendingMessage: false,
  isUpdatingTicket: false,
  error: null,
  ticketDetailError: null,
  statisticsError: null,
};

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    // Fetch Tickets
    fetchTicketsRequest: (
      state,
      _action: PayloadAction<{ filters?: TicketFilters; page?: number; limit?: number }>
    ) => {
      state.isLoadingTickets = true;
      state.error = null;
    },
    fetchTicketsSuccess: (state, action: PayloadAction<TicketListResponse>) => {
      state.isLoadingTickets = false;
      state.tickets = action.payload.tickets;
      state.pagination = action.payload.pagination;
      state.stats = action.payload.stats;
      state.error = null;
    },
    fetchTicketsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingTickets = false;
      state.error = action.payload;
    },

    // Fetch Ticket Detail
    fetchTicketDetailRequest: (state, _action: PayloadAction<{ ticketId: string }>) => {
      state.isLoadingTicketDetail = true;
      state.ticketDetailError = null;
    },
    fetchTicketDetailSuccess: (state, action: PayloadAction<TicketDetail>) => {
      state.isLoadingTicketDetail = false;
      state.currentTicket = action.payload;
      state.ticketDetailError = null;
    },
    fetchTicketDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingTicketDetail = false;
      state.ticketDetailError = action.payload;
    },

    // Assign Ticket
    assignTicketRequest: (
      state,
      _action: PayloadAction<{ ticketId: string; data: AssignTicketInput }>
    ) => {
      state.isUpdatingTicket = true;
    },
    assignTicketSuccess: (state, action: PayloadAction<SupportTicket>) => {
      state.isUpdatingTicket = false;
      // Update in list
      const index = state.tickets.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = { ...state.tickets[index], ...action.payload };
      }
      // Update current ticket if it's the same
      if (state.currentTicket && state.currentTicket.id === action.payload.id) {
        state.currentTicket = { ...state.currentTicket, ...action.payload };
      }
    },
    assignTicketFailure: (state, action: PayloadAction<string>) => {
      state.isUpdatingTicket = false;
      state.error = action.payload;
    },

    // Update Status
    updateTicketStatusRequest: (
      state,
      _action: PayloadAction<{ ticketId: string; data: UpdateTicketStatusInput }>
    ) => {
      state.isUpdatingTicket = true;
    },
    updateTicketStatusSuccess: (state, action: PayloadAction<SupportTicket>) => {
      state.isUpdatingTicket = false;
      const index = state.tickets.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = { ...state.tickets[index], ...action.payload };
      }
      if (state.currentTicket && state.currentTicket.id === action.payload.id) {
        state.currentTicket = { ...state.currentTicket, ...action.payload };
      }
    },
    updateTicketStatusFailure: (state, action: PayloadAction<string>) => {
      state.isUpdatingTicket = false;
      state.error = action.payload;
    },

    // Update Priority
    updateTicketPriorityRequest: (
      state,
      _action: PayloadAction<{ ticketId: string; data: UpdateTicketPriorityInput }>
    ) => {
      state.isUpdatingTicket = true;
    },
    updateTicketPrioritySuccess: (state, action: PayloadAction<SupportTicket>) => {
      state.isUpdatingTicket = false;
      const index = state.tickets.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = { ...state.tickets[index], ...action.payload };
      }
      if (state.currentTicket && state.currentTicket.id === action.payload.id) {
        state.currentTicket = { ...state.currentTicket, ...action.payload };
      }
    },
    updateTicketPriorityFailure: (state, action: PayloadAction<string>) => {
      state.isUpdatingTicket = false;
      state.error = action.payload;
    },

    // Add Message
    addMessageRequest: (
      state,
      _action: PayloadAction<{ ticketId: string; data: CreateTicketMessageInput }>
    ) => {
      state.isSendingMessage = true;
    },
    addMessageSuccess: (state, _action: PayloadAction<any>) => {
      state.isSendingMessage = false;
    },
    addMessageFailure: (state, action: PayloadAction<string>) => {
      state.isSendingMessage = false;
      state.error = action.payload;
    },

    // Add Internal Note
    addInternalNoteRequest: (
      state,
      _action: PayloadAction<{ ticketId: string; note: string }>
    ) => {
      state.isUpdatingTicket = true;
    },
    addInternalNoteSuccess: (state) => {
      state.isUpdatingTicket = false;
    },
    addInternalNoteFailure: (state, action: PayloadAction<string>) => {
      state.isUpdatingTicket = false;
      state.error = action.payload;
    },

    // Bulk Action
    bulkActionRequest: (state, _action: PayloadAction<BulkActionInput>) => {
      state.isUpdatingTicket = true;
    },
    bulkActionSuccess: (state) => {
      state.isUpdatingTicket = false;
      state.selectedTicketIds = [];
    },
    bulkActionFailure: (state, action: PayloadAction<string>) => {
      state.isUpdatingTicket = false;
      state.error = action.payload;
    },

    // Fetch Statistics
    fetchStatisticsRequest: (state, _action: PayloadAction<{ period?: string }>) => {
      state.isLoadingStatistics = true;
      state.statisticsError = null;
    },
    fetchStatisticsSuccess: (state, action: PayloadAction<TicketStatistics>) => {
      state.isLoadingStatistics = false;
      state.statistics = action.payload;
      state.statisticsError = null;
    },
    fetchStatisticsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingStatistics = false;
      state.statisticsError = action.payload;
    },

    // Set Filters
    setFilters: (state, action: PayloadAction<Partial<TicketFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },

    // Set Page
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },

    // Set Statistics Period
    setStatisticsPeriod: (state, action: PayloadAction<string>) => {
      state.statisticsPeriod = action.payload;
    },

    // Toggle Ticket Selection
    toggleTicketSelection: (state, action: PayloadAction<string>) => {
      const ticketId = action.payload;
      const index = state.selectedTicketIds.indexOf(ticketId);
      if (index === -1) {
        state.selectedTicketIds.push(ticketId);
      } else {
        state.selectedTicketIds.splice(index, 1);
      }
    },

    // Select All Tickets
    selectAllTickets: (state) => {
      state.selectedTicketIds = state.tickets.map((t) => t.id);
    },

    // Clear Selection
    clearSelection: (state) => {
      state.selectedTicketIds = [];
    },

    // Clear Current Ticket
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
      state.ticketDetailError = null;
    },

    // Clear Errors
    clearError: (state) => {
      state.error = null;
      state.ticketDetailError = null;
      state.statisticsError = null;
    },
  },
});

export const {
  fetchTicketsRequest,
  fetchTicketsSuccess,
  fetchTicketsFailure,
  fetchTicketDetailRequest,
  fetchTicketDetailSuccess,
  fetchTicketDetailFailure,
  assignTicketRequest,
  assignTicketSuccess,
  assignTicketFailure,
  updateTicketStatusRequest,
  updateTicketStatusSuccess,
  updateTicketStatusFailure,
  updateTicketPriorityRequest,
  updateTicketPrioritySuccess,
  updateTicketPriorityFailure,
  addMessageRequest,
  addMessageSuccess,
  addMessageFailure,
  addInternalNoteRequest,
  addInternalNoteSuccess,
  addInternalNoteFailure,
  bulkActionRequest,
  bulkActionSuccess,
  bulkActionFailure,
  fetchStatisticsRequest,
  fetchStatisticsSuccess,
  fetchStatisticsFailure,
  setFilters,
  setPage,
  setStatisticsPeriod,
  toggleTicketSelection,
  selectAllTickets,
  clearSelection,
  clearCurrentTicket,
  clearError,
} = ticketSlice.actions;

export default ticketSlice.reducer;

