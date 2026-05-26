import { request } from './http';

// RecommendItem is the staff-tool projection of a recommended SKU.
// reason carries the recommender's why-string ("已购同品类 / 复购周期到了")
// — surfacing it lets staff pitch the SKU instead of just reading a name.
//
// Backend extension point: /me/recommend is exposed via the plugin SDK
// so each vertical (pet / mombaby / fashion) can swap in its own ranker
// without touching this UI. Until the plugin lands, core returns a
// generic "recently popular" list.
export interface RecommendItem {
  sku_id: string;
  name: string;
  price: number; // yuan
  cover_url?: string;
  reason?: string;
}

export function recommendForMemberApi(member_id: string): Promise<RecommendItem[]> {
  return request<RecommendItem[]>({
    url: `/me/recommend?member_id=${encodeURIComponent(member_id)}`,
  });
}
