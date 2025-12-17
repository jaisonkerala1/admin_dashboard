import { all, call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { PayloadAction } from '@reduxjs/toolkit';
import { astrologersApi, consultationsApi, liveStreamsApi, poojaRequestsApi, usersApi, dashboardApi } from '@/api';
import { Consultation, LiveStream, User } from '@/types';
import {
  DashboardChartPoint,
  DashboardPeriod,
  DashboardPeriodStats,
  fetchGlobalStatsFailure,
  fetchGlobalStatsRequest,
  fetchGlobalStatsSuccess,
  fetchDashboardFailure,
  fetchDashboardRequest,
  fetchDashboardSuccess,
  fetchLiveStreamsFailure,
  fetchLiveStreamsRequest,
  fetchLiveStreamsSuccess,
  fetchOnlineAstrologersFailure,
  fetchOnlineAstrologersRequest,
  fetchOnlineAstrologersSuccess,
} from '../slices/dashboardSlice';

type AnyRecord = Record<string, any>;

function getPeriodRange(period: DashboardPeriod) {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  
  // Set end to end of today (23:59:59.999) so we include all of today's data
  end.setHours(23, 59, 59, 999);
  
  switch (period) {
    case '1d':
      // "1 Day" = today only (start of today to end of today)
      start.setHours(0, 0, 0, 0);
      break;
    case '7d':
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;
    case '1m':
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case '3y':
      start.setFullYear(start.getFullYear() - 3);
      start.setHours(0, 0, 0, 0);
      break;
  }
  return { start, end };
}

function dateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function hourKey(d: Date) {
  return String(d.getHours()).padStart(2, '0');
}

function monthKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

function quarterKey(d: Date) {
  const yyyy = d.getFullYear();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${yyyy}-Q${q}`;
}

function labelForKey(period: DashboardPeriod, key: string) {
  if (period === '1d') return `${key}:00`;
  if (period === '1y') {
    const [y, m] = key.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
  if (period === '3y') return key;
  // 7d / 1m: yyyy-mm-dd
  const [y, m, d] = key.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString('en-US', { weekday: period === '7d' ? 'short' : undefined, month: 'short', day: 'numeric' });
}

function buildBuckets(period: DashboardPeriod, start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(start);
  if (period === '1d') {
    // 24 hours, using today (end date's day)
    const dayStart = new Date(end);
    dayStart.setHours(0, 0, 0, 0);
    for (let h = 0; h < 24; h++) keys.push(String(h).padStart(2, '0'));
    return keys;
  }
  if (period === '1y') {
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 12; i++) {
      keys.push(monthKey(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return keys;
  }
  if (period === '3y') {
    // 12 quarters
    cursor.setMonth(Math.floor(cursor.getMonth() / 3) * 3, 1);
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 12; i++) {
      keys.push(quarterKey(cursor));
      cursor.setMonth(cursor.getMonth() + 3);
    }
    return keys;
  }
  // 7d and 1m: daily buckets from start to end (inclusive), capped to 31 days for 1m
  while (cursor <= end) {
    keys.push(dateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
    if (period === '1m' && keys.length >= 31) break;
  }
  return keys;
}

function isWithin(d: Date, start: Date, end: Date) {
  return d >= start && d <= end;
}

function* fetchAllPages(
  getAllFn: (params: AnyRecord) => Promise<any>,
  params: AnyRecord,
  start: Date,
  createdAtField = 'createdAt'
): SagaIterator<AnyRecord[]> {
  const items: AnyRecord[] = [];
  const limit = params.limit || 200;
  let page = 1;
  let stop = false;
  while (!stop && page <= 10) {
    const resp: any = yield call(getAllFn, { ...params, page, limit });
    const data = resp?.data?.data ?? resp?.data ?? [];
    for (const it of data) items.push(it);
    const last = data?.[data.length - 1];
    const lastDate = last?.[createdAtField] ? new Date(last[createdAtField]) : null;
    if (!data.length || (lastDate && lastDate < start)) stop = true;
    page += 1;
  }
  return items;
}

function* fetchDashboardSaga(action: PayloadAction<{ period: DashboardPeriod }>): SagaIterator<void> {
  try {
    const period = action.payload.period;
    const { start, end } = getPeriodRange(period);

    // Fetch enough recent data and filter client-side by start/end
    const results: AnyRecord[] = (yield all([
      call(
        fetchAllPages,
        consultationsApi.getAll as any,
        // IMPORTANT: Consultations should be fetched/sorted by scheduledTime because
        // we bucket/filter by scheduledTime. If we sort/paginate by createdAt, we can
        // prematurely stop and miss consultations scheduled within the period.
        { sortBy: 'scheduledTime', sortOrder: 'desc', limit: 200 },
        start,
        'scheduledTime'
      ),
      call(
        fetchAllPages,
        poojaRequestsApi.getAll as any,
        { sortBy: 'createdAt', sortOrder: 'desc', limit: 200 },
        start,
        'createdAt'
      ),
      call(
        fetchAllPages,
        usersApi.getAll as any,
        { sortBy: 'createdAt', sortOrder: 'desc', limit: 200 },
        start,
        'createdAt'
      ),
      call(
        fetchAllPages,
        astrologersApi.getAll as any,
        { sortBy: 'createdAt', sortOrder: 'desc', limit: 200 },
        start,
        'createdAt'
      ),
    ])) as any;

    const [consultations, serviceRequests, users, astrologers] = results as unknown as [
      Consultation[],
      AnyRecord[],
      User[],
      AnyRecord[],
    ];

    const getConsultationDate = (c: any) => {
      // Consultations should be bucketed by when they are scheduled to happen
      // (not when they were created). Fallback to createdAt if scheduledTime missing.
      const raw = c?.scheduledTime || c?.createdAt;
      return new Date(raw);
    };

    const consultationsInPeriod = consultations.filter((c: any) => {
      const dt = getConsultationDate(c);
      return !Number.isNaN(dt.getTime()) && isWithin(dt, start, end);
    });
    const completedConsultations = consultationsInPeriod.filter((c: any) => c.status === 'completed');
    const revenue = completedConsultations.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

    const serviceRequestsInPeriod = (serviceRequests || []).filter((r: any) => {
      const dt = new Date(r.createdAt);
      return !Number.isNaN(dt.getTime()) && isWithin(dt, start, end);
    });

    const usersInPeriod = (users || []).filter((u: any) => {
      const dt = new Date(u.createdAt);
      return !Number.isNaN(dt.getTime()) && isWithin(dt, start, end);
    });

    const astrologersInPeriod = (astrologers || []).filter((a: any) => {
      const dt = new Date(a.createdAt);
      return !Number.isNaN(dt.getTime()) && isWithin(dt, start, end);
    });

    const periodStats: DashboardPeriodStats = {
      astrologersNew: astrologersInPeriod.length,
      usersNew: usersInPeriod.length,
      consultations: consultationsInPeriod.length,
      completedConsultations: completedConsultations.length,
      revenue,
      serviceRequests: serviceRequestsInPeriod.length,
    };

    const buckets = buildBuckets(period, start, end);
    const countsConsult: Record<string, number> = {};
    const countsReq: Record<string, number> = {};

    const bucketFor = (dt: Date) => {
      if (period === '1d') return hourKey(dt);
      if (period === '1y') return monthKey(dt);
      if (period === '3y') return quarterKey(dt);
      return dateKey(dt);
    };

    for (const c of consultationsInPeriod as any[]) {
      const dt = getConsultationDate(c);
      const k = bucketFor(dt);
      countsConsult[k] = (countsConsult[k] || 0) + 1;
    }
    for (const r of serviceRequestsInPeriod as any[]) {
      const dt = new Date(r.createdAt);
      const k = bucketFor(dt);
      countsReq[k] = (countsReq[k] || 0) + 1;
    }

    const chartData: DashboardChartPoint[] = buckets.map((k) => ({
      label: labelForKey(period, k),
      consultations: countsConsult[k] || 0,
      serviceRequests: countsReq[k] || 0,
    }));

    yield put(fetchDashboardSuccess({ periodStats, chartData }));
  } catch (err: any) {
    yield put(fetchDashboardFailure(err?.message || 'Failed to load dashboard'));
  }
}

function* fetchLiveStreamsSaga(): SagaIterator<void> {
  try {
    const resp: any = yield call(liveStreamsApi.getAll as any, {
      page: 1,
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    const data: LiveStream[] = resp?.data ?? [];
    const active = data.filter((s) => s.isLive);
    yield put(fetchLiveStreamsSuccess(active));
  } catch {
    yield put(fetchLiveStreamsFailure());
  }
}

function* fetchOnlineAstrologersSaga(): SagaIterator<void> {
  try {
    const resp: any = yield call(astrologersApi.getOnlineList as any);
    yield put(fetchOnlineAstrologersSuccess(resp?.data || []));
  } catch {
    yield put(fetchOnlineAstrologersFailure());
  }
}

export default function* dashboardSaga(): SagaIterator<void> {
  yield takeLatest(fetchDashboardRequest.type, fetchDashboardSaga);
  yield takeLatest(fetchGlobalStatsRequest.type, fetchGlobalStatsSaga);
  yield takeLatest(fetchLiveStreamsRequest.type, fetchLiveStreamsSaga);
  yield takeLatest(fetchOnlineAstrologersRequest.type, fetchOnlineAstrologersSaga);
}

function* fetchGlobalStatsSaga(): SagaIterator<void> {
  try {
    const resp: any = yield call(dashboardApi.getStats as any);
    if (resp?.data) {
      yield put(fetchGlobalStatsSuccess(resp.data));
    } else {
      yield put(fetchGlobalStatsFailure());
    }
  } catch {
    yield put(fetchGlobalStatsFailure());
  }
}


