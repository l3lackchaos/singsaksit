# UX/UI Design Patterns — แนวทางออกแบบประสบการณ์และหน้าจอ

ระบบดีไซน์สำหรับเว็บไซต์ขายพระเครื่อง เน้น **สมัยใหม่ สะอาดตา น่าเชื่อถือ** บนพื้นฐาน
shadcn/ui (Radix) + Tailwind โดยถือ a11y, light/dark, และ skeleton loading เป็นค่าเริ่มต้น

## 1. หลักการออกแบบ (Design principles)

1. **น่าเชื่อถือมาก่อนสวย** — พระเครื่องเป็นสินค้าความเชื่อ+มูลค่าสูง ดีไซน์ต้องสื่อความ
   จริงใจ โปร่งใส (รูปคมชัด, ข้อมูลครบ, สถานะชัด)
2. **เนื้อหานำสายตา** — รูปสินค้าเด่น พื้นหลังเรียบ ปล่อย whitespace ให้พระดูมีค่า
3. **ลดแรงเสียดทาน** — เส้นทางซื้อสั้น ชัด ทุกขั้นบอกผู้ใช้ว่าอยู่ตรงไหนและต้องทำอะไรต่อ
4. **บอกสถานะเสมอ** — loading (skeleton), empty, error, success มีครบทุกหน้าจอ
5. **เข้าถึงได้ทุกคน** — keyboard, screen reader, contrast ผ่านทั้ง light/dark

## 2. Design tokens

ใช้ CSS variables ผูกกับ Tailwind theme; ค่าหลัก (`theme.brandColor` ฯลฯ) ปรับได้จาก
`GlobalSetting` ดู SPEC §6

### สี (Color)
- **Brand/primary**: โทนทอง-น้ำตาล/แดงเข้ม (สื่อความขลัง/มงคล) — ปรับได้จากหลังบ้าน
- **Neutral**: เทาอบอุ่น (warm gray) สำหรับพื้นหลัง/ตัวอักษร
- **Semantic**: `success` (เขียว), `warning` (เหลือง/ส้ม — รอตรวจสลิป), `destructive` (แดง),
  `info` (น้ำเงิน)
- ทุกสีต้องมีคู่ light/dark และผ่าน contrast AA (ข้อความปกติ ≥ 4.5:1, ตัวใหญ่ ≥ 3:1)

### ตัวอักษร (Typography)
- ฟอนต์ไทยอ่านง่าย เช่น **Noto Sans Thai / IBM Plex Sans Thai** (+ละติน pairing)
- สเกล: `display / h1 / h2 / h3 / body / sm / caption` กำหนดเป็น token เดียวทั้งระบบ
- เลขราคา/ยอดเงิน ใช้ tabular numerals เพื่อจัดคอลัมน์ตรง

### Spacing / Radius / Shadow / Motion
- spacing scale 4px base; radius กลาง-มน (สื่อความนุ่มนวล/พรีเมียม)
- เงาบาง ใช้เพื่อยกการ์ดสินค้า; หลีกเลี่ยงเงาหนัก
- motion 150–250ms, easing นุ่ม; **เคารพ `prefers-reduced-motion`** (ปิด animation)

## 3. Layout & navigation

- **Grid**: container กว้างสุด ~1280px, การ์ดสินค้าแบบ responsive grid
  (2 คอลัมน์มือถือ → 3–4 เดสก์ท็อป)
- **Header**: โลโก้ + ค้นหา + เมนูหมวด + ตะกร้า + บัญชี + ปุ่มสลับธีม; sticky ตอนเลื่อน
- **Footer**: ข้อมูลร้าน, นโยบาย, ช่องทางติดต่อ, ลิงก์หมวด, รับประกัน/ความน่าเชื่อถือ
- **Breakpoints**: `sm 640 / md 768 / lg 1024 / xl 1280` — ออกแบบ mobile-first
- **Breadcrumb** บนหน้าสินค้า/หมวด (ดีต่อ a11y + SEO JSON-LD)

## 4. Page patterns (หน้าหลัก)

### Hero (หน้าแรก)
- ภาพ/สโลแกนเด่น + CTA ชัด ("เลือกชมพระเครื่อง"), ข้อความสื่อความน่าเชื่อถือ
- เนื้อหา hero แก้ได้จาก CMS; รองรับ banner หลายสไลด์ (จัดลำดับจากหลังบ้าน)
- โหลดแบบ priority image (LCP) — ไม่ทำ skeleton กับ hero หลัก เพื่อ LCP เร็ว

### Catalog / หมวดหมู่
- การ์ดสินค้า: รูป (สัดส่วนคงที่กัน layout shift), ชื่อ, ราคา, ป้ายสถานะสต็อก*
- ตัวกรอง (หมวด/ราคา/วัด/รุ่น/ปี) + เรียงลำดับ; ทำงานผ่าน URL state (แชร์/ย้อนกลับได้)
- โหลดด้วย **skeleton grid**; มี empty state ("ไม่พบสินค้า") และ pagination/infinite scroll
- *การแสดงสต็อก/ป้ายเหลือน้อย/ซ่อนของหมด ควบคุมด้วย `GlobalSetting` (`display.*`)

### Product detail
- แกลเลอรีรูป (zoom), ชื่อ, ราคา, สถานะสต็อก, attributes (วัด/รุ่น/ปี/เนื้อ/ขนาด)
- ปุ่ม "เพิ่มลงตะกร้า"/"ซื้อเลย" เด่น (sticky บนมือถือ)
- ข้อมูลความน่าเชื่อถือ: รายละเอียดพระ, การรับประกัน, นโยบายคืนสินค้า
- SEO: title/description/OG จาก field สินค้า + JSON-LD `Product/Offer`
- โหลด: skeleton สำหรับรายละเอียด, ภาพใช้ blur placeholder

### Cart / Checkout
- สรุปรายการ + ยอดรวม (subtotal/ส่วนลด voucher/ค่าส่ง/รวมสุทธิ) ชัดเจน
- ช่องกรอก **voucher** + แสดงผลส่วนลดทันที (optimistic)
- Checkout เป็นขั้นตอนชัด: ที่อยู่ → วิธีจ่าย → ยืนยัน; แสดง progress
- ฟอร์ม inline validation (Zod) ข้อความ error ชัดและผูกกับ field (a11y)

### Payment (Admin Confirm) — จุดสำคัญ
- เลือกวิธี: **PromptPay QR** (แสดง QR + ยอด) หรือ **โอนธนาคาร** (เลขบัญชี + ปุ่มคัดลอก)
- อัปโหลดสลิป: drag-drop + preview, ตรวจชนิด/ขนาดไฟล์, แสดงสถานะอัปโหลด
- หลังอัป: แสดง state "⏳ รอแอดมินตรวจสอบ" ชัดเจน (สี warning) + อัปเดต **realtime**
- timeline สถานะ: รอจ่าย → รอตรวจสอบ → ยืนยันแล้ว → กำลังจัดส่ง → จัดส่งสำเร็จ

### Order tracking
- หน้า order detail: stepper/timeline แสดงสถานะ payment + shipping
- เลขพัสดุ + ลิงก์ขนส่ง; อัปเดตทุกสถานะแบบ realtime (ไม่ต้อง refresh)

### Account / Membership
- เข้าสู่ระบบ: email/password + ปุ่ม **Google** / **Facebook** (ชัด แยกจากกัน)
- โปรไฟล์, ที่อยู่จัดส่ง, ประวัติการสั่งซื้อ

### Admin / CMS
- เลย์เอาต์ sidebar + data tables (ค้นหา/กรอง/sort/pagination) + skeleton ตาราง
- **คิวตรวจสลิป**: รายการรออนุมัติ realtime, ดูสลิปขนาดใหญ่, ปุ่มยืนยัน/ปฏิเสธ + เหตุผล
- ฟอร์มจัดการสินค้า/หมวด/voucher/หน้า CMS/อีเมลเทมเพลต/global settings
- แสดง toast ยืนยันผล + optimistic update

## 5. Component states (บังคับมีครบ)

ทุกคอมโพเนนต์ที่มีข้อมูล/การกระทำ ต้องรองรับ:
- **Loading** → skeleton (รูปทรงใกล้เคียงของจริง กัน layout shift) ผ่าน `loading.tsx`/Suspense
- **Empty** → ข้อความ + ไอคอน + CTA ทางออก
- **Error** → ข้อความเข้าใจง่าย + ปุ่มลองใหม่
- **Success** → toast/inline confirmation
- **Disabled/Pending** → ปุ่ม action แสดง spinner + กันกดซ้ำ

## 6. Accessibility (a11y) checklist

- โครง landmark (`header/nav/main/footer`) + heading ลำดับถูกต้อง
- โฟกัสมองเห็นชัดทุก interactive element; ลำดับ tab สมเหตุผล
- ปุ่มไอคอนล้วนต้องมี `aria-label`; รูปสินค้ามี `alt` มีความหมาย
- ฟอร์ม: `label` ผูก input, error ประกาศผ่าน `aria-live`
- modal/drawer: focus trap + ปิดด้วย Esc + คืนโฟกัส
- contrast ผ่าน AA ทั้ง light/dark; ไม่สื่อสารด้วยสีอย่างเดียว (มีไอคอน/ข้อความกำกับ)
- รองรับ `prefers-reduced-motion` และ zoom 200% ไม่พัง
- เป้าหมาย: Lighthouse Accessibility ≥ 90, ทดสอบด้วย keyboard + screen reader จริง

## 7. Theming (light/dark)

- ใช้ `next-themes`: `light | dark | system`, จำค่าผู้ใช้, ไม่มี flash on load
- token สีทั้งหมดมีคู่ light/dark; ทดสอบทุกหน้าทั้งสองโหมด
- ปุ่มสลับธีมอยู่บน header; ค่าเริ่มต้น + อนุญาตให้สลับ มาจาก `GlobalSetting`

## 8. Performance UX

- ภาพผ่าน `next/image` (responsive, WebP/AVIF, blur placeholder, สัดส่วนคงที่)
- กัน Cumulative Layout Shift: จองพื้นที่ภาพ/skeleton ให้ตรงขนาดจริง
- โหลดเนื้อหาสำคัญก่อน (above-the-fold), defer ส่วนรอง
- เป้าหมาย Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
