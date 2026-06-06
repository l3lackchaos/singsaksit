# Spec — ข้อกำหนดเชิงฟังก์ชันและเทคนิค

อ้างอิงขอบเขตจาก `SCOPE.md` และเทคโนโลยีจาก `TECH-STACK.md` เอกสารนี้ลงรายละเอียด
data model, state machine, และ flow สำคัญ

## 1. Data model (หลัก)

ตารางหลักใน Postgres (ชื่อ entity — รายละเอียด field กำหนดตอนทำ Prisma schema):

- **User** — id, email, name, phone, role (`CUSTOMER|STAFF|ADMIN`), authProvider, createdAt
  - ผูกกับ Supabase `auth.users`; โปรไฟล์เสริมเก็บในตาราง `profiles`
- **Address** — userId, recipient, phone, line1, district, province, postalCode, isDefault
- **Category** — id, slug, name, parentId (รองรับหมวดย่อย)
- **Product** — id, slug, title, description (rich), price (satang), stock, status
  (`DRAFT|ACTIVE|SOLD_OUT|ARCHIVED`), categoryId, attributes (วัด/รุ่น/ปี/เนื้อ/ขนาด),
  seoTitle, seoDescription
- **ProductImage** — productId, storagePath, alt, sortOrder
- **Cart / CartItem** — ผูก user หรือ session, productId, qty, unitPrice snapshot
- **Order** — id, orderNo, userId, status, subtotal, shippingFee, discount, total (satang),
  shippingAddress snapshot, createdAt
- **OrderItem** — orderId, productId, title/price snapshot, qty
- **Payment** — orderId, method (`PROMPTPAY|BANK_TRANSFER`), amount, status, slipPath,
  paidAt (ลูกค้าแจ้ง), reviewedBy, reviewedAt, rejectReason
- **Shipment** — orderId, carrier, trackingNo, status, shippedAt, deliveredAt
- **Coupon** — code, type (`PERCENT|FIXED`), value, minTotal, expiresAt, usageLimit
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
