import { request } from './http';

// Shift = one staff session (open → close) used for cash reconciliation
// and per-shift KPI rollups. Endpoints are planned on core; until they
// ship the handover page falls back to a local-only mock so the UX is
// testable end-to-end.
export interface Shift {
  id: string;
  store_id: string;
  staff_user_id: string;
  started_at: string; // ISO 8601
  ended_at?: string;
  sales_amount?: number; // 元 (yuan), not 分 — display-friendly
  order_count?: number;
  cash_expected?: number;
}

export function getCurrentShiftApi(): Promise<Shift | null> {
  return request<Shift | null>({ url: '/shifts/current' });
}

export function startShiftApi(input: { store_id: string }): Promise<Shift> {
  return request<Shift>({ url: '/shifts/start', method: 'POST', data: input });
}

export function endShiftApi(input: { shift_id: string; cash_counted?: number }): Promise<Shift> {
  return request<Shift>({ url: '/shifts/end', method: 'POST', data: input });
}

export function listShiftsApi(): Promise<Shift[]> {
  return request<Shift[]>({ url: '/shifts' });
}
