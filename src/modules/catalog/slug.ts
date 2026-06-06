// Generate a URL slug from a product title. Keeps Latin alphanumerics and Thai
// characters (URLs allow UTF-8), turns separators into hyphens. Falls back to a
// random suffix when nothing usable remains. Admins can always override the slug.

export function slugify(input: string): string {
  const base = input
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9฀-๿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  if (base) return base;
  return `item-${Math.random().toString(36).slice(2, 8)}`;
}

export function uniqueSlug(input: string, taken: Iterable<string>): string {
  const set = new Set(taken);
  const base = slugify(input);
  if (!set.has(base)) return base;
  let i = 2;
  while (set.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
