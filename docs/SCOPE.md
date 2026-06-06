# Scope — ขอบเขตโครงการ

เว็บไซต์ขายพระเครื่อง (Thai amulet e-commerce) แบบเต็มรูปแบบ ที่ admin จัดการได้เองโดย
ไม่ต้องพึ่งโปรแกรมเมอร์ เอกสารนี้กำหนดว่าอะไร "อยู่ใน" และ "อยู่นอก" ขอบเขต

## เป้าหมาย (Goals)

1. ขายพระเครื่องออนไลน์ พร้อม UX/UI สมัยใหม่, a11y, light/dark mode, hero section
2. ระบบสมาชิก + login ด้วย email/password, Google, Facebook
3. การจ่ายเงินแบบ **Admin Confirm**: PromptPay QR หรือโอนธนาคาร → อัปโหลดสลิป →
   admin ตรวจสอบและยืนยัน
4. ลูกค้าเช็คสถานะการจ่ายเงินและสถานะการจัดส่งได้แบบ realtime
5. ระบบหลังบ้าน/CMS ให้ admin จัดการสินค้า เนื้อหา ออร์เดอร์ อีเมล ได้เอง
6. SEO, tracking, รองรับการยิง Ads
7. ระบบเสริม: cache, image optimization, ระบบย่อลิงก์, email template

## ผู้ใช้และบทบาท (Roles)

| Role | สิทธิ์ |
|---|---|
| **Guest** | ดูสินค้า, ค้นหา, อ่านเนื้อหา, สมัครสมาชิก |
| **Customer** | ทุกอย่างของ guest + สั่งซื้อ, อัปโหลดสลิป, ดูออร์เดอร์/สถานะของตนเอง, จัดการโปรไฟล์ |
| **Staff** (optional) | จัดการออร์เดอร์/ตรวจสลิป/จัดส่ง แต่แก้ระบบ/ผู้ใช้ไม่ได้ |
| **Admin** | จัดการทุกอย่าง: สินค้า, หมวดหมู่, CMS, แบนเนอร์, อีเมลเทมเพลต, ผู้ใช้, การตั้งค่า, รายงาน |

## โมดูล (Modules — in scope)

- **Storefront**: หน้าแรก + hero, แคตตาล็อก, หน้าสินค้า, ค้นหา/กรอง, ตะกร้า, checkout
- **Membership/Auth**: สมัคร/เข้าสู่ระบบ (email + Google + Facebook), โปรไฟล์, ที่อยู่จัดส่ง
- **Orders**: สร้างออร์เดอร์, ประวัติ, รายละเอียด, ติดตามสถานะ realtime
- **Payments (Admin Confirm)**: สร้าง PromptPay QR ตามยอด, อัปโหลดสลิป, คิวตรวจสอบของ admin,
  ยืนยัน/ปฏิเสธ
- **Shipping**: บันทึกขนส่ง + เลขพัสดุ, อัปเดตสถานะการส่ง, ลูกค้าเห็นแบบ realtime
- **Admin / CMS**: dashboard, จัดการสินค้า+สต็อก, จัดการเนื้อหา/หน้า/แบนเนอร์, จัดการผู้ใช้,
  ตั้งค่าร้าน, รายงานยอดขาย
- **Vouchers**: ระบบส่วนลด (เปอร์เซ็นต์/จำนวนเงิน/ส่งฟรี) จำกัดสิทธิ์การใช้ — admin จัดการเอง
- **Global Settings**: ตั้งค่าได้ทั้งระบบจากหลังบ้าน เช่น แสดง/ซ่อนสต็อก, ธีมเริ่มต้น,
  ช่องทางจ่ายเงิน, ค่าจัดส่ง, เปิด/ปิดฟีเจอร์ (ดู SPEC §6)
- **Email**: เทมเพลตอีเมล (แก้จากหลังบ้าน) + ส่ง transactional (ยืนยันออร์เดอร์/จ่ายเงิน/จัดส่ง)
- **SEO & Marketing**: metadata/OG, sitemap, robots, JSON-LD, โปรโมชัน/โค้ดส่วนลด
- **Analytics/Ads**: GA4, GTM, Meta Pixel, conversion events
- **Platform services**: cache layer, image optimization, ระบบย่อลิงก์ (short links) + สถิติคลิก
- **A11y & Theming**: WCAG 2.1 AA, keyboard nav, light/dark/system theme (สลับได้),
  **skeleton loading** ทุกส่วนที่โหลดข้อมูล
- **Auto sitemap**: `sitemap.xml` สร้างอัตโนมัติจากสินค้า/หมวด/หน้า CMS ใน DB

## นอกขอบเขต (Out of scope — เฟสแรก)

- Payment gateway บัตรเครดิต/e-wallet อัตโนมัติ (ใช้ Admin Confirm เท่านั้น)
- การออกใบกำกับภาษี/เชื่อม ERP/บัญชี
- แอป mobile native (เป็น responsive web/PWA)
- ระบบประมูล (auction) และระบบผ่อนชำระ
- Marketplace หลายผู้ขาย (multi-vendor) — เป็นร้านเดียว
- การรับรองพระแท้/ใบเซอร์อัตโนมัติ (admin กรอกข้อมูลเอง)

## เกณฑ์ความสำเร็จ (Definition of done)

- ลูกค้าสั่งซื้อ → จ่ายผ่าน QR/โอน → อัปสลิป → admin ยืนยัน → เห็นสถานะส่งของ ครบ flow
- admin เพิ่ม/แก้สินค้า เนื้อหา และเทมเพลตอีเมลได้เองจากหลังบ้าน
- หน้า storefront ผ่าน Lighthouse: Performance/SEO/Accessibility ≥ 90
- สถานะออร์เดอร์/จ่ายเงิน/จัดส่ง อัปเดตแบบ realtime ถึงลูกค้า
