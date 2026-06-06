// Typed accessor for Global Settings (docs/SPEC.md §6).
// Anything an admin should be able to toggle lives here, never hard-coded at call sites.
// Defaults are safe fallbacks; DB rows (GlobalSetting table) override at runtime via
// `applySettingOverrides` once the data layer is wired up.

export const SETTINGS_DEFAULTS = {
  'display.showStock': true,
  'display.showOutOfStock': true,
  'display.lowStockBadge': true,
  'theme.default': 'system' as 'light' | 'dark' | 'system',
  'theme.allowUserToggle': true,
  'theme.brandColor': '#9a6a2f',
  'store.name': 'สิ่งศักดิ์สิทธิ์',
  'payment.expiryHours': 48,
  'shipping.fee': 5000, // satang
  'shipping.freeOver': 200000, // satang
  'feature.couponsEnabled': true,
  'feature.reviewsEnabled': true,
  'feature.maintenanceMode': false,
  'privacy.policyVersion': '1.0',
  'privacy.dataRetentionDays': 365,
} as const;

export type SettingKey = keyof typeof SETTINGS_DEFAULTS;
export type SettingValue<K extends SettingKey> = (typeof SETTINGS_DEFAULTS)[K];

const overrides = new Map<SettingKey, unknown>();

/** Merge persisted settings (e.g. from the GlobalSetting table) over the defaults. */
export function applySettingOverrides(rows: Array<{ key: string; value: unknown }>): void {
  for (const row of rows) {
    if (row.key in SETTINGS_DEFAULTS) {
      overrides.set(row.key as SettingKey, row.value);
    }
  }
}

/** Clear all runtime overrides (useful in tests). */
export function resetSettingOverrides(): void {
  overrides.clear();
}

/** Read a setting with a guaranteed, type-correct fallback. */
export function getSetting<K extends SettingKey>(key: K): SettingValue<K> {
  if (overrides.has(key)) {
    return overrides.get(key) as SettingValue<K>;
  }
  return SETTINGS_DEFAULTS[key];
}
