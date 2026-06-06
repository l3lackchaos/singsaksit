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
- [x] Playwright e2e setup (smoke suite, 5 tests)
- [x] CI: lint + typecheck + test (GitHub Actions)

## Phase 1 — Auth & Membership 🚧
- [x] Supabase Auth: email/password + email verification (signup → confirm link)
- [x] OAuth Google + Facebook (ปุ่ม + callback) — รอตั้ง provider id/secret ใน dashboard
- [x] หน้า sign-in/sign-up/forgot-password + /auth/callback
- [x] โปรไฟล์ (ดู/แก้ ชื่อ/เบอร์) + dashboard บัญชี
- [x] **Wishlist/รายการโปรด** + ปุ่มหัวใจบนหน้าสินค้า + หน้ารายการโปรด
- [x] RBAC middleware (ป้องกัน /account, /admin) + RLS owner policies
- [x] หน้าตั้งรหัสผ่านใหม่หลังคลิกลิงก์ reset
- [ ] จัดการที่อยู่จัดส่ง (ตำบล/อำเภอ/จังหวัด) — ทำในเฟส checkout
- [x] Rate limit login/reset — ใช้การจำกัดของ Supabase Auth (เสริม Upstash ภายหลัง)

## Phase 2 — Catalog & Storefront 🚧
- [x] Prisma model: Category, Product (slug + stock), ProductImage
- [x] route `/product/:slug` + repository (Supabase, RLS public read)
- [x] แสดง stock / ป้ายเหลือน้อย / ซ่อนสินค้าหมด — ควบคุมด้วย GlobalSetting (DB-driven)
- [x] หน้าแรก + hero, หน้าแคตตาล็อก, หน้าสินค้า (RSC + SEO metadata + JSON-LD) + skeleton
- [x] ค้นหา (trgm) + กรองหมวด + เรียงราคา/ใหม่ล่าสุด
- [x] auto-slug จาก title ตอนสร้างใน admin (กัน duplicate)
- [x] อัปโหลด+optimize รูปสินค้า (Supabase Storage + next/image)
- [ ] Cache catalog ด้วย cache tags + Redis (รอ Upstash)
- [x] **Reviews**: ให้คะแนน/รีวิว (เฉพาะผู้ซื้อ, RPC) + คะแนนเฉลี่ย + AggregateRating + moderation

## Phase 3 — Cart, Checkout & Orders ✅🚧
- [x] Cart (localStorage) + หน้า cart + checkout
- [x] สร้าง Order + OrderItem (snapshot ราคา) ผ่าน RPC `create_order` (ราคาคิดฝั่ง DB)
- [x] order history (/account/orders) + order detail
- [x] **Coupon** engine (PERCENT/FIXED/FREE_SHIPPING) + ใช้ใน create_order; ค่าจัดส่ง/ส่งฟรี
- [x] State machine + ตัดสต็อก atomic กัน oversell (ทดสอบจริงผ่าน)
- [ ] บันทึก CouponRedemption + per-user limit
- [x] Scheduled job: auto-cancel ออร์เดอร์ที่เลย `payment.expiryHours` (pg_cron)

## Phase 4 — Payments (Admin Confirm) ★ หัวใจ ✅🚧
- [x] สร้าง PromptPay QR ตามยอด + แสดงเลขบัญชีธนาคาร (จาก GlobalSetting)
- [x] อัปโหลดสลิป (private bucket + signed URL) → Payment `PENDING_REVIEW`
- [x] คิวตรวจสลิปของ admin (realtime): ยืนยัน/ปฏิเสธ + เหตุผล
- [x] ยืนยัน → ตัดสต็อก atomic + Order `PAID` (RPC `confirm_payment`)
- [x] คืนเงิน (refund) manual → `REFUNDED` + คืนสต็อก (RPC `refund_order` + ปุ่มแอดมิน)
- [ ] AuditLog + อีเมลแจ้งทุกสถานะการจ่ายเงิน (ต้องตั้ง Resend)

## Phase 5 — Shipping & Realtime ✅
- [x] Shipment + carrier/trackingNo (RPC `ship_order`), อัปเดตสถานะส่ง
- [x] Realtime: ลูกค้าเห็นสถานะ order/payment/shipment สด ๆ (Supabase Realtime)
- [x] Realtime: คิวตรวจสลิปฝั่ง admin อัปเดตสด

## Phase 6 — Admin / CMS 🚧
- [x] Admin layout (RBAC) + dashboard (คิวรอตรวจ/ออร์เดอร์/สินค้า/สมาชิก)
- [x] จัดการสินค้า: list + create/edit (auto-slug, ราคา/สต็อก/สถานะ)
- [x] คิวตรวจสลิป + ยืนยัน/ปฏิเสธ + จัดส่ง (ship)
- [x] หน้า **Global Settings** (ชื่อร้าน, แสดงสต็อก, ธีม, PromptPay, ค่าส่ง, feature flags)
- [x] CMS: หน้า (sanitized) + แบนเนอร์หน้าแรก
- [x] จัดการ Coupon + Moderation รีวิว
- [x] จัดการ EmailTemplate + จัดการ role (ผ่าน UI) + AuditLog + รูปสินค้า

## Phase 7 — Marketing, SEO & Analytics ✅🚧
- [x] **auto sitemap.xml** (จากสินค้าใน DB) + robots.txt (noindex หน้า private) + JSON-LD Product/Offer
- [x] **PDPA**: cookie consent banner (gate GA/GTM/Pixel), ConsentLog, หน้านโยบาย
- [x] GA4 + GTM + Meta Pixel โหลดเฉพาะเมื่อ consent (IDs จาก env)
- [x] ระบบย่อลิงก์ `/s/:code` (Postgres canonical + RPC นับคลิก) + จัดการในแอดมิน
- [ ] เพิ่ม Category/CmsPage ใน sitemap + JSON-LD Breadcrumb/Organization
- [ ] e-commerce events (purchase ฯลฯ) + counter cache บน Redis

## Phase 8 — Hardening, PWA & Launch 🚧
- [x] **PWA**: manifest + service worker (SWR แคช หน้า public, online-only สำหรับ checkout/admin/auth)
- [x] data retention job ลบสลิปเกินกำหนด (pg_cron `purge_expired_slips`)
- [ ] **Error monitoring** (Sentry) — รอ DSN
- [ ] Rate limit / Redis cache (Upstash) — รอ creds
- [x] เทส e2e smoke (home, catalog, product, auth guard, robots/sitemap)
- [ ] เทส e2e flow เต็ม (checkout → จ่าย → ยืนยัน → ส่ง) ด้วยผู้ใช้จริง
- [ ] ตรวจ a11y (WCAG 2.1 AA) + Lighthouse ≥ 90
- [ ] ตรวจ RLS/permission ครบ, rate limit จุดสำคัญ
- [ ] ตั้งค่า production (Vercel + Supabase), โดเมน, monitoring
- [ ] เอกสารใช้งานหลังบ้านสำหรับ admin (non-programmer)

## Cross-cutting (ทำควบทุกเฟส)
- a11y + light/dark, validation (Zod), cache invalidation, AuditLog,
  error/empty/loading states, mobile-responsive, sanitize rich text (กัน XSS)
