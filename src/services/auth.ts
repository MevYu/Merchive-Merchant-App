import { request } from './http';

// MeIdentity mirrors core's auth.MeIdentity (internal/auth/me_models.go).
// roles is the closed set core emits; merchant app rejects accounts that
// carry only consumer roles (MEMBER / GUEST etc.).
export interface MeIdentity {
  user_id: string;
  tenant_id: string;
  account_type: string;
  login: string;
  phone?: string;
  roles: string[];
  display_name?: string;
  avatar?: string;
  // store_id is the home store the account is assigned to; STORE_STAFF
  // accounts are always bound to one. MGR / FRANCHISEE / OWNER may have
  // multi-store reach (handled by switchStore UX, not by this field).
  store_id?: string;
}

// MERCHANT_ROLES is the gate — any account whose roles intersect this set
// is allowed in. Keep in sync with core's role enum. OWNER is the
// tenant-owner super-role; TENANT_ADMIN is the platform-admin scope.
export const MERCHANT_ROLES = [
  'STORE_STAFF',
  'STORE_MGR',
  'FRANCHISEE',
  'TENANT_ADMIN',
  'OWNER',
] as const;

export type MerchantRole = (typeof MERCHANT_ROLES)[number];

export function isMerchantRole(role: string): role is MerchantRole {
  return (MERCHANT_ROLES as readonly string[]).includes(role);
}

export function hasMerchantRole(roles: string[] | undefined | null): boolean {
  if (!roles) return false;
  return roles.some(isMerchantRole);
}

export function getMeApi(): Promise<MeIdentity> {
  return request<MeIdentity>({ url: '/auth/me' });
}

export interface WxLoginInput {
  js_code: string;
  tenant_id: string;
}

export interface WxLoginResult {
  token: string;
  refresh?: string;
  identity?: MeIdentity;
}

// wxLoginApi: POST /auth/wxlogin — endpoint planned on core. Same shape
// as the miniapp call; only the wx appid (sent server-side per tenant
// config) differs.
export function wxLoginApi(input: WxLoginInput): Promise<WxLoginResult> {
  return request<WxLoginResult>({ url: '/auth/wxlogin', method: 'POST', data: input });
}
