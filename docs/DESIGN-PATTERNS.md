# Design Patterns & Architecture — รูปแบบสถาปัตยกรรม

แนวทางการจัดโครงสร้างโค้ดและ pattern ที่ใช้ เพื่อให้ระบบ realtime + admin-managed
ขยายต่อได้และทดสอบได้

## หลักการ

- **Server-first.** ใช้ React Server Components + Server Actions เป็นค่าเริ่มต้น;
  ดึง client component มาใช้เฉพาะที่ต้อง interactive จริง ๆ
- **UI ไม่แตะ DB ตรง.** ไหลเป็นชั้น: `UI → Server Action → Service → Repository → Prisma`
- **Data-driven.** อะไรที่ admin ควรแก้ได้ (สินค้า, เนื้อหา, อีเมล, แบนเนอร์, SEO) ต้องอยู่ใน DB
- **Single source of truth = Postgres.** realtime/cache เป็นชั้นบน ไม่ใช่แหล่งข้อมูลคู่ขนาน

## โครงสร้างโฟลเดอร์ (เป้าหมาย)

```
src/
  app/                      # Next.js App Router
    (storefront)/           # หน้าสาธารณะ: home, สินค้า, checkout
    (account)/              # หน้าสมาชิก: ออร์เดอร์, โปรไฟล์
    admin/                  # หลังบ้าน/CMS (ป้องกันด้วย role)
    api/                    # route handlers (webhooks, short link redirect)
    s/[code]/               # short link redirect
  modules/                  # โดเมนแยกตามฟีเจอร์ (feature-based)
    catalog/                # products, categories
    cart/
    orders/
    payments/               # admin-confirm, slip review, promptpay qr
    shipping/
    auth/
    cms/                    # pages, banners
    email/                  # templates + sender
    marketing/              # coupons, short links, analytics
    settings/               # global settings (typed accessor)
    each module: { components/, actions.ts, service.ts, repository.ts, schema.ts (zod) }
  components/ui/            # shadcn/ui primitives ที่ใช้ร่วม
  lib/                      # supabase, prisma, redis, cache, seo, money, slug utils
  styles/
prisma/
  schema.prisma
  migrations/
docs/
```

## Patterns ที่ใช้

- **Repository pattern** — แยก data access (Prisma) ออกจาก business logic;
  สลับ/ม็อกได้ในเทสต์
- **Service layer** — business rule + state transition อยู่ที่นี่ ที่เดียว
  (เช่น `payments/service.ts` คุม Payment state machine)
- **Server Actions เป็น use-case boundary** — validate ด้วย Zod → check auth/role →
  เรียก service → revalidate cache → broadcast
- **State machine แบบ explicit** — กำหนด allowed transitions เป็นตาราง/ฟังก์ชัน
  ปฏิเสธการเปลี่ยนที่ไม่ถูกต้อง (ดู `SPEC.md` §2)
- **RBAC** — middleware + server-side guard ตรวจ role ก่อนเข้า `admin/*` และ action สำคัญ;
  ชั้นลึกสุดบังคับด้วย Postgres RLS
- **Cache-aside + tag invalidation** — อ่านผ่าน cache (Redis/Next tags),
  เขียนแล้ว `revalidateTag`/ล้าง key ที่เกี่ยว
- **Optimistic UI + realtime reconcile** — อัปเดตหน้าจอทันที แล้ว reconcile กับ
  event จาก Supabase Realtime
- **Snapshot pattern** — order/orderItem เก็บ snapshot ราคา/ชื่อ ณ เวลาสั่งซื้อ
  (ราคาเปลี่ยนภายหลังไม่กระทบออร์เดอร์เก่า)
- **Template method สำหรับอีเมล** — โครงเทมเพลตคงที่ + เนื้อหา/ตัวแปรจาก DB
- **Adapter สำหรับ payment method** — `PROMPTPAY` / `BANK_TRANSFER` หลัง interface เดียว
  เผื่อเสียบ gateway จริงในอนาคตโดยไม่แก้ core

## กฎความสม่ำเสมอ (Consistency rules)

- เงินเป็น satang (integer) ทุกที่; format เป็นบาทเฉพาะตอนแสดงผล
- ทุก mutation = Server Action ที่ validate ด้วย Zod schema ของ module นั้น
- การเปลี่ยน status ต้องผ่าน service ที่บังคับ state machine — ห้าม `update` ตรงจาก action/UI
- ทุก action ของ admin ที่มีผลต่อเงิน/สิทธิ์/ราคา → เขียน `AuditLog`
- อัปโหลดไฟล์ (สลิป/รูป) → ผ่าน Supabase Storage เท่านั้น + ตรวจชนิด/ขนาดด้วย Zod
- คอมโพเนนต์ UI ใหม่ ยืนบน shadcn/ui (Radix) เพื่อ a11y โดยปริยาย
- ทุกพฤติกรรมที่ admin ควรปรับได้ อ่านจาก `GlobalSetting` ผ่าน typed accessor — ห้าม hard-code
- ทุกส่วนที่โหลดข้อมูล ต้องมี `loading.tsx`/skeleton คู่กันเสมอ
- `sitemap.ts` ดึงข้อมูลจาก repository เดียวกับ storefront (ไม่ query ซ้ำซ้อน)
