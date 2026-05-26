// Tiny date helpers shared by dashboard greeting + handover shift
// duration. Kept dependency-free (no dayjs) since Taro's wx target
// strips heavier packages.

export function hourOfDay(): number {
  return new Date().getHours();
}

// greetingKey returns the i18n key suffix used by the dashboard
// ("morning" / "afternoon" / "evening") — page composes
// `pages:dashboard.greeting{Morning|Afternoon|Evening}`.
export function greetingKey(): 'Morning' | 'Afternoon' | 'Evening' {
  const h = hourOfDay();
  if (h < 12) return 'Morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
}

// formatYuan turns a number into a string with thousands separators and
// up to 2 decimals — uses Intl.NumberFormat which Taro ships on all
// three targets.
export function formatYuan(v: number): string {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(v);
}

// elapsedMinutes returns whole minutes between an ISO start and now.
// Used by the handover page's "started 3h 24m ago" label.
export function elapsedMinutes(isoStart: string): number {
  const start = new Date(isoStart).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / 60_000));
}
