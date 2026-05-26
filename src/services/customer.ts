import { request } from './http';

// Customer is the staff-side projection of core's member entity.
// level_tag is the L1-L4 segmentation used by the SCRM rules — comes
// from core's member-level service; null when no rule has classified
// the member yet.
export interface Customer {
  id: string;
  name?: string;
  phone?: string;
  avatar?: string;
  level_tag?: 'L1' | 'L2' | 'L3' | 'L4';
  last_order_at?: string;
  total_spend?: number; // yuan
  // pending_followup is set by SCRM tasks; staff sees it as a red dot.
  pending_followup?: boolean;
}

export interface ListCustomersQuery {
  q?: string;
  level?: 'L1' | 'L2' | 'L3' | 'L4';
  followup_only?: boolean;
  limit?: number;
  cursor?: string;
}

export interface ListResult<T> {
  items: T[];
  next_cursor?: string;
}

export function listCustomersApi(q: ListCustomersQuery = {}): Promise<ListResult<Customer>> {
  const params = new URLSearchParams();
  if (q.q) params.set('q', q.q);
  if (q.level) params.set('level', q.level);
  if (q.followup_only) params.set('followup_only', '1');
  if (q.limit) params.set('limit', String(q.limit));
  if (q.cursor) params.set('cursor', q.cursor);
  const qs = params.toString();
  return request<ListResult<Customer>>({ url: `/members${qs ? '?' + qs : ''}` });
}

export function getCustomerApi(id: string): Promise<Customer> {
  return request<Customer>({ url: `/members/${encodeURIComponent(id)}` });
}
