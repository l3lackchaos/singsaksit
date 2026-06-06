import { afterEach, describe, expect, it } from 'vitest';
import {
  applySettingOverrides,
  getSetting,
  resetSettingOverrides,
  SETTINGS_DEFAULTS,
} from './settings';

afterEach(() => resetSettingOverrides());

describe('settings accessor', () => {
  it('returns typed defaults when nothing is overridden', () => {
    expect(getSetting('display.showStock')).toBe(true);
    expect(getSetting('payment.expiryHours')).toBe(48);
    expect(getSetting('store.name')).toBe(SETTINGS_DEFAULTS['store.name']);
  });

  it('applies DB overrides over defaults', () => {
    applySettingOverrides([{ key: 'display.showStock', value: false }]);
    expect(getSetting('display.showStock')).toBe(false);
  });

  it('ignores unknown keys from the data source', () => {
    applySettingOverrides([{ key: 'totally.unknown', value: 'x' }]);
    expect(getSetting('display.showStock')).toBe(true);
  });
});
