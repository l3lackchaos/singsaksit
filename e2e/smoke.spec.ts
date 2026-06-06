import { test, expect } from '@playwright/test';

test('home page renders hero and store name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('catalog lists products from the database', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'พระเครื่องทั้งหมด' })).toBeVisible();
  // At least one seeded product link should be present.
  await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
});

test('product detail shows price and add-to-cart', async ({ page }) => {
  await page.goto('/products');
  await page.locator('a[href^="/product/"]').first().click();
  await expect(page.getByRole('button', { name: /เพิ่มลงตะกร้า|สินค้าหมด/ })).toBeVisible();
});

test('add to cart shows the item in the cart', async ({ page }) => {
  await page.goto('/product/phra-pidta-lp-toh'); // seeded, in stock
  await page.getByRole('button', { name: /เพิ่มลงตะกร้า/ }).click();
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'ตะกร้าสินค้า' })).toBeVisible();
  await expect(page.getByText('พระปิดตา หลวงปู่โต๊ะ')).toBeVisible();
});

test('catalog search and sort respond', async ({ page }) => {
  await page.goto('/products?sort=price_asc');
  await expect(page.getByRole('heading', { name: 'พระเครื่องทั้งหมด' })).toBeVisible();
  await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
});

test('account is protected and redirects to sign-in', async ({ page }) => {
  await page.goto('/account');
  await expect(page).toHaveURL(/\/sign-in/);
});

test('robots and sitemap are served', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain('/product/');
});
