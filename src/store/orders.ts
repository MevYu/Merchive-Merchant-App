import { create } from 'zustand';
import type { OrderLine, OrderPreview, OrderSummary, PlaceOrderInput } from '@/services/order';
import { listMyPlacedOrdersApi, placeOrderApi, previewOrderApi } from '@/services/order';

// DraftOrder is the wizard's working state (selected member + cart
// lines). Lives in the store so the user can step away to the customer
// detail page and come back without losing input.
export interface DraftOrder {
  member_id: string;
  member_name?: string;
  store_id: string;
  lines: OrderLine[];
}

export interface OrdersState {
  draft: DraftOrder | null;
  preview: OrderPreview | null;
  myPlaced: OrderSummary[];
  loading: boolean;
  err: string | null;

  setDraft: (d: DraftOrder | null) => void;
  addLine: (line: OrderLine) => void;
  removeLine: (sku_id: string) => void;
  refreshPreview: () => Promise<void>;
  submit: () => Promise<OrderSummary | null>;
  loadMyPlaced: () => Promise<void>;
}

function newIdemKey(): string {
  // simple uuid-ish; uniqueness window is short enough that Date.now +
  // a small random suffix is sufficient. Don't use crypto.randomUUID
  // because the wx runtime doesn't expose it.
  return `mer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useOrders = create<OrdersState>((set, get) => ({
  draft: null,
  preview: null,
  myPlaced: [],
  loading: false,
  err: null,

  setDraft: (d) => set({ draft: d, preview: null }),

  addLine: (line) => {
    const d = get().draft;
    if (!d) return;
    const existing = d.lines.find((l) => l.sku_id === line.sku_id);
    const lines = existing
      ? d.lines.map((l) => (l.sku_id === line.sku_id ? { ...l, qty: l.qty + line.qty } : l))
      : [...d.lines, line];
    set({ draft: { ...d, lines }, preview: null });
  },

  removeLine: (sku_id) => {
    const d = get().draft;
    if (!d) return;
    set({ draft: { ...d, lines: d.lines.filter((l) => l.sku_id !== sku_id) }, preview: null });
  },

  refreshPreview: async () => {
    const d = get().draft;
    if (!d || d.lines.length === 0) {
      set({ preview: null });
      return;
    }
    set({ loading: true, err: null });
    try {
      const p = await previewOrderApi({
        member_id: d.member_id,
        store_id: d.store_id,
        lines: d.lines,
        on_behalf_of: true,
        idempotency_key: newIdemKey(),
      });
      set({ preview: p, loading: false });
    } catch (e) {
      set({ err: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  submit: async () => {
    const d = get().draft;
    if (!d) return null;
    set({ loading: true, err: null });
    try {
      const input: PlaceOrderInput = {
        member_id: d.member_id,
        store_id: d.store_id,
        lines: d.lines,
        on_behalf_of: true,
        idempotency_key: newIdemKey(),
      };
      const r = await placeOrderApi(input);
      set({ draft: null, preview: null, loading: false });
      return r;
    } catch (e) {
      set({ err: e instanceof Error ? e.message : String(e), loading: false });
      return null;
    }
  },

  loadMyPlaced: async () => {
    set({ loading: true, err: null });
    try {
      const r = await listMyPlacedOrdersApi();
      set({ myPlaced: r.items, loading: false });
    } catch (e) {
      set({ err: e instanceof Error ? e.message : String(e), loading: false });
    }
  },
}));
