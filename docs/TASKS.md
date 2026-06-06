# Tasks — แผนงานเป็นเฟส (Delivery roadmap)

ลำดับงานสำหรับสร้างเว็บไซต์ขายพระเครื่องให้ครบตาม `SCOPE.md` แต่ละเฟสควรจบแบบ
ใช้งานได้จริง (shippable) ทำเครื่องหมาย `[x]` เมื่อเสร็จ

## Phase 0 — Foundation ✅
- [x] Scaffold Next.js (App Router) + TypeScript + pnpm
- [x] ตั้งค่า Tailwind + shadcn-style UI + next-themes (light/dark/system)
- [x] ตั้งค่า ESLint/Prettier, Vitest, `.env.example`
- [x] Prisma schema เต็ม (data model ตาม SPEC §1) + generate client
- [x] Layout หลัก + design tokens + a11y baseline (skip link, focus styles)
- [x] **Theme switcher** (light/dark/system) ไม่มี flash on load
- [x] **Skeleton components** + แบบแผน `loading.tsx` (Suspense)
- [x] **GlobalSetting** typed accessor + unit test
- [x] เชื่อม Supabase จริง (project `singsaksit`, anon client) + apply schema + RLS + seed
- [ ] Playwright e2e setup
- [ ] CI: lint + typecheck + test

## Phase 1 — Auth & Membership
- [ ] Supabase Auth: email/password + Google + Facebook OAuth + **ยืนยันอีเมล**
- [ ] Trigger สร้าง `profiles` หลัง sign-up, role default = CUSTOMER
- [ ] หน้า sign-in/sign-up/reset, โปรไฟล์, จัดการที่อยู่จัดส่ง (ตำบล/อำเภอ/จังหวัด)
- [ ] **Wishlist/รายการโปรด** + ปุ่มหัวใจบนการ์ดสินค้า
- [ ] RBAC middleware + RLS policies (เจ้าของข้อมูลเท่านั้น / admin)
- [ ] Rate limit login/reset (Upstash)

## Phase 2 — Catalog & Storefront 🚧
- [x] Prisma model: Category, Product (slug + stock), ProductImage
- [x] route `/product/:slug` + repository (Supabase, RLS public read)
- [x] แสดง stock / ป้ายเหลือน้อย / ซ่อนสินค้าหมด — ควบคุมด้วย GlobalSetting (DB-driven)
- [x] หน้าแรก + hero, หน้าแคตตาล็อก, หน้าสินค้า (RSC + SEO metadata + JSON-LD) + skeleton
- [x] ค้นหาเบื้องต้น (ilike) — อัปเกรดเป็น Postgres full-text ไทยภายหลัง
- [ ] auto-slug จาก title ตอนสร้างใน admin (กัน duplicate)
- [ ] อัปโหลด+optimize รูปสินค้า (Supabase Storage + next/image)
- [ ] Cache catalog ด้วย cache tags + Redis
- [ ] **Reviews**: ให้คะแนน/รีวิว (เฉพาะผู้ซื้อ) + แสดงคะแนนเฉลี่ย + AggregateRating

## Phase 3 — Cart, Checkout & Orders
- [ ] Cart/CartItem, หน้า cart, checkout
- [ ] สร้าง Order + OrderItem (snapshot ราคา), order history/detail
- [ ] **Coupon/ส่วนลด** (PERCENT/FIXED/FREE_SHIPPING) + จำกัดสิทธิ์ + redemption, ค่าจัดส่ง
- [ ] State machine ของ Order (ดู SPEC §2) + ตัดสต็อก atomic กัน oversell
- [ ] Scheduled job: auto-cancel ออร์เดอร์ที่เลย `payment.expiryHours`

## Phase 4 — Payments (Admin Confirm) ★ หัวใจ
- [ ] สร้าง PromptPay QR ตามยอด + แสดงเลขบัญชีธนาคาร
- [ ] อัปโหลดสลิป → Payment `PENDING_REVIEW`
- [ ] คิวตรวจสลิปของ admin: ยืนยัน/ปฏิเสธ + เหตุผล
- [ ] ยืนยัน → ตัดสต็อก + Order `PAID` + AuditLog
- [ ] คืนเงิน (refund) manual → `REFUNDED` + คืนสต็อก + AuditLog
- [ ] อีเมลแจ้งทุกสถานะการจ่ายเงิน

## Phase 5 — Shipping & Realtime
- [ ] Shipment + carrier/trackingNo, อัปเดตสถานะส่ง
- [ ] Realtime: ลูกค้าเห็นสถานะ order/payment/shipment สด ๆ
- [ ] Realtime: คิวตรวจสลิปฝั่ง admin อัปเดตสด

## Phase 6 — Admin / CMS
- [ ] Admin dashboard (ยอดขาย, ออร์เดอร์, คิวงาน)
- [ ] จัดการสินค้า/หมวดหมู่/สต็อก
- [ ] CMS: หน้า, แบนเนอร์, เนื้อหา hero
- [ ] จัดการ EmailTemplate (แก้ subject/body/ตัวแปร)
- [ ] จัดการ Coupon (สร้าง/แก้/ดูการใช้งาน)
- [ ] หน้า **Global Settings** (แสดงสต็อก, ธีม, จ่ายเงิน, จัดส่ง, SEO, feature flags)
- [ ] Moderation รีวิว (อนุมัติ/ปฏิเสธ)
- [ ] จัดการผู้ใช้/role, ตั้งค่าร้าน

## Phase 7 — Marketing, SEO & Analytics
- [x] **auto sitemap.xml** (จากสินค้าใน DB) + robots.txt (noindex หน้า private) + JSON-LD Product/Offer
- [ ] เพิ่ม Category/CmsPage ใน sitemap + JSON-LD Breadcrumb/Organization
- [ ] **PDPA**: cookie consent banner (gate GA/Pixel), ConsentLog, หน้านโยบาย, สิทธิเจ้าของข้อมูล
- [ ] GTM + GA4 + Meta Pixel + e-commerce events (purchase ฯลฯ) — โหลดตาม consent
- [ ] ระบบย่อลิงก์ `/s/:code` (Postgres canonical + Redis cache/counter) + สถิติคลิก
- [ ] หน้าโปรโมชัน/แคมเปญ (ใช้ Coupon + short links)

## Phase 8 — Hardening, PWA & Launch
- [ ] **PWA**: manifest + service worker (แคช catalog, ออฟไลน์ fallback, online-only checkout)
- [ ] **Error monitoring** (Sentry) client/server + data retention job (ลบสลิปเกินกำหนด)
- [ ] เทส e2e flow หลัก (checkout → จ่าย → ยืนยัน → ส่ง)
- [ ] ตรวจ a11y (WCAG 2.1 AA) + Lighthouse ≥ 90
- [ ] ตรวจ RLS/permission ครบ, rate limit จุดสำคัญ
- [ ] ตั้งค่า production (Vercel + Supabase), โดเมน, monitoring
- [ ] เอกสารใช้งานหลังบ้านสำหรับ admin (non-programmer)

## Cross-cutting (ทำควบทุกเฟส)
- a11y + light/dark, validation (Zod), cache invalidation, AuditLog,
  error/empty/loading states, mobile-responsive, sanitize rich text (กัน XSS)
