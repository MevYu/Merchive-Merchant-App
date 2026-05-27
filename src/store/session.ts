import Taro from '@tarojs/taro';
import { create } from 'zustand';
import type { MeIdentity, MerchantRole } from '@/services/auth';
import { hasMerchantRole } from '@/services/auth';

// SessionState carries the merchant-side identity.
//
//   roles            — closed set (STORE_STAFF / STORE_MGR / ...). Used by
//                       route guards on every page.
//   currentStoreId   — store the user is acting on right now. For
//                       STORE_STAFF this equals identity.store_id and
//                       can't change; for MGR / FRANCHISEE / OWNER the
//                       switchStore UX writes it.
//   currentShiftId   — set when handover page opens a shift, cleared
//                       when it ends. Persisted so a reload mid-shift
//                       restores the indicator.
//   channel          — inferred from Taro.getEnv at boot; used by API
//                       calls to set the X-Channel header on writes.

export interface SessionState {
  user_id?: string;
  tenant_id?: string;
  display_name?: string;
  avatar?: string;
  roles: string[];
  currentStoreId: string;
  currentShiftId: string;
  channel: 'mp' | 'h5' | 'app';

  setIdentity: (id: MeIdentity) => void;
  setCurrentStore: (id: string) => void;
  setCurrentShift: (id: string) => void;
  logout: () => void;

  currentRole: () => MerchantRole | null;
  isAllowed: () => boolean;
}

const STORAGE_KEY = 'merchive-merchant-session';

function inferChannel(): SessionState['channel'] {
  const env = Taro.getEnv();
  if (env === 'WEB') return 'h5';
  if (env === 'RN') return 'app';
  return 'mp';
}

type Persisted = Pick<
  SessionState,
  'user_id' | 'tenant_id' | 'display_name' | 'avatar' | 'roles' | 'currentStoreId' | 'currentShiftId'
>;

function load(): Pick<
  SessionState,
  'user_id' | 'tenant_id' | 'display_name' | 'avatar' | 'roles' | 'currentStoreId' | 'currentShiftId' | 'channel'
> {
  const channel = inferChannel();
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Persisted>;
      return {
        user_id: p.user_id,
        tenant_id: p.tenant_id,
        display_name: p.display_name,
        avatar: p.avatar,
        roles: p.roles ?? [],
        currentStoreId: p.currentStoreId ?? '',
        currentShiftId: p.currentShiftId ?? '',
        channel,
      };
    }
  } catch {
    /* fallthrough */
  }
  return { roles: [], currentStoreId: '', currentShiftId: '', channel };
}

function snapshot(s: SessionState): Persisted {
  return {
    user_id: s.user_id,
    tenant_id: s.tenant_id,
    display_name: s.display_name,
    avatar: s.avatar,
    roles: s.roles,
    currentStoreId: s.currentStoreId,
    currentShiftId: s.currentShiftId,
  };
}

function persist(s: Persisted) {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* swallow */
  }
}

// ROLE_PRIORITY: when an account has multiple merchant roles (rare but
// possible — e.g. an owner who occasionally rings up sales) we surface
// the highest. UI flows still gate on the actual roles[] for permissions.
const ROLE_PRIORITY: MerchantRole[] = [
  'OWNER',
  'TENANT_ADMIN',
  'FRANCHISEE',
  'STORE_MGR',
  'STORE_STAFF',
];

export const useSession = create<SessionState>((set, get) => ({
  ...load(),

  setIdentity: (id) => {
    const next: Partial<SessionState> = {
      user_id: id.user_id,
      tenant_id: id.tenant_id,
      display_name: id.display_name || get().display_name,
      avatar: id.avatar || get().avatar,
      roles: id.roles ?? [],
      // STORE_STAFF can only operate on their home store; pre-fill it.
      currentStoreId: id.store_id || get().currentStoreId,
    };
    set(next);
    persist(snapshot({ ...get(), ...next }));
  },

  setCurrentStore: (id) => {
    set({ currentStoreId: id });
    persist(snapshot({ ...get(), currentStoreId: id }));
  },

  setCurrentShift: (id) => {
    set({ currentShiftId: id });
    persist(snapshot({ ...get(), currentShiftId: id }));
  },

  logout: () => {
    const next: Partial<SessionState> = {
      user_id: undefined,
      tenant_id: undefined,
      display_name: undefined,
      avatar: undefined,
      roles: [],
      currentStoreId: '',
      currentShiftId: '',
    };
    set(next);
    persist(snapshot({ ...get(), ...next }));
  },

  currentRole: () => {
    const roles = get().roles;
    for (const r of ROLE_PRIORITY) {
      if (roles.includes(r)) return r;
    }
    return null;
  },

  isAllowed: () => hasMerchantRole(get().roles),
}));
