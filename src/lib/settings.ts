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
  'contact.email': '' as string,
  'contact.phone': '' as string,
  'contact.lineId': '' as string,
  'contact.facebookUrl': '' as string,
  'contact.hours': 'จันทร์–เสาร์ 9:00–18:00 น.' as string,
  // Homepage hero (admin-editable). Empty title falls back to store.name.
  'hero.badge': 'พระแท้ ตรวจสอบได้ ชำระเงินปลอดภัย' as string,
  'hero.title': '' as string,
  'hero.subtitle': 'ศูนย์รวมพระเครื่องมงคล' as string,
  'hero.description':
    'คัดสรรพระเครื่องคุณภาพ พร้อมระบบยืนยันการชำระเงินโดยแอดมิน และติดตามสถานะคำสั่งซื้อแบบเรียลไทม์' as string,
  'hero.primaryLabel': 'เลือกชมพระเครื่อง' as string,
  'hero.primaryHref': '/products' as string,
  'hero.secondaryLabel': 'เกี่ยวกับเรา' as string,
  'hero.secondaryHref': '/about' as string,
  // Homepage carousel ads. When non-empty they replace the auto product carousel.
  'homepage.carouselAds': [] as Array<{
    id: string;
    imagePath: string;
    title: string;
    body: string;
    href: string;
  }>,
  'payment.expiryHours': 48,
  'payment.promptpayId': '',
  'payment.bankAccounts': [] as Array<{ bank: string; name: string; number: string }>,
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
