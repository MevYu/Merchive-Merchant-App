import { request } from './http';

// GuideStats is the dashboard payload. Endpoint /me/guide-stats is
// planned on core but not yet implemented — callers swallow 404 and
// fall back to MOCK_STATS so the UI is testable. Replace once shipped.
export interface GuideStats {
  date: string; // YYYY-MM-DD
  today: {
    sales: number; // yuan
    customers: number;
    orders: number;
    aov: number; // yuan
  };
  week_trend: { day: string; sales: number }[]; // length 7, oldest → newest
  rank: {
    store: number; // 1-based, my rank in this store today
    me: number; // 1-based, my personal rank across stores
  };
  tasks: { callback: number; pickup: number; shipping: number };
}

// MOCK_STATS lets the dashboard render before core ships the endpoint.
// Numbers are intentionally non-round so a real fetch obviously
// supersedes the placeholder.
export const MOCK_STATS: GuideStats = {
  date: new Date().toISOString().slice(0, 10),
  today: { sales: 4128, customers: 18, orders: 28, aov: 147 },
  week_trend: [
    { day: 'Mon', sales: 2100 },
    { day: 'Tue', sales: 2890 },
    { day: 'Wed', sales: 3420 },
    { day: 'Thu', sales: 2750 },
    { day: 'Fri', sales: 3980 },
    { day: 'Sat', sales: 5120 },
    { day: 'Sun', sales: 4128 },
  ],
  rank: { store: 3, me: 12 },
  tasks: { callback: 5, pickup: 2, shipping: 3 },
};

export async function getGuideStatsApi(): Promise<GuideStats> {
  try {
    return await request<GuideStats>({ url: '/me/guide-stats?date=today' });
  } catch (e) {
    // 404 / 5xx during early development — fall back to mock. Once core
    // ships the endpoint this catch will swallow only transient errors.
    if (e instanceof Error && /404|not found/i.test(e.message)) {
      return MOCK_STATS;
    }
    throw e;
  }
}
