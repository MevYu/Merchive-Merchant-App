import Taro from '@tarojs/taro';

// Thin Taro.getStorage wrapper that swallows the sync-throw on some RN
// bridges. Use this for non-critical cache reads (e.g. last-seen
// dashboard date); critical reads should call Taro directly so the
// failure surfaces.

export function readCache<T = unknown>(key: string): T | null {
  try {
    const raw = Taro.getStorageSync(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: unknown): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(value));
  } catch {
    /* best-effort */
  }
}
