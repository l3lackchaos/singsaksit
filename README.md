# สิงห์ศักดิ์สิทธิ์ — เว็บไซต์ขายพระเครื่อง (Amulet E-commerce)

แพลตฟอร์ม e-commerce เต็มรูปแบบสำหรับขายพระเครื่อง (Thai amulets) ดีไซน์ UX/UI สมัยใหม่
รองรับระบบสมาชิก, การจ่ายเงินแบบ **Admin Confirm** (PromptPay QR / โอนธนาคาร + อัปโหลดสลิป),
ติดตามสถานะคำสั่งซื้อแบบ **realtime**, และระบบหลังบ้าน/CMS ที่ admin จัดการได้เองโดยไม่ต้องมี
โปรแกรมเมอร์

> **สถานะ:** อยู่ระหว่างวางแผน (greenfield) — ปัจจุบันมีเฉพาะเอกสารออกแบบใน `docs/`
> ยังไม่ได้ scaffold โค้ดแอป

## ✨ ฟีเจอร์หลัก

- 🛍️ **ร้านค้า** — แคตตาล็อก, ค้นหา/กรอง, หน้าสินค้า (มี slug), ตะกร้า, checkout
- 👤 **สมาชิก** — สมัคร/เข้าสู่ระบบด้วย email/password, **Google**, **Facebook**
- 💳 **จ่ายเงินแบบ Admin Confirm** — PromptPay QR หรือโอนธนาคาร → อัปโหลดสลิป →
  admin ตรวจสอบและยืนยัน
- 📦 **ติดตามสถานะ realtime** — สถานะการจ่ายเงินและการจัดส่งอัปเดตสดถึงลูกค้า
- 🎟️ **ระบบ Voucher** — ส่วนลดแบบเปอร์เซ็นต์ / จำนวนเงิน / ส่งฟรี พร้อมจำกัดสิทธิ์การใช้
- 🗂️ **สต็อกสินค้า** — ตัดสต็อกอัตโนมัติเมื่อยืนยันการชำระเงิน, กัน oversell
- 🛠️ **Admin / CMS** — จัดการสินค้า, เนื้อหา, แบนเนอร์, อีเมลเทมเพลต, ผู้ใช้ ได้เอง
- ⚙️ **Global Settings** — ตั้งค่าทั้งระบบจากหลังบ้าน เช่น แสดง/ซ่อนสต็อก, ธีม, ค่าจัดส่ง
- 🌗 **Light / Dark mode** + ♿ **a11y** (WCAG 2.1 AA) + 💀 **skeleton loading**
- 🔎 **SEO** — auto `sitemap.xml`, robots, JSON-LD, OpenGraph
- 📈 **Tracking / Ads** — GA4, Google Tag Manager, Meta Pixel
- 🚀 **Platform** — cache system, image optimization, ระบบย่อลิงก์, email templates

## 🧱 Tech stack (สรุป)

| ด้าน | เทคโนโลยี |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui (Radix) + next-themes |
| Data | Supabase (Postgres, Auth, Realtime, Storage) + Prisma |
| Cache / Links | Upstash Redis |
| Email | Resend + React Email |
| Payment | PromptPay QR (promptpay-qr) — Admin Confirm |
| Analytics | GA4 + GTM + Meta Pixel |
| Test | Vitest + Playwright |

ดูเหตุผลการเลือกแบบเต็มที่ [`docs/TECH-STACK.md`](docs/TECH-STACK.md)

## 📚 เอกสารโครงการ

| ไฟล์ | เนื้อหา |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | คู่มือสถาปัตยกรรม + ข้อตกลงสำหรับการพัฒนา |
| [`docs/SCOPE.md`](docs/SCOPE.md) | ขอบเขต, บทบาทผู้ใช้, โมดูล |
| [`docs/SPEC.md`](docs/SPEC.md) | data model, state machine, flow, global settings, sitemap |
| [`docs/TASKS.md`](docs/TASKS.md) | แผนงานเป็นเฟส (roadmap) |
| [`docs/DESIGN-PATTERNS.md`](docs/DESIGN-PATTERNS.md) | สถาปัตยกรรมโค้ด + design pattern |
| [`docs/UX-UI-DESIGN.md`](docs/UX-UI-DESIGN.md) | ระบบดีไซน์ + UX/UI pattern ต่อหน้า |
| [`docs/TECH-STACK.md`](docs/TECH-STACK.md) | เทคโนโลยีที่ใช้ + เหตุผล |

## 🚀 เริ่มต้นใช้งาน (หลัง scaffold)

> คำสั่งด้านล่างเป็นค่าที่คาดไว้ — จะใช้งานได้หลังจาก scaffold โปรเจกต์ Next.js แล้ว

```bash
# 1) ติดตั้ง dependencies
pnpm install

# 2) ตั้งค่า environment (ดูตัวแปรใน docs/TECH-STACK.md)
cp .env.example .env.local

# 3) เตรียมฐานข้อมูล
pnpm prisma migrate dev

# 4) รัน dev server -> http://localhost:3000
pnpm dev
```

### Scripts ที่ใช้บ่อย

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # ตรวจ lint
pnpm typecheck    # ตรวจชนิดข้อมูล
pnpm test         # unit/integration (Vitest)
pnpm test:e2e     # end-to-end (Playwright)
```

## 🔑 Environment variables

ดูรายการทั้งหมดที่ [`docs/TECH-STACK.md`](docs/TECH-STACK.md) — ครอบคลุม Supabase,
Prisma `DATABASE_URL`, Upstash Redis, Resend, PromptPay, และ analytics IDs

## 🗂️ โครงสร้าง (เป้าหมาย)

```
src/app/        Next.js App Router (storefront / account / admin / api)
src/modules/    โดเมนแยกตามฟีเจอร์ (catalog, orders, payments, ...)
src/components/  shadcn/ui primitives
src/lib/        supabase, prisma, redis, cache, seo utils
prisma/         schema + migrations
docs/           เอกสารวางแผน/ออกแบบ
```

รายละเอียดเต็มที่ [`docs/DESIGN-PATTERNS.md`](docs/DESIGN-PATTERNS.md)

## 📝 หมายเหตุการพัฒนา

- เงินเก็บเป็น integer **satang** (1 บาท = 100 สตางค์) ไม่ใช้ float
- การเปลี่ยนสถานะ order/payment/shipment ต้องผ่าน state machine ที่กำหนดใน `SPEC.md`
- พฤติกรรมที่ admin ควรปรับได้ ต้องอ่านจาก `GlobalSetting` ไม่ hard-code
