# PROJECT OVERVIEW - Advanced POS

## 1) High-Level Purpose

`advanced-pos` is a Next.js 14 (App Router) Point of Sale system with two operational surfaces:

- **Admin surface** for business management (dashboard, users, inventory, customers, reports, settings).
- **Cashier surface** for day-to-day sales (`/pos`) with cart, checkout, payments, and invoice generation.

The project combines React client pages/components with Next.js API routes backed by PostgreSQL.

---

## 2) Tech Stack

### Frontend

- `next` 14.1.0, `react` 18, `react-dom` 18
- TypeScript
- Tailwind CSS + shadcn/Radix UI components
- Lucide icons
- `react-hook-form`, `zod` in form/validation flows

### Backend (inside Next.js app)

- Next.js route handlers under `src/app/api/**`
- PostgreSQL access via `pg` and `postgres` packages
- Some Drizzle-style schema/migration artifacts (mixed with raw SQL approach)

### Authentication

- Admin auth with `@auth0/nextjs-auth0`
- Local/JWT cashier auth flows in custom API routes
- Local development bypass helper in `src/lib/dev-auth.ts`

### Integrations

- Power BI integration stubs/routes (`powerbi-client`, `/api/powerbi`, `/api/powerbi/push`)

---

## 3) Repository Structure And Roles

## Root

- `package.json`: scripts and dependencies
- `README.md`: setup/use docs (partly outdated vs actual scripts)
- `PROJECT_STRUCTURE.md`: simplified structure guide
- `.env.example`: baseline env vars
- `.env.local`: local overrides (currently bypass flags enabled)
- `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`

## `src/app` (Next.js App Router pages and APIs)

- `layout.tsx`: global app wrapper, Auth0 `UserProvider`, conditional navbar
- `page.tsx`: main entry route; shows admin dashboard or login/entry CTAs based on auth
- Route folders for feature pages:
  - `admin`, `users`, `inventory`, `customers`, `transactions`, `invoices`, `reports`, `settings`, `stores`, `payments`, `pos`, `login`, `cashier-login`, `test`
- `api/**/route.ts`: server-side route handlers for auth and data access

## `src/components`

- `admin/`: admin dashboard and admin-specific UI pieces
- `pos/`: POS/cart/checkout/customer/payment UI
- `auth/`: profile/auth-related UI
- `ui/`: reusable foundational components (button, card, form, table, etc.)

## `src/hooks`

- `useAuth.ts`: cashier-simple auth hook (cookie verification + login/logout)
- `useCashierAuth.ts`: separate cashier hook variant
- `useTestAuth.ts`: test-session/auth0 hybrid helper

## `src/lib`

- `dev-auth.ts`: local bypass toggle + mock admin user + Auth0 env presence checker
- `auth.ts` and `auth/auth0-config.ts`: Auth0 helper configuration
- `db.ts`, `db/*`: database utilities/migrations/schemas (mixed approach)
- `store-utils.ts`: store-scoped helpers and fallback behavior
- `utils.ts`, `types/*`

## `src/db`

- Additional schema/migration track (`schema.sql`, `migrations/*`, drizzle-like setup).
- Coexists with `src/lib/db/*`, indicating historical/parallel DB evolution.

---

## 4) Main Entry Points And App Startup

1. `npm run dev` starts `next dev`.
2. Next loads `src/app/layout.tsx`:
   - wraps app with Auth0 `UserProvider`
   - renders conditional navbar and page content
3. `/` route (`src/app/page.tsx`) decides what to render:
   - Auth0/admin user -> admin dashboard
   - non-admin user -> redirect to `/pos`
   - unauthenticated -> landing/welcome CTA
   - in local bypass mode -> uses mock admin session
4. Feature pages call API routes under `src/app/api/**`.
5. API routes query PostgreSQL and return JSON payloads.

---

## 5) Feature Modules And How They Connect

## Admin module

- UI: `src/components/admin/dashboard.tsx` + admin pages in `src/app/*`
- Reads analytics and operational data from `/api/reports`, `/api/customers`, etc.
- Uses Auth0 user + role claim (`https://advanced-pos.com/roles`) for access decisions.

## Cashier/POS module

- UI: `src/app/pos/page.tsx` with POS components (`product-grid`, `cart`, `checkout`, etc.)
- Auth: cashier local login pages/hooks (`/cashier-login`, `useAuth`)
- Data: products/customers lookup + transaction creation through APIs

## API module

- Auth endpoints for multiple auth flows:
  - Auth0 routes (`/api/auth/[...auth0]`, `/api/auth/[auth0]`)
  - local/cashier routes (`/api/auth/local/*`, `/api/auth/cashier*`, `/api/auth/local-login`)
- Business endpoints:
  - products, categories, customers, transactions, payments, invoices, users, stores, settings, reports
- Integrations:
  - Power BI routes

## Database module

- Runtime routes mostly use raw SQL via `pg` pools.
- Additional Drizzle-style schema/migration files exist but are not uniformly used by all APIs.

---

## 6) Authentication Model (Current State)

Authentication is functional but fragmented:

1. **Auth0 admin auth**
   - Hook: `useUser` client-side
   - Session: `getSession` server-side
   - Expected role claim: `https://advanced-pos.com/roles`

2. **Cashier/simple auth**
   - Login route issues JWT cookie
   - Verify/logout endpoints check and clear cookie

3. **Additional parallel auth paths**
   - `cashier_token`, `auth-token`, `auth_token`, `local_auth` cookie naming variants
   - multiple route families with overlapping behavior

4. **Local development bypass**
   - `src/lib/dev-auth.ts` enables bypass in development or when `AUTH_BYPASS=true`
   - App can load locally without external Auth0 credentials
   - Auth0 routes include local short-circuit behavior in bypass/no-env mode

---

## 7) Database and Data Model

Primary business entities in active code:

- `users`
- `stores`, `store_admins`
- `categories`, `products`
- `customers`
- `orders`, `order_items`
- `payments`
- `invoices`
- `settings`

Observed inconsistency:

- Some code (notably Power BI parts and some migration files) references `transactions`/`transaction_items`.
- Core transaction flow APIs use `orders`/`order_items`.
- This indicates schema drift and/or partial migration history.

Connection behavior:

- Many routes use `POSTGRES_URL || DATABASE_URL`.
- Some use only `DATABASE_URL`.
- Missing DB config may still allow UI boot in local bypass mode, but data APIs can return empty fallback (reports) or error (other domains).

---

## 8) API Route Inventory (Important)

### Auth

- `/api/auth/[...auth0]`
- `/api/auth/[auth0]`
- `/api/auth/local/login`, `/api/auth/local/verify`, `/api/auth/local/logout`
- `/api/auth/cashier-simple`, `/api/auth/cashier-simple-verify`, `/api/auth/cashier-simple-logout`
- `/api/auth/cashier/login`, `/api/auth/cashier/me`, `/api/auth/cashier/logout`
- `/api/auth/local-login`, `/api/auth/local-logout`
- `/api/auth/verify`

### Business data

- `/api/products`, `/api/products/[id]`
- `/api/categories`
- `/api/customers`, `/api/customers/[id]`
- `/api/transactions`
- `/api/payments`
- `/api/invoices`
- `/api/users`, `/api/users/[id]`
- `/api/stores`
- `/api/settings`

### Reporting / integrations / utility

- `/api/reports`
- `/api/powerbi`, `/api/powerbi/push`
- `/api/reset-password`

---

## 9) Environment Variables

From `.env.example` and route usage:

### Auth0

- `AUTH0_SECRET`
- `AUTH0_BASE_URL`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`

### Local auth bypass

- `AUTH_BYPASS`
- `NEXT_PUBLIC_AUTH_BYPASS`

### Database/JWT

- `DATABASE_URL`
- `POSTGRES_URL` (used in many APIs as preferred fallback)
- `JWT_SECRET`

### Other

- `POWERBI_PUSH_URL`
- `NEXTAUTH_URL` (used as fallback base in one invoice-trigger flow)

---

## 10) Notable Risks / Broken / Confusing Areas

1. **Auth fragmentation (high)**
   - Multiple overlapping auth routes and cookie names.
   - Harder to reason about security boundaries.

2. **Authorization inconsistency (high)**
   - Not all mutating routes apply clearly consistent auth/role guards.

3. **Schema drift (high)**
   - `orders` vs `transactions` models coexist in code paths.

4. **Dual DB architecture (medium-high)**
   - `src/db` and `src/lib/db` contain parallel schema/migration tracks.

5. **Docs/scripts mismatch (medium)**
   - README mentions DB scripts not present in `package.json`.

6. **Local bypass defaults (intentional but risky if misunderstood)**
   - Development mode currently bypasses Auth0 by design for local productivity.

7. **Partial local fallback coverage**
   - `/api/reports` has local fallback without DB in bypass mode; many other APIs still expect DB and can fail.

---

## 11) Exact Local Run Steps (Current Practical Flow)

1. Install dependencies:

```bash
npm install
```

2. Ensure `.env.local` exists.

### For quick local UI boot without Auth0:

```env
AUTH_BYPASS=true
NEXT_PUBLIC_AUTH_BYPASS=true
```

3. Optional but recommended for full functionality: add DB and JWT env:

```env
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...   # optional but used by many routes
JWT_SECRET=replace-with-strong-secret
```

4. Start app:

```bash
npm run dev
```

5. Open local URL shown by Next.js (commonly `http://localhost:3000`, or next free port).

### Notes

- With bypass enabled and no DB, core UI can open, but many data-driven routes will still be limited.
- For real admin auth testing, disable bypass and configure full Auth0 env vars.

---

## 12) What Is Clear vs Unclear

### Clear

- Overall product purpose and main feature set.
- Primary frontend/backend organization.
- Main auth and API route surfaces.

### Unclear (explicit)

- Which DB schema track is canonical in current environment (`orders`-based vs `transactions`-based legacy paths).
- Whether Drizzle workflow is still active or mostly legacy.
- Intended final auth unification path among the multiple local/cashier variants.

---

## 13) Recent Local-Dev Stabilization Changes (Already Present)

The repository currently includes local-development auth bypass and startup-hardening updates:

- Added `src/lib/dev-auth.ts`
- Added bypass env keys in `.env.example`
- Enabled bypass in `.env.local`
- Updated key auth-facing UI/route files to avoid hard dependency on Auth0 during local dev
- Added `/api/reports` local fallback response when bypass is enabled and DB is missing

These changes preserve existing architecture and Auth0 integration while making local startup possible without external credentials.
