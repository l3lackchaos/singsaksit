// Money is stored as integer satang (1 THB = 100 satang). Never use floats for storage.

export function bahtToSatang(baht: number): number {
  return Math.round(baht * 100);
}

export function satangToBaht(satang: number): number {
  return satang / 100;
}

/** Format satang as Thai Baht currency, e.g. 150000 -> "฿1,500.00". */
export function formatThb(satang: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(satangToBaht(satang));
}
