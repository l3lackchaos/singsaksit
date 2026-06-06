import { test, expect } from '@playwright/test';

// Full purchase path against the live DB using the seeded admin account.
// The admin acts as both buyer and reviewer here to exercise the whole loop:
// sign in → add to cart → checkout → upload slip → admin confirm → PAID.
// Uses the dedicated high-stock product `e2e-test-amulet` so runs don't drain seed stock.

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Admin123!';

test('admin can sign in, order, upload slip, and confirm payment', async ({ page }) => {
  test.setTimeout(90_000);

  // --- sign in ---
  await page.goto('/sign-in');
  // Dismiss the PDPA cookie banner so it doesn't overlay buttons.
  const accept = page.getByRole('button', { name: 'ยอมรับทั้งหมด' });
  if (await accept.isVisible().catch(() => false)) await accept.click();
  await page.getByLabel('อีเมล').fill(ADMIN_EMAIL);
  await page.getByLabel('รหัสผ่าน').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
  await expect(page).toHaveURL(/\/account/);

  // --- add the test product to the cart ---
  await page.goto('/product/e2e-test-amulet');
  await page.getByRole('button', { name: 'เพิ่มลงตะกร้า' }).click();

  // --- checkout ---
  await page.goto('/checkout');
  await page.getByLabel('ชื่อผู้รับ').fill('ผู้ทดสอบ');
  await page.getByLabel('เบอร์โทร').fill('0800000000');
  await page.getByLabel('ที่อยู่ (บ้านเลขที่ ถนน)').fill('1/1 หมู่ 1');
  await page.getByLabel('ตำบล/แขวง').fill('ในเมือง');
  await page.getByLabel('อำเภอ/เขต').fill('เมือง');
  await page.getByLabel('จังหวัด').fill('กรุงเทพมหานคร');
  await page.getByLabel('รหัสไปรษณีย์').fill('10000');
  await page.getByRole('button', { name: 'ยืนยันคำสั่งซื้อ' }).click();

  // --- on the order page ---
  await expect(page).toHaveURL(/\/account\/orders\//);
  const orderUrl = page.url();
  const heading = await page.getByRole('heading', { level: 1 }).textContent();
  const orderNo = heading?.replace(/[^A-Z0-9]/g, '').replace(/^.*?(SK\w+)$/, '$1') ?? '';
  expect(orderNo).toMatch(/^SK/);

  // --- upload a slip ---
  await page.locator('input[type="file"]').setInputFiles({
    name: 'slip.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    ),
  });
  await page.getByRole('button', { name: 'ส่งสลิปให้ตรวจสอบ' }).click();
  await expect(page.getByText('รอแอดมินตรวจสอบ')).toBeVisible();

  // --- admin confirms the slip ---
  await page.goto('/admin/payments');
  const row = page.locator('li', { hasText: orderNo });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'ยืนยัน' }).click();

  // --- order becomes PAID (poll the order page; reloads each attempt) ---
  await expect
    .poll(
      async () => {
        await page.goto(orderUrl);
        return page.getByText('ยืนยันการชำระเงินเรียบร้อยแล้ว').isVisible();
      },
      { timeout: 40_000, intervals: [1500, 2500, 4000] },
    )
    .toBe(true);
});
