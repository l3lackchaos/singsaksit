# Design

## Theme
ไทยร่วมสมัย โทน "ขลัง/พรีเมียม" — พื้นอบอุ่น (warm off-white) ในโหมดสว่าง, น้ำตาลเข้มเกือบดำ
ในโหมดมืด, สีแบรนด์ทอง-น้ำตาล + แดงเข้ม(อิฐ/ชาด) เป็น accent รองรับ light/dark/system

## Color (CSS variables, HSL — `src/app/globals.css`)
- **primary**: ทอง-น้ำตาล `35 60% 38%` (light) / `38 70% 55%` (dark) — สีแบรนด์หลัก
- **accent**: แดงอิฐ/ชาด `12 65% 45%` — ใช้น้อย เน้นจุดสำคัญ
- **background**: `40 30% 98%` (light) / `30 12% 8%` (dark)
- **semantic**: success(เขียว) · warning(ส้ม-เหลือง = รอตรวจสลิป) · destructive(แดง)
- ทุกสีมีคู่ light/dark ผ่าน contrast AA

## Typography
- **Display / หัวข้อ (h1–h4)**: **Trirong** (Thai serif, Cadson Demak) — ให้ความรู้สึกขลัง
  พรีเมียม คลาสสิก; fluid `clamp()` scale, weight 500–700, `letter-spacing` แน่นเล็กน้อยบนตัวใหญ่,
  `text-wrap: balance`
- **Body / UI**: **Sarabun** (Thai sans) — สะอาด อ่านง่าย ให้ความน่าเชื่อถือแบบทางการ;
  ขนาดฐาน 16px, line-height 1.6, line-length ≤ ~72ch
- **ตัวเลข/ราคา**: `tabular-nums`
- คู่ฟอนต์เป็นแกน contrast serif (display) + sans (body) ครอบคลุมทั้งไทยและละติน
- โหลดผ่าน `next/font` (self-host, `display: swap`, ไม่มี layout shift)

> เลี่ยงฟอนต์ reflex (Inter/IBM Plex/Playfair/Cormorant) และ lane editorial-italic ตาม Impeccable;
> เลือกคู่ที่เหมาะบริบทไทย-ขลัง แทน

## Components
shadcn-style (Radix) บน Tailwind — button, input, label, skeleton; การ์ดสินค้าใช้รูปสัดส่วน
คงที่ (กัน CLS), badge สถานะสต็อก, timeline สถานะออร์เดอร์, แผง PromptPay/slip upload

## Layout
container ≤1280px, grid การ์ดสินค้า responsive (2→3→4), header sticky + แบนเนอร์ CMS,
whitespace เยอะให้พระเด่น, จังหวะ spacing แปรผันเพื่อ rhythm, mobile-first

## Motion
เบา มีจุดประสงค์ (hover ยกการ์ด, fade), 150–250ms ease-out, เคารพ `prefers-reduced-motion`
