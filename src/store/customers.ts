import { create } from 'zustand';
import type { Customer } from '@/services/customer';
import { listCustomersApi } from '@/services/customer';

// CustomersState caches the most recent list query so the detail page
// can pull a row without re-fetching. The store is intentionally tiny —
// large lists belong in page-local state.
export interface CustomersState {
  items: Customer[];
  loading: boolean;
  err: string | null;
  load: (q?: { q?: string; level?: Customer['level_tag']; followup_only?: boolean }) => Promise<void>;
  findById: (id: string) => Customer | undefined;
}

export const useCustomers = create<CustomersState>((set, get) => ({
  items: [],
  loading: false,
  err: null,

  load: async (q) => {
    set({ loading: true, err: null });
    try {
      const r = await listCustomersApi(q ?? {});
      set({ items: r.items, loading: false });
    } catch (e) {
      set({ err: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  findById: (id) => get().items.find((c) => c.id === id),
}));
