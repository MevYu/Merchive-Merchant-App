import Taro from '@tarojs/taro';

// AuthBag is the persisted bearer-token bag for the merchant app.
// Key differs from miniapp's ('chainengine-auth') so a single device
// running both apps doesn't cross-contaminate sessions.
export interface AuthBag {
  token: string | null;
  refresh: string | null;
}

const STORAGE_KEY = 'chainengine-merchant-auth';

export class UnauthorizedError extends Error {
  constructor(msg = 'unauthorized') {
    super(msg);
    this.name = 'UnauthorizedError';
  }
}

export function loadAuth(): AuthBag {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthBag;
  } catch {
    /* fallthrough */
  }
  const devToken = (process.env.TARO_APP_LOCAL_DEV_TOKEN as string) || '';
  if (devToken) return { token: devToken, refresh: null };
  return { token: null, refresh: null };
}

export function saveAuth(bag: AuthBag): void {
  Taro.setStorageSync(STORAGE_KEY, JSON.stringify(bag));
}

export function clearAuth(): void {
  Taro.removeStorageSync(STORAGE_KEY);
}

export function hasAuth(): boolean {
  return !!loadAuth().token;
}

// request is the singleton HTTP entry. Adds bearer + tenant header and
// unwraps core's { data, err } envelope. 401 throws UnauthorizedError
// so app.tsx can bounce to /pages/login/index.
export async function request<T = unknown>(opts: {
  url: string;
  method?: keyof Taro.request.Method;
  data?: unknown;
  headers?: Record<string, string>;
  tenantId?: string;
}): Promise<T> {
  const base = (process.env.TARO_APP_API_BASE as string) || '';
  const auth = loadAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
  };
  if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;
  if (opts.tenantId) headers['X-Tenant-Id'] = opts.tenantId;

  const resp = await Taro.request<{ data?: T; err?: string }>({
    url: base + opts.url,
    method: opts.method ?? 'GET',
    data: opts.data,
    header: headers,
  });

  if (resp.statusCode === 401) {
    clearAuth();
    throw new UnauthorizedError(resp.data?.err || 'unauthorized');
  }
  if (resp.statusCode >= 400) {
    throw new Error(resp.data?.err || `http ${resp.statusCode}`);
  }
  return (resp.data as T) ?? (resp.data as T);
}
