# Tasks — แผนงานเป็นเฟส (Delivery roadmap)

ลำดับงานสำหรับสร้างเว็บไซต์ขายพระเครื่องให้ครบตาม `SCOPE.md` แต่ละเฟสควรจบแบบ
ใช้งานได้จริง (shippable) ทำเครื่องหมาย `[x]` เมื่อเสร็จ

## Phase 0 — Foundation
- [ ] Scaffold Next.js (App Router) + TypeScript + pnpm
- [ ] ตั้งค่า Tailwind + shadcn/ui + next-themes (light/dark/system)
- [ ] ตั้งค่า ESLint/Prettier, Vitest, Playwright, `.env.example`
- [ ] เชื่อม Supabase (project, client, service role) + Prisma + migration แรก
- [ ] Layout หลัก + design tokens + a11y baseline (skip link, focus styles)
- [ ] **Theme switcher** (light/dark/system) ไม่มี flash on load
- [ ] **Skeleton components** + แบบแผน `loading.tsx` (Suspense) ใช้ทั่วทั้งแอป
- [ ] **GlobalSetting** model + typed accessor + cache/revalidate
- [ ] CI: lint + typecheck + test

## Phase 1 — Auth & Membership
- [ ] Supabase Auth: email/password + Google + Facebook OAuth
- [ ] Trigger สร้าง `profiles` หลัง sign-up, role default = CUSTOMER
- [ ] หน้า sign-in/sign-up/reset, โปรไฟล์, จัดการที่อยู่จัดส่ง
- [ ] RBAC middleware + RLS policies (เจ้าของข้อมูลเท่านั้น / admin)

## Phase 2 — Catalog & Storefront
- [ ] Prisma model: Category, Product (slug + stock), ProductImage
- [ ] auto-slug จาก title (กัน duplicate) + แก้เองได้, route `/product/:slug`
- [ ] แสดง stock / ป้ายเหลือน้อย / ซ่อนสินค้าหมด — ควบคุมด้วย GlobalSetting
- [ ] หน้าแรก + hero, หน้าแคตตาล็อก, หน้าสินค้า (RSC + SEO metadata) + skeleton
- [ ] ค้นหา/กรอง/เรียงลำดับ
- [ ] อัปโหลด+optimize รูปสินค้า (Supabase Storage + next/image)
- [ ] Cache catalog ด้วย cache tags + Redis

## Phase 3 — Cart, Checkout & Orders
- [ ] Cart/CartItem, หน้า cart, checkout
- [ ] สร้าง Order + OrderItem (snapshot ราคา), order history/detail
- [ ] **Voucher/ส่วนลด** (PERCENT/FIXED/FREE_SHIPPING) + จำกัดสิทธิ์ + redemption, ค่าจัดส่ง
- [ ] State machine ของ Order (ดู SPEC §2)

## Phase 4 — Payments (Admin Confirm) ★ หัวใจ
- [ ] สร้าง PromptPay QR ตามยอด + แสดงเลขบัญชีธนาคาร
- [ ] อัปโหลดสลิป → Payment `PENDING_REVIEW`
- [ ] คิวตรวจสลิปของ admin: ยืนยัน/ปฏิเสธ + เหตุผล
- [ ] ยืนยัน → ตัดสต็อก + Order `PAID` + AuditLog
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
- [ ] จัดการ Voucher (สร้าง/แก้/ดูการใช้งาน)
- [ ] หน้า **Global Settings** (แสดงสต็อก, ธีม, จ่ายเงิน, จัดส่ง, SEO, feature flags)
- [ ] จัดการผู้ใช้/role, ตั้งค่าร้าน

## Phase 7 — Marketing, SEO & Analytics
- [ ] **auto sitemap.xml** (จากสินค้า/หมวด/หน้า CMS ใน DB) + robots.txt, JSON-LD
      (Product/Offer/Breadcrumb/Organization)
- [ ] GTM + GA4 + Meta Pixel + e-commerce events (purchase ฯลฯ)
- [ ] ระบบย่อลิงก์ `/s/:code` + สถิติคลิก
- [ ] โปรโมชัน/คูปอง หน้า marketing

## Phase 8 — Hardening & Launch
- [ ] เทส e2e flow หลัก (checkout → จ่าย → ยืนยัน → ส่ง)
- [ ] ตรวจ a11y (WCAG 2.1 AA) + Lighthouse ≥ 90
- [ ] ตรวจ RLS/permission ครบ, rate limit จุดสำคัญ
- [ ] ตั้งค่า production (Vercel + Supabase), โดเมน, monitoring
- [ ] เอกสารใช้งานหลังบ้านสำหรับ admin (non-programmer)

## Cross-cutting (ทำควบทุกเฟส)
- a11y + light/dark, validation (Zod), cache invalidation, AuditLog,
  error/empty/loading states, mobile-responsive
