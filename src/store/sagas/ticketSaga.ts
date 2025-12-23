import { call, put, select, takeLatest, all } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { ticketApi } from '@/api';
import type { RootState } from '@/store';
import type {
  ApiResponse,
  AssignTicketInput,
  BulkActionInput,
  CreateTicketMessageInput,
  TicketDetail,
  TicketFilters,
  TicketListResponse,
  TicketStatistics,
  UpdateTicketPriorityInput,
  UpdateTicketStatusInput,
} from '@/types/ticket';
import {
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
} from '@/store/slices/ticketSlice';

// Fetch Tickets Saga
function* fetchTicketsSaga(
  action: PayloadAction<{ filters?: TicketFilters; page?: number; limit?: number }>
): SagaIterator {
  try {
    const state: RootState = yield select();
    const filters = action.payload.filters || state.ticket.filters;
    const page = action.payload.page || state.ticket.pagination.currentPage;
    const limit = action.payload.limit || state.ticket.pagination.itemsPerPage;

    const response: ApiResponse<TicketListResponse> = yield call(
      ticketApi.getTickets,
      filters,
      page,
      limit
    );

    if (response.success && response.data) {
      yield put(fetchTicketsSuccess(response.data));
    } else {
      yield put(fetchTicketsFailure(response.message || 'Failed to fetch tickets'));
    }
  } catch (error: any) {
    yield put(fetchTicketsFailure(error.message || 'Failed to fetch tickets'));
  }
}

// Fetch Ticket Detail Saga
function* fetchTicketDetailSaga(
  action: PayloadAction<{ ticketId: string }>
): SagaIterator {
  try {
    const response: ApiResponse<TicketDetail> = yield call(
      ticketApi.getTicketById,
      action.payload.ticketId
    );

    if (response.success && response.data) {
      yield put(fetchTicketDetailSuccess(response.data));
    } else {
      yield put(
        fetchTicketDetailFailure(response.message || 'Failed to fetch ticket details')
      );
    }
  } catch (error: any) {
    yield put(fetchTicketDetailFailure(error.message || 'Failed to fetch ticket details'));
  }
}

// Assign Ticket Saga
function* assignTicketSaga(
  action: PayloadAction<{ ticketId: string; data: AssignTicketInput }>
): SagaIterator {
  try {
    const response: ApiResponse<any> = yield call(
      ticketApi.assignTicket,
      action.payload.ticketId,
      action.payload.data
    );

    if (response.success && response.data) {
      yield put(assignTicketSuccess(response.data));
      // Refresh ticket detail if it's currently open
      const state: RootState = yield select();
      if (state.ticket.currentTicket?.id === action.payload.ticketId) {
        yield put(fetchTicketDetailRequest({ ticketId: action.payload.ticketId }));
      }
    } else {
      yield put(assignTicketFailure(response.message || 'Failed to assign ticket'));
    }
  } catch (error: any) {
    yield put(assignTicketFailure(error.message || 'Failed to assign ticket'));
  }
}

// Update Ticket Status Saga
function* updateTicketStatusSaga(
  action: PayloadAction<{ ticketId: string; data: UpdateTicketStatusInput }>
): SagaIterator {
  try {
    const response: ApiResponse<any> = yield call(
      ticketApi.updateTicketStatus,
      action.payload.ticketId,
      action.payload.data
    );

    if (response.success && response.data) {
      yield put(updateTicketStatusSuccess(response.data));
      // Refresh ticket detail if it's currently open
      const state: RootState = yield select();
      if (state.ticket.currentTicket?.id === action.payload.ticketId) {
        yield put(fetchTicketDetailRequest({ ticketId: action.payload.ticketId }));
      }
    } else {
      yield put(
        updateTicketStatusFailure(response.message || 'Failed to update ticket status')
      );
    }
  } catch (error: any) {
    yield put(updateTicketStatusFailure(error.message || 'Failed to update ticket status'));
  }
}

// Update Ticket Priority Saga
function* updateTicketPrioritySaga(
  action: PayloadAction<{ ticketId: string; data: UpdateTicketPriorityInput }>
): SagaIterator {
  try {
    const response: ApiResponse<any> = yield call(
      ticketApi.updateTicketPriority,
      action.payload.ticketId,
      action.payload.data
    );

    if (response.success && response.data) {
      yield put(updateTicketPrioritySuccess(response.data));
      // Refresh ticket detail if it's currently open
      const state: RootState = yield select();
      if (state.ticket.currentTicket?.id === action.payload.ticketId) {
        yield put(fetchTicketDetailRequest({ ticketId: action.payload.ticketId }));
      }
    } else {
      yield put(
        updateTicketPriorityFailure(response.message || 'Failed to update ticket priority')
      );
    }
  } catch (error: any) {
    yield put(
      updateTicketPriorityFailure(error.message || 'Failed to update ticket priority')
    );
  }
}

// Add Message Saga
function* addMessageSaga(
  action: PayloadAction<{ ticketId: string; data: CreateTicketMessageInput }>
): SagaIterator {
  try {
    const response: ApiResponse<any> = yield call(
      ticketApi.addMessage,
      action.payload.ticketId,
      action.payload.data
    );

    if (response.success) {
      yield put(addMessageSuccess(response.data));
      // Refresh ticket detail to show new message
      yield put(fetchTicketDetailRequest({ ticketId: action.payload.ticketId }));
    } else {
      yield put(addMessageFailure(response.message || 'Failed to send message'));
    }
  } catch (error: any) {
    yield put(addMessageFailure(error.message || 'Failed to send message'));
  }
}

// Add Internal Note Saga
function* addInternalNoteSaga(
  action: PayloadAction<{ ticketId: string; note: string }>
): SagaIterator {
  try {
    const response: ApiResponse<any> = yield call(
      ticketApi.addInternalNote,
      action.payload.ticketId,
      action.payload.note
    );

    if (response.success) {
      yield put(addInternalNoteSuccess());
      // Refresh ticket detail to show updated notes
      yield put(fetchTicketDetailRequest({ ticketId: action.payload.ticketId }));
    } else {
      yield put(addInternalNoteFailure(response.message || 'Failed to add internal note'));
    }
  } catch (error: any) {
    yield put(addInternalNoteFailure(error.message || 'Failed to add internal note'));
  }
}

// Bulk Action Saga
function* bulkActionSaga(action: PayloadAction<BulkActionInput>): SagaIterator {
  try {
    const response: ApiResponse<any> = yield call(ticketApi.bulkAction, action.payload);

    if (response.success) {
      yield put(bulkActionSuccess());
      // Refresh tickets list after bulk action
      yield put(fetchTicketsRequest({}));
    } else {
      yield put(bulkActionFailure(response.message || 'Failed to perform bulk action'));
    }
  } catch (error: any) {
    yield put(bulkActionFailure(error.message || 'Failed to perform bulk action'));
  }
}

// Fetch Statistics Saga
function* fetchStatisticsSaga(
  action: PayloadAction<{ period?: string }>
): SagaIterator {
  try {
    const state: RootState = yield select();
    const period = action.payload.period || state.ticket.statisticsPeriod;

    const response: ApiResponse<TicketStatistics> = yield call(
      ticketApi.getStatistics,
      period
    );

    if (response.success && response.data) {
      yield put(fetchStatisticsSuccess(response.data));
    } else {
      yield put(
        fetchStatisticsFailure(response.message || 'Failed to fetch statistics')
      );
    }
  } catch (error: any) {
    yield put(fetchStatisticsFailure(error.message || 'Failed to fetch statistics'));
  }
}

// Root Ticket Saga
export function* ticketSaga(): SagaIterator {
  yield all([
    takeLatest(fetchTicketsRequest.type, fetchTicketsSaga),
    takeLatest(fetchTicketDetailRequest.type, fetchTicketDetailSaga),
    takeLatest(assignTicketRequest.type, assignTicketSaga),
    takeLatest(updateTicketStatusRequest.type, updateTicketStatusSaga),
    takeLatest(updateTicketPriorityRequest.type, updateTicketPrioritySaga),
    takeLatest(addMessageRequest.type, addMessageSaga),
    takeLatest(addInternalNoteRequest.type, addInternalNoteSaga),
    takeLatest(bulkActionRequest.type, bulkActionSaga),
    takeLatest(fetchStatisticsRequest.type, fetchStatisticsSaga),
  ]);
}

