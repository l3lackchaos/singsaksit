# Tech Stack — แผนเทคโนโลยีที่ใช้

เอกสารนี้สรุป tech stack ที่เลือกใช้สำหรับเว็บไซต์ขายพระเครื่อง พร้อมเหตุผลที่เลือก
(decision rationale) เพื่อให้ทุกคน/ทุก instance ตัดสินใจสอดคล้องกัน

## หลักการเลือก (Selection principles)

ทุกอย่างต้องตอบโจทย์ 6 เสาหลักของงานนี้:
SEO • Realtime • Cache • Image optimize • Auth (รวม social login) • Admin จัดการเองได้

เพื่อลดจำนวนชิ้นส่วนที่ต้องดูแล เราเลือก **Next.js + Supabase** เป็นแกนหลัก เพราะ
Supabase รวม Postgres + Auth + Realtime + Storage ไว้ในที่เดียว (ลด glue code) และ
Next.js App Router ให้ SSR/SSG + image optimization + edge caching แบบ built-in

## Stack หลัก

| ชั้น (Layer) | เทคโนโลยี | เหตุผล |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | SSR/SSG/ISR เพื่อ SEO, React Server Components, `next/image`, server actions, route handlers |
| UI / Styling | **Tailwind CSS** + **shadcn/ui** (Radix UI) | คอมโพเนนต์ a11y มาตรฐาน (focus, ARIA, keyboard), ปรับ design system ได้ง่าย, รองรับ dark mode |
| Theme | **next-themes** | light/dark mode + system, ไม่มี flash on load |
| Database | **PostgreSQL (Supabase)** | relational เหมาะกับ order/payment/inventory, มี RLS เป็น security boundary |
| ORM / Migrations | **Prisma** | schema เป็น type-safe, migration history ชัดเจน, ใช้คู่ Supabase Postgres ได้ |
| Auth | **Supabase Auth** | email/password + **Google** + **Facebook** OAuth ในตัว, ออก JWT, ผูกกับ RLS |
| Realtime | **Supabase Realtime** | subscribe การเปลี่ยนแปลงของ order/payment/shipment แบบ live |
| Storage | **Supabase Storage** | เก็บสลิปการโอน + รูปพระ, มี image transformation (resize/format) |
| Cache | **Upstash Redis** + Next.js cache tags | cache แคตตาล็อก/หน้า CMS + cache resolve/ตัวนับคลิกของระบบย่อลิงก์ |
| Image optimize | **next/image** + Supabase transform | lazy load, responsive, แปลงเป็น WebP/AVIF อัตโนมัติ |
| Email | **Resend** + **React Email** | ส่งอีเมล transactional, เทมเพลตเป็นคอมโพเนนต์ + เก็บ/แก้ได้จาก DB (CMS) |
| PromptPay QR | **promptpay-qr** + **qrcode** | สร้าง QR PromptPay ตามยอดเงินของแต่ละออร์เดอร์ |
| Validation | **Zod** | schema เดียวใช้ทั้ง client form + server action + API |
| Forms | **React Hook Form** | ฟอร์มประสิทธิภาพดี, ผูกกับ Zod resolver |
| Client data | **TanStack Query** | cache ฝั่ง client, optimistic update, ผสานกับ realtime |
| Analytics / Ads | **GA4 + Google Tag Manager + Meta Pixel** | tracking, remarketing, conversion สำหรับยิง Ads |
| Link shortener | custom (Next.js route + Postgres canonical + Redis cache/counter) | URL สั้นสำหรับแชร์สินค้า/แคมเปญ + เก็บสถิติคลิก |
| Search | **Postgres FTS** (`pg_trgm`/unaccent) | ค้นหาภาษาไทยโดยไม่เพิ่ม service ใหม่ (อัปเกรดเป็น Typesense/Meilisearch ภายหลังได้) |
| Rate limiting | **@upstash/ratelimit** (Redis) | กัน brute force/abuse ที่ login, อัปโหลดสลิป, short link |
| Sanitization | **isomorphic-dompurify** / sanitize-html | ล้าง rich text จาก admin/CMS กัน XSS |
| Consent / PDPA | cookie consent (custom/Vanilla Cookie Consent) + ConsentLog | gate tracking ตามความยินยอม |
| PWA | **@ducanh2912/next-pwa** (หรือ Serwist) | manifest + service worker บน Next.js App Router |
| Error monitoring | **Sentry** | จับ error client/server + performance |
| Testing | **Vitest** (unit/integration) + **Playwright** (e2e) | ครอบคลุม logic + flow สำคัญ (จ่ายเงิน/ยืนยันสลิป) |
| Tooling | **pnpm**, **ESLint**, **Prettier** | จัดการ dependency เร็ว + บังคับสไตล์โค้ด |
| Deploy | **Vercel** (app) + **Supabase** (data) | เข้ากับ Next.js ดีที่สุด, edge cache, preview deployments |

## ทางเลือก / ข้อสังเกต (Alternatives & notes)

- **CMS:** เริ่มด้วย admin dashboard ที่ build เองบนข้อมูลใน Postgres
  (ยืดหยุ่นและผูกกับ order domain ได้ตรง) ถ้าต้องการ headless CMS เต็มรูปแบบ
  ค่อยพิจารณา **Payload CMS** (Next.js-native) ภายหลัง อย่าผูกตายกับ CMS ภายนอก
- **Auth:** ถ้าต้องการ control มากขึ้น สามารถสลับไปใช้ **Auth.js (NextAuth)**
  ได้ แต่จะเสียการผูกกับ Supabase RLS — คงไว้ที่ Supabase Auth จนกว่าจะมีเหตุผลชัด
- **State management:** ไม่ใช้ global store หนัก ๆ — พึ่ง server components +
  TanStack Query + URL state เป็นหลัก
- **ไม่มี payment gateway** (Stripe/Omise) เพราะ flow เป็น Admin Confirm
  ถ้าอนาคตเพิ่มบัตรเครดิต ค่อยเสียบ gateway เป็นอีก payment method หนึ่ง

## Environment variables (คาดการณ์)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server only
DATABASE_URL=                    # Prisma -> Supabase Postgres
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
PROMPTPAY_ID=                    # seed/fallback เท่านั้น; ค่าจริงตั้งใน GlobalSetting (payment.promptpayId)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=               # server only (source maps)
CRON_SECRET=                     # ป้องกัน endpoint ของ scheduled job (auto-cancel/retention)
```
