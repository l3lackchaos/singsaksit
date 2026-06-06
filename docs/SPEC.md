# Spec — ข้อกำหนดเชิงฟังก์ชันและเทคนิค

อ้างอิงขอบเขตจาก `SCOPE.md` และเทคโนโลยีจาก `TECH-STACK.md` เอกสารนี้ลงรายละเอียด
data model, state machine, และ flow สำคัญ

## 1. Data model (หลัก)

ตารางหลักใน Postgres (ชื่อ entity — รายละเอียด field กำหนดตอนทำ Prisma schema):

- **User** — id, email, name, phone, role (`CUSTOMER|STAFF|ADMIN`), authProvider, createdAt
  - ผูกกับ Supabase `auth.users`; โปรไฟล์เสริมเก็บในตาราง `profiles`
- **Address** — userId, recipient, phone, line1, district, province, postalCode, isDefault
- **Category** — id, slug, name, parentId (รองรับหมวดย่อย)
- **Product** — id, **slug** (unique, ใช้ใน URL `/product/:slug` + SEO), title,
  description (rich), price (satang), **stock** (จำนวนคงเหลือ, ใช้คุม oversell),
  lowStockThreshold, status (`DRAFT|ACTIVE|SOLD_OUT|ARCHIVED`), categoryId,
  attributes (วัด/รุ่น/ปี/เนื้อ/ขนาด), seoTitle, seoDescription
  - `slug` สร้างอัตโนมัติจาก title (กัน duplicate ด้วย suffix) แต่ admin แก้เองได้
  - `stock` ลดเมื่อ Payment → `PAID`; ถึง 0 → `SOLD_OUT` อัตโนมัติ
- **ProductImage** — productId, storagePath, alt, sortOrder
- **Cart / CartItem** — ผูก user หรือ session, productId, qty, unitPrice snapshot
- **Order** — id, orderNo, userId, status, subtotal, shippingFee, discount, total (satang),
  shippingAddress snapshot, createdAt
- **OrderItem** — orderId, productId, title/price snapshot, qty
- **Payment** — orderId, method (`PROMPTPAY|BANK_TRANSFER`), amount, status, slipPath,
  paidAt (ลูกค้าแจ้ง), reviewedBy, reviewedAt, rejectReason
- **Shipment** — orderId, carrier, trackingNo, status, shippedAt, deliveredAt
- **Voucher** (ระบบส่วนลด) — code, type (`PERCENT|FIXED|FREE_SHIPPING`), value,
  minTotal, maxDiscount, startsAt, expiresAt, usageLimit (รวม), perUserLimit,
  usedCount, active, scope (`ALL|CATEGORY|PRODUCT` + ref) — admin สร้าง/จัดการได้เอง
- **VoucherRedemption** — voucherId, userId, orderId, amount, redeemedAt (กันใช้เกินสิทธิ์)
- **GlobalSetting** — key, value (JSON), group, label (key-value config ที่ admin แก้ได้,
  คุมพฤติกรรมทั้งระบบ — ดู §6)
- **CmsPage / Banner** — slug/title/body (rich), published, sortOrder (admin จัดการ)
- **EmailTemplate** — key, subject, body (React Email / MJML-like), variables, updatedAt
- **ShortLink** — code, targetUrl, clicks, createdBy, createdAt
- **AuditLog** — actorId, action, entity, entityId, meta, createdAt (สำหรับงาน admin สำคัญ)

> เงินเก็บเป็น integer **satang** เสมอ (1 บาท = 100 สตางค์)

## 2. State machines (หัวใจของระบบ)

### Order.status
`PENDING_PAYMENT → AWAITING_CONFIRMATION → PAID → PROCESSING → SHIPPED → DELIVERED`
สาขาเสริม: `CANCELLED`, `REFUNDED`

### Payment.status
`PENDING → PENDING_REVIEW → PAID` หรือ `REJECTED`
- `PENDING`: สร้างออร์เดอร์แล้ว ยังไม่อัปสลิป
- `PENDING_REVIEW`: ลูกค้าอัปสลิปแล้ว เข้าคิว admin
- `PAID`: admin ยืนยัน → ดัน Order เป็น `PAID` → ปลดล็อก fulfillment + ตัดสต็อก + ส่งอีเมล
- `REJECTED`: admin ปฏิเสธ (สลิปไม่ถูกต้อง) → แจ้งลูกค้าให้อัปใหม่ → กลับ `PENDING`

### Shipment.status
`PREPARING → SHIPPED → IN_TRANSIT → DELIVERED` (อัปเดตโดย staff/admin, ลูกค้าเห็น realtime)

**กฎสำคัญ:** ห้ามเปลี่ยน status ข้ามขั้นโดยไม่ผ่าน transition ที่กำหนด และการตัดสต็อก
เกิด ณ ตอน Payment → `PAID` เท่านั้น (ไม่ใช่ตอนสร้างออร์เดอร์) เพื่อกัน oversell จาก
ออร์เดอร์ที่ไม่จ่าย

## 3. Flow สำคัญ

### Checkout → Payment → Confirm
1. ลูกค้า checkout → สร้าง `Order` (`PENDING_PAYMENT`) + `Payment` (`PENDING`)
2. เลือกวิธีจ่าย:
   - **PromptPay**: ระบบสร้าง QR จาก `PROMPTPAY_ID` + ยอด `total` (promptpay-qr)
   - **Bank transfer**: แสดงเลขบัญชีร้าน
3. ลูกค้าโอน แล้วอัปโหลดสลิป → `Payment.status = PENDING_REVIEW`,
   `Order.status = AWAITING_CONFIRMATION` → ส่งอีเมล "ได้รับแจ้งชำระเงิน"
4. Admin เปิดคิวตรวจสลิป → ยืนยัน/ปฏิเสธ
   - ยืนยัน: ตัดสต็อก, `Payment=PAID`, `Order=PAID`, อีเมลยืนยัน, broadcast realtime
   - ปฏิเสธ: `Payment=REJECTED` + เหตุผล, อีเมลแจ้งลูกค้า
5. Admin/staff จัดส่ง → กรอก carrier + trackingNo → `Shipment=SHIPPED`, `Order=SHIPPED`
6. ลูกค้าเห็นทุกสถานะแบบ realtime ในหน้า order detail

### Auth
- Email/password + OAuth Google + Facebook ผ่าน Supabase Auth
- หลัง sign-up สร้าง row ใน `profiles` อัตโนมัติ (DB trigger)
- Role default = `CUSTOMER`; เลื่อนเป็น admin ทำผ่าน DB/หลังบ้านเท่านั้น

## 4. ข้อกำหนดเชิงเทคนิคต่อฟีเจอร์

- **Realtime**: subscribe การเปลี่ยนแปลงของ `orders`, `payments`, `shipments`
  เฉพาะ row ของผู้ใช้นั้น (ผ่าน RLS) — ฝั่ง admin subscribe คิวตรวจสลิป
- **Cache**: หน้า/แคตตาล็อก/หน้า CMS cache ด้วย Next.js cache tags + Redis;
  mutation จากหลังบ้านต้อง `revalidateTag` ที่เกี่ยวข้อง
- **Image optimize**: อัปโหลดเข้า Supabase Storage, เสิร์ฟผ่าน `next/image` +
  transformation (resize, WebP/AVIF), มี `alt` ทุกภาพ (a11y + SEO)
- **SEO**: Metadata API ต่อหน้า, OpenGraph/Twitter card, `sitemap.xml`, `robots.txt`,
  JSON-LD (`Product`, `Offer`, `BreadcrumbList`, `Organization`)
- **Tracking/Ads**: GTM container + GA4 + Meta Pixel; ยิง event
  `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
- **Email templates**: เก็บใน `EmailTemplate` (admin แก้ได้), render ด้วย React Email,
  ส่งผ่าน Resend; ตัวแปร เช่น `{{orderNo}}`, `{{total}}`, `{{trackingNo}}`
- **Short links**: `/s/:code` → 302 ไป targetUrl, นับ `clicks`; admin สร้าง/ดูสถิติได้
- **A11y**: WCAG 2.1 AA — keyboard navigable, focus visible, ARIA ถูกต้อง,
  contrast ผ่านทั้ง light/dark, รองรับ reduced-motion
- **Validation**: ทุก input ตรวจด้วย Zod ทั้ง client และ server

## 5. Non-functional

- Performance: Lighthouse ≥ 90 (Perf/SEO/A11y) บนหน้า storefront หลัก
- Security: RLS เป็น boundary หลัก, server-side role check, สลิปเข้าถึงได้เฉพาะเจ้าของ+admin
- Observability: AuditLog สำหรับ action admin สำคัญ (ยืนยัน/ปฏิเสธเงิน, แก้ราคา, เปลี่ยน role)

## 6. Global Settings (ตั้งค่าได้ทั้งระบบจากหลังบ้าน)

`GlobalSetting` เป็น key-value (value เป็น JSON) ที่ admin แก้ได้จากหน้าตั้งค่า โดย
**ไม่ต้องแก้โค้ด** ค่าเหล่านี้ถูก cache และ revalidate เมื่อ admin บันทึก ตัวอย่าง key:

| Key | ความหมาย |
|---|---|
| `display.showStock` | แสดงจำนวนสต็อกบนหน้าสินค้าหรือไม่ (boolean) |
| `display.showOutOfStock` | แสดงสินค้าที่หมดสต็อกหรือซ่อน |
| `display.lowStockBadge` | แสดงป้าย "เหลือน้อย" เมื่อต่ำกว่า threshold |
| `theme.default` | ธีมเริ่มต้น (`light|dark|system`) |
| `theme.allowUserToggle` | ให้ผู้ใช้สลับธีมได้หรือไม่ |
| `theme.brandColor` | สีหลักของแบรนด์ (ปรับ design token) |
| `store.name`, `store.logo`, `store.contact` | ข้อมูลร้าน |
| `payment.promptpayId`, `payment.bankAccounts` | ช่องทางรับเงิน |
| `shipping.fee`, `shipping.freeOver` | ค่าจัดส่ง/เกณฑ์ส่งฟรี |
| `seo.defaultTitle`, `seo.defaultDescription`, `seo.ogImage` | ค่า SEO เริ่มต้น |
| `analytics.gaId`, `analytics.gtmId`, `analytics.metaPixelId` | tracking IDs |
| `feature.vouchersEnabled`, `feature.maintenanceMode` | เปิด/ปิดฟีเจอร์ |

**กฎ:** โค้ดที่มีพฤติกรรมต่างกันตามการตั้งค่า ต้องอ่านจาก `GlobalSetting` เสมอ
ห้าม hard-code ค่าที่ admin ควรปรับได้ มี typed accessor (`getSetting('display.showStock')`)
พร้อม default ปลอดภัย

## 7. UI/UX requirements

- **Skeleton loading** — ทุกส่วนที่โหลดข้อมูล (แคตตาล็อก, หน้าสินค้า, ออร์เดอร์,
  dashboard, คิวสลิป) ต้องมี skeleton placeholder ใช้ `loading.tsx` (Suspense) ของ
  App Router + skeleton component ของ shadcn/ui — ห้ามหน้าจอกระตุก/ว่างเปล่าระหว่างโหลด
- **Theme switching** — light/dark/system ผ่าน `next-themes`, ไม่มี flash on load,
  จำค่าของผู้ใช้; ค่าเริ่มต้น + การอนุญาตสลับ มาจาก `GlobalSetting` (`theme.*`)
- **Empty / error states** — ทุก list/หน้า ต้องมีสถานะว่างและ error ที่ชัดเจน
- **Optimistic + realtime** — ปุ่ม action สำคัญแสดงผลทันที แล้ว reconcile กับ realtime

## 8. Auto sitemap

- `sitemap.xml` สร้างอัตโนมัติจากข้อมูลจริงใน DB (ผ่าน `app/sitemap.ts` ของ Next.js)
  ครอบคลุม: หน้า static, ทุก Product `ACTIVE` (ตาม slug), ทุก Category, ทุก CmsPage `published`
- อัปเดต `lastModified` จาก `updatedAt`, ใส่ `changeFrequency`/`priority` ตามชนิดหน้า
- ถ้า URL เยอะให้แบ่งเป็น sitemap index; cache + revalidate เมื่อมีการเพิ่ม/แก้สินค้า/หน้า
- `robots.txt` ชี้มาที่ sitemap; ซ่อนสินค้า `DRAFT/ARCHIVED` ออกจาก sitemap
