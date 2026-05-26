import { request } from './http';
import type { ListResult } from './customer';

// OrderLine is the SKU + qty pair the staff assembles in the wizard.
// Optional applied_price lets a manager override list price (logged
// server-side; needs OVERRIDE_PRICE permission).
export interface OrderLine {
  sku_id: string;
  qty: number;
  applied_price?: number; // yuan; absent means use catalog price
}

// PlaceOrderInput is the body POST /orders accepts; on_behalf_of marks
// it as a staff-placed order so analytics can credit the guide.
export interface PlaceOrderInput {
  member_id: string;
  store_id: string;
  lines: OrderLine[];
  on_behalf_of?: true;
  // idempotency_key — staff may retap submit on a flaky network. core
  // dedupes by this string per-tenant within a 24h window.
  idempotency_key: string;
}

export interface OrderSummary {
  id: string;
  status: 'pending_pay' | 'paid' | 'shipped' | 'done' | 'cancelled';
  total_amount: number;
  member_id: string;
  member_name?: string;
  placed_at: string;
}

export interface OrderPreview {
  subtotal: number;
  discount: number;
  total: number;
  // applied_promotions surfaces in the preview so staff can explain the
  // discount to the customer ("VIP -10%, satsified 2nd 50%"). Empty
  // array means no promotion fired.
  applied_promotions: { code: string; label: string; amount: number }[];
}

export function previewOrderApi(input: PlaceOrderInput): Promise<OrderPreview> {
  return request<OrderPreview>({ url: '/orders/preview', method: 'POST', data: input });
}

export function placeOrderApi(input: PlaceOrderInput): Promise<OrderSummary> {
  return request<OrderSummary>({ url: '/orders', method: 'POST', data: input });
}

export function listMyPlacedOrdersApi(): Promise<ListResult<OrderSummary>> {
  return request<ListResult<OrderSummary>>({ url: '/orders?placed_by=me' });
}
