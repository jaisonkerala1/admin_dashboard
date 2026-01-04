import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { servicesApi, approvalApi } from '@/api';
import { Service } from '@/types';
import {
  fetchServicesRequest,
  fetchServicesSuccess,
  fetchServicesFailure,
  ServicesStats,
} from '../slices/servicesSlice';

function* fetchServicesSaga(): SagaIterator {
  try {
    // Fetch all services (no pagination, filter client-side)
    const response: { success: boolean; data: Service[] } = yield call(
      servicesApi.getAll,
      {
        limit: 1000, // Fetch all
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
    );

    const services = response.data || [];

    // Calculate stats
    const activeServices = services.filter(s => s.isActive && !s.isDeleted);
    const inactiveServices = services.filter(s => !s.isActive || s.isDeleted);

    // Fetch pending count from approval stats
    let pendingCount = 0;
    try {
      const approvalStatsResponse = yield call(approvalApi.getApprovalStats);
      if (approvalStatsResponse.success && approvalStatsResponse.data) {
        pendingCount = approvalStatsResponse.data.pendingServices || 0;
      }
    } catch (error) {
      console.warn('Failed to fetch pending services count:', error);
      // Fallback: count inactive services as pending (may not be accurate)
      pendingCount = inactiveServices.length;
    }

    const stats: ServicesStats = {
      total: services.length,
      active: activeServices.length,
      inactive: inactiveServices.length,
      pending: pendingCount,
      totalBookings: services.reduce((sum, s) => sum + (s.totalBookings || 0), 0),
      completedBookings: services.reduce((sum, s) => sum + (s.completedBookings || 0), 0),
      totalRevenue: services.reduce((sum, s) => sum + (s.price * (s.completedBookings || 0)), 0),
      averageRating: services.length > 0
        ? services.reduce((sum, s) => sum + (s.averageRating || 0), 0) / services.length
        : 0,
    };

    yield put(fetchServicesSuccess({ services, stats }));
  } catch (error: any) {
    console.error('Failed to fetch services:', error);
    yield put(fetchServicesFailure(error?.message || 'Failed to fetch services'));
  }
}

export default function* servicesSaga(): SagaIterator {
  yield takeLatest(fetchServicesRequest.type, fetchServicesSaga);
}


