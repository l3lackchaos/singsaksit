# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**All 8 phases built (core complete).** The full verification gate passes
(`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`) plus a Playwright e2e
smoke suite. A live Supabase project (`singsaksit`) backs the app: full schema,
RLS on every table, SECURITY DEFINER RPCs for the order domain
(`create_order`, `confirm_payment`, `reject_payment`, `ship_order`, `refund_order`,
`submit_review`, `resolve_short_link`, `cancel_expired_orders` via pg_cron),
`handle_new_user` trigger, private slips bucket, seeded settings + sample products.
Implemented end-to-end: storefront + search/filter/sort + reviews, auth
(email/OAuth) + profile + wishlist + address book, cart → checkout → order,
Admin-Confirm payments (PromptPay QR / bank + slip upload + admin review with
atomic oversell-safe stock), shipping + realtime, product image upload, admin
(dashboard, slip queue, orders/ship/refund, products+images, coupons +
redemption limits, CMS pages/banners, email-template editor, reviews, short
links, users/roles, settings), AuditLog, transactional email (Resend, no-op
without key), SEO (auto sitemap/robots/JSON-LD incl. Organization + Breadcrumb +
AggregateRating), PDPA consent + gated analytics + data-retention cron, and PWA.
Remaining tail (Sentry error monitoring, full purchase-path e2e with a
seeded admin) is tracked in `docs/TASKS.md`; done-criteria in `docs/GOALS.md`.

> **Setup to go live:** configure OAuth providers (Google/Facebook) + Resend +
> analytics IDs in the dashboard/env, and promote one user to `ADMIN`.

> **Data access today:** public reads use the Supabase anon client (RLS-enforced).
> Privileged server writes / admin / Prisma-runtime need one secret in `.env`
> (`DATABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`) — not committed. Schema changes
> are applied via Supabase migrations; keep `prisma/schema.prisma` as the source of
> truth and regenerate types after changes.

> Read the planning docs before writing code. They are the source of truth for
> scope and decisions:
> - `docs/TECH-STACK.md` — chosen technologies + rationale
> - `docs/SCOPE.md` — what is and isn't in scope, user roles, modules
> - `docs/SPEC.md` — functional + technical spec, data model, key flows
> - `docs/TASKS.md` — phased delivery roadmap
> - `docs/DESIGN-PATTERNS.md` — architecture patterns + folder structure
> - `docs/UX-UI-DESIGN.md` — design system + UX/UI patterns per page

## What this is

A full e-commerce platform for selling Thai amulets (พระเครื่อง / Phra Khrueang).
The domain is Thai-first: UI copy, currency (THB), and the payment flow are all
localized for Thailand. Key differentiators from a generic store:

- **Manual "Admin Confirm" payments.** There is no card gateway. Customers pay
  by PromptPay QR or bank transfer, upload a payment slip, and an admin verifies
  it before the order advances. The payment state machine and slip-review queue
  are core, not afterthoughts.
- **Realtime everywhere.** Order status, payment verification, and shipping
  updates push to the customer live (Supabase Realtime). Treat realtime as the
  default for any status the user is waiting on.
- **Self-serve admin / CMS.** A non-programmer admin must be able to manage
  products, content, pages, banners, email templates, and orders. Avoid
  hard-coding anything an admin should be able to change.

## Tech stack (summary)

See `docs/TECH-STACK.md` for the full rationale. In short:

- **Next.js (App Router) + TypeScript** — SSR/SSG for SEO, RSC, `next/image`.
- **Tailwind CSS + shadcn/ui (Radix primitives)** — a11y-first components,
  `next-themes` for light/dark mode.
- **Supabase** — Postgres, Auth (email/password + Google + Facebook OAuth),
  Realtime, Storage (slips + product images), Row Level Security.
- **Prisma** — typed schema + migrations over the Supabase Postgres.
- **Upstash Redis** — caching + short-link resolve cache & click counter
  (canonical short-link rows live in Postgres).
- **Resend + React Email** — transactional emails from admin-editable templates.
- **Zod + React Hook Form + TanStack Query** — validation, forms, client data.
- **GA4 + Google Tag Manager + Meta Pixel** — tracking/Ads.

## Commands

Verified working with pnpm 10 + Node 22. DB commands need a `DATABASE_URL`
(Supabase Postgres) in `.env` — see `.env.example`.

```bash
# Install
pnpm install

# Dev server (http://localhost:3000)
pnpm dev

# Production build / start
pnpm build
pnpm start

# Lint / format / typecheck
pnpm lint
pnpm format
pnpm typecheck

# Database (Prisma over Supabase Postgres)
pnpm prisma migrate dev      # create/apply a migration locally
pnpm prisma generate         # regenerate the client after schema changes
pnpm prisma studio           # inspect data

# Tests
pnpm test                    # unit/integration (Vitest)
pnpm test <path>             # run a single test file
pnpm test -t "<name>"        # run a single test by name
pnpm test:e2e                # Playwright end-to-end
```

## Architecture notes that span multiple files

- **Payment state machine is the spine of the order domain.** Order +
  Payment + Shipment statuses are coupled. Don't mutate one status without
  walking the transition rules in `docs/SPEC.md`. The admin slip-review action
  is what advances `payment.status` from `PENDING_REVIEW` → `PAID`, which in
  turn unlocks fulfillment.
- **Server Actions + a service layer, not fat components.** Mutations go through
  server actions that call domain services; services call repositories
  (Prisma). UI never talks to Prisma directly. See `docs/DESIGN-PATTERNS.md`.
- **Realtime is layered on top of the DB, not a parallel source of truth.**
  Writes go to Postgres; clients subscribe to changes. Never push state to a
  client that wasn't first persisted.
- **RLS is the security boundary.** Customers can only read their own
  orders/payments; admin role bypasses via policy. Don't rely on client checks
  for authorization — enforce in Postgres RLS + server-side role checks.
- **Caching has explicit invalidation.** Product/content reads are cached
  (Next.js cache tags + Redis). Any admin mutation must invalidate the matching
  tag. A stale catalog is a bug, not a tuning issue.
- **Admin-editable means data-driven.** Email templates, CMS pages, banners, and
  SEO metadata live in the database and are rendered from there — there should
  be no PR required to change marketing copy or a product.

## Conventions

- Money is stored as integer **satang** (1 THB = 100 satang); never floats.
- All user-facing copy is Thai-first; keep strings in a structure an admin or
  i18n layer can reach, not inlined ad hoc.
- Slips and product images go through Supabase Storage + image transformation;
  never serve user uploads unoptimized or from arbitrary origins.
- **Global Settings drive behavior.** Anything an admin should be able to toggle
  (e.g. whether stock is shown, default theme, payment channels, shipping fees,
  feature flags) lives in the `GlobalSetting` table and is read via a typed
  accessor — never hard-code it. See `docs/SPEC.md` §6.
- **Every data-loading view ships with a skeleton.** Use App Router `loading.tsx`
  (Suspense) + shadcn skeletons; no blank/janky frames while loading.
- Products have a unique **slug** (auto-generated from title, admin-editable) and
  a **stock** count; stock decrements on `Payment → PAID` and flips to
  `SOLD_OUT` at zero.
- The **sitemap is auto-generated** from DB content (`app/sitemap.ts`) — products,
  categories, and published CMS pages. Don't maintain a static URL list.
- Discounts go through the **Coupon** system (percent / fixed / free-shipping)
  with per-user and total usage limits, recorded in `CouponRedemption`.
- **Stock decrements must be atomic** (transaction / `WHERE stock > 0`) so two slips
  for the last unit can't oversell; the second confirmation is refused, not driven
  negative. Unpaid orders auto-cancel after `payment.expiryHours`.
- **PDPA is a hard requirement.** Tracking (GA4/GTM/Pixel) loads only after cookie
  consent; consent is recorded in `ConsentLog`. Slips live in a private bucket served
  via short-lived signed URLs and are purged per `privacy.dataRetentionDays`.
- **Sanitize admin/CMS rich text** (DOMPurify/sanitize-html) before storing and rendering.
- Product **reviews** require a real purchase and admin moderation before they show.
