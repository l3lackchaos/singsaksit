import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug } from './slug';

describe('slugify', () => {
  it('slugs Latin titles', () => {
    expect(slugify('Phra Somdej Wat Rakang')).toBe('phra-somdej-wat-rakang');
  });

  it('keeps Thai characters', () => {
    expect(slugify('พระสมเด็จ วัดระฆัง')).toBe('พระสมเด็จ-วัดระฆัง');
  });

  it('collapses separators and trims', () => {
    expect(slugify('  a---b  c ')).toBe('a-b-c');
  });

  it('falls back when empty', () => {
    expect(slugify('!!!')).toMatch(/^item-/);
  });
});

describe('uniqueSlug', () => {
  it('appends a counter on collision', () => {
    expect(uniqueSlug('Amulet', ['amulet'])).toBe('amulet-2');
    expect(uniqueSlug('Amulet', ['amulet', 'amulet-2'])).toBe('amulet-3');
  });
});
