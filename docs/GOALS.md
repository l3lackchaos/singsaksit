# Goals — เป้าหมายการสร้างระบบจนเสร็จ + การตรวจสอบ

เอกสารนี้นิยาม "เสร็จ" (Definition of Done) และ **วิธีตรวจสอบ (verification)** ของการ
สร้างเว็บไซต์สิ่งศักดิ์สิทธิ์ให้ครบตาม `SCOPE.md` / `SPEC.md` / `TASKS.md` ใช้เป็น checklist
ปิดงานในแต่ละเฟส — ทำเครื่องหมาย `[x]` เมื่อผ่านการตรวจสอบจริง (ไม่ใช่แค่เขียนโค้ดเสร็จ)

## เป้าหมายรวม (North star)

ลูกค้าซื้อพระเครื่องได้ครบ flow: เลือกสินค้า → checkout → จ่ายผ่าน PromptPay/โอน →
อัปสลิป → admin ยืนยัน → ตัดสต็อก → ติดตามการจัดส่งแบบ realtime; และ admin จัดการ
ทุกอย่าง (สินค้า/เนื้อหา/อีเมล/คูปอง/ตั้งค่า) ได้เองโดยไม่ต้องมีโปรแกรมเมอร์ ผ่านมาตรฐาน
a11y/SEO/Performance และสอดคล้อง PDPA

## เกณฑ์คุณภาพรวม (Global gates — ต้องผ่านทุกเฟส)

- `pnpm typecheck` ผ่าน (0 error)
- `pnpm lint` ผ่าน (0 error)
- `pnpm build` สำเร็จ
- `pnpm test` (unit/integration) ผ่าน
- ทุกหน้าโหลดข้อมูลมี skeleton + empty + error state
- ใช้งานได้ทั้ง light/dark และ keyboard-navigable

## Definition of Done ต่อเฟส + วิธีตรวจสอบ

### Phase 0 — Foundation ✅
**Done เมื่อ:** scaffold Next.js + Tailwind + shadcn + next-themes + Prisma + tooling พร้อม
- [x] `pnpm build` / `lint` / `typecheck` / `test` รันได้ (verified)
- [x] สลับ light/dark ได้ ไม่มี flash; design tokens + layout หลักทำงาน
- [x] Skeleton component + รูปแบบ `loading.tsx` ใช้ได้
- [x] `GlobalSetting` accessor + ทดสอบ unit (6 tests pass)
- **Verified:** typecheck ✓, lint ✓ (0 warnings), test ✓ (6/6), build ✓ (static pages)
  — DB-connected migration + Playwright รอเฟสที่ต่อ backend

### Phase 1 — Auth & Membership
**Done เมื่อ:** สมัคร/เข้าสู่ระบบ/ยืนยันอีเมล/โปรไฟล์/ที่อยู่/wishlist ใช้งานได้ + RBAC/RLS
- [ ] email/password + Google + Facebook + email verification
- [ ] โปรไฟล์ + ที่อยู่ (ตำบล/อำเภอ/จังหวัด) + wishlist
- [ ] guard `admin/*` ด้วย role; RLS policy เจ้าของข้อมูลเท่านั้น
- **Verify:** e2e — สมัคร→ยืนยัน→ล็อกอิน→แก้โปรไฟล์→เพิ่ม wishlist; ทดสอบ customer เข้าถึง
  ออร์เดอร์คนอื่นไม่ได้

### Phase 2 — Catalog & Storefront
**Done เมื่อ:** หน้าแรก/แคตตาล็อก/หน้าสินค้า/ค้นหา/รีวิว แสดงผล + cache + image optimize
- [ ] slug + stock + การแสดงสต็อกตาม GlobalSetting
- [ ] ค้นหา full-text ไทย + กรอง/เรียง (URL state)
- [ ] รูปผ่าน next/image + skeleton; รีวิว (อ่าน) + AggregateRating
- **Verify:** Lighthouse หน้าสินค้า Perf/SEO/A11y ≥ 90; เปลี่ยน `display.showStock` แล้ว UI ตามจริง

### Phase 3 — Cart, Checkout & Orders
**Done เมื่อ:** ตะกร้า→checkout→สร้างออร์เดอร์ (snapshot) + คูปอง + state machine + auto-cancel
- [ ] คูปอง PERCENT/FIXED/FREE_SHIPPING + จำกัดสิทธิ์
- [ ] ตัดสต็อก atomic; job auto-cancel เมื่อเลย `payment.expiryHours`
- **Verify:** unit ทดสอบ transition ที่ผิดถูกปฏิเสธ + คำนวณส่วนลด; e2e สร้างออร์เดอร์

### Phase 4 — Payments (Admin Confirm) ★
**Done เมื่อ:** สร้าง QR + อัปสลิป + คิวตรวจ + ยืนยัน/ปฏิเสธ/คืนเงิน + อีเมล
- [ ] PromptPay QR ตามยอด + เลขบัญชีจาก GlobalSetting
- [ ] ยืนยัน→ตัดสต็อก atomic→PAID; oversell ถูกปฏิเสธ; refund คืนสต็อก
- **Verify:** e2e — อัปสลิป→admin ยืนยัน→Order=PAID; ทดสอบ 2 สลิปชิ้นสุดท้าย oversell ไม่ผ่าน

### Phase 5 — Shipping & Realtime
**Done เมื่อ:** อัปเดตการจัดส่ง + ลูกค้าเห็นสถานะสดทุกชั้น
- [ ] Shipment + trackingNo; realtime order/payment/shipment + คิวสลิป admin
- **Verify:** เปิด 2 หน้าต่าง เปลี่ยนสถานะฝั่ง admin แล้วฝั่งลูกค้าอัปเดตทันทีโดยไม่ refresh

### Phase 6 — Admin / CMS
**Done เมื่อ:** admin จัดการสินค้า/CMS/อีเมล/คูปอง/รีวิว/ผู้ใช้/ตั้งค่า ได้เองครบ
- [ ] CRUD สินค้า/หมวด/หน้า CMS/แบนเนอร์/อีเมลเทมเพลต/คูปอง + moderation รีวิว
- [ ] หน้า Global Settings + จัดการ role
- **Verify:** ในฐานะ admin เพิ่มสินค้าใหม่+แก้ hero+แก้อีเมลเทมเพลต แล้วเห็นผลหน้าเว็บโดยไม่แตะโค้ด

### Phase 7 — Marketing, SEO & Analytics
**Done เมื่อ:** auto sitemap + JSON-LD + tracking (gate consent) + short links + PDPA
- [ ] sitemap.xml จาก DB + robots + noindex หน้า private
- [ ] GA4/GTM/Pixel โหลดตาม consent; ShortLink + สถิติคลิก
- [ ] cookie consent + ConsentLog + หน้านโยบาย
- **Verify:** `/sitemap.xml` มีสินค้าจริง; ปฏิเสธ consent แล้ว script tracking ไม่โหลด; `/s/:code` redirect + นับคลิก

### Phase 8 — Hardening, PWA & Launch
**Done เมื่อ:** PWA + monitoring + retention + เทสครบ + พร้อม deploy
- [ ] PWA ติดตั้งได้ + ออฟไลน์ fallback; Sentry; job ลบสลิปเกินกำหนด
- [ ] e2e flow หลักผ่าน; a11y + Lighthouse ≥ 90; rate limit จุดสำคัญ
- **Verify:** e2e suite เขียวทั้งชุด; Lighthouse PWA installable; ทดสอบ rate limit ทำงาน

## Final acceptance (ปิดโปรเจกต์)

- [ ] flow ซื้อ→จ่าย→ยืนยัน→ส่ง ครบจริง (e2e)
- [ ] admin จัดการเนื้อหา/สินค้า/อีเมลได้เองโดยไม่ต้องมีโปรแกรมเมอร์
- [ ] Lighthouse Perf/SEO/A11y ≥ 90 บนหน้าหลัก, PWA installable
- [ ] PDPA: consent gating + retention ทำงาน
- [ ] typecheck/lint/build/test เขียวทั้งหมด ใน CI
- [ ] อัปเดต `CLAUDE.md` "Commands" ให้เป็นคำสั่งจริงหลัง scaffold
