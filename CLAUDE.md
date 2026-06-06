# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**Greenfield.** As of this writing the repository contains only planning
documents under `docs/` — no application code has been scaffolded yet. The
sections below describe the *intended* architecture so that the first build-out
follows a coherent plan. When you scaffold the app, update the "Commands"
section with the real, verified commands.

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
- **Upstash Redis** — caching + the link-shortener keyspace.
- **Resend + React Email** — transactional emails from admin-editable templates.
- **Zod + React Hook Form + TanStack Query** — validation, forms, client data.
- **GA4 + Google Tag Manager + Meta Pixel** — tracking/Ads.

## Commands (planned)

These are the expected commands once the Next.js app is scaffolded. Verify and
correct them after scaffolding, then remove this note.

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
- Discounts go through the **Voucher** system (percent / fixed / free-shipping)
  with per-user and total usage limits, recorded in `VoucherRedemption`.
