# CONTEXT

## Project Purpose

`advanced-pos` is a full-stack POS application built with Next.js App Router for:

- **Admins**: dashboard, user/store management, inventory, customers, reports, settings
- **Cashiers**: login and POS transaction workflow

It combines a React UI, Next.js API route handlers, PostgreSQL data storage, and mixed authentication mechanisms (Auth0 + local JWT flows).

---

## Architecture

- **Frontend**: Next.js pages/components in `src/app` and `src/components`
- **Backend**: Next.js route handlers in `src/app/api`
- **Auth**:
  - Auth0 (`@auth0/nextjs-auth0`) for admin-facing model
  - Local JWT/cookie routes for cashier flows
  - Local dev bypass via `src/lib/dev-auth.ts`
- **Data**:
  - PostgreSQL via raw `pg` in many API routes
  - Additional Drizzle-like schema/migration artifacts in parallel folders (`src/db`, `src/lib/db`)

---

## File Map (Key)

- `package.json`: scripts/deps
- `.env.example`: expected envs
- `.env.local`: local overrides
- `PROJECT_OVERVIEW.md`: detailed architecture and behavior documentation
- `src/app/layout.tsx`: root wrapper + provider + navbar
- `src/app/page.tsx`: main entry page and role routing behavior
- `src/components/admin/dashboard.tsx`: admin dashboard data flow
- `src/components/pos/*`: POS UI building blocks
- `src/hooks/useAuth.ts`: cashier simple auth hook
- `src/lib/dev-auth.ts`: development auth bypass helper
- `src/app/api/**`: all backend endpoints

---

## Setup / Run Instructions

1. Install:

```bash
npm install
```

2. For local auth bypass (no Auth0 required), ensure:

```env
AUTH_BYPASS=true
NEXT_PUBLIC_AUTH_BYPASS=true
```

3. For full data features, add DB/JWT envs:

```env
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
JWT_SECRET=...
```

4. Start:

```bash
npm run dev
```

5. Open the local URL printed by Next.

---

## Current Known Issues

1. **Authentication fragmentation**
   - Multiple auth route families and cookie names (`auth-token`, `cashier_token`, `auth_token`, `local_auth`).
2. **Authorization inconsistency**
   - Some API routes do not show consistent auth/role checks.
3. **Schema drift**
   - Mixed use of `orders/order_items` and `transactions/transaction_items`.
4. **DB architecture duplication**
   - `src/db` and `src/lib/db` both contain schema/migration logic.
5. **Docs mismatch**
   - README references DB scripts absent from current `package.json`.
6. **Partial no-DB fallback**
   - Read/list routes now have broader local demo fallback coverage, but write/mutation routes still depend on auth+DB.

---

## Changes Made So Far

### Local startup/auth bypass stabilization (already applied)

- Added `src/lib/dev-auth.ts` for bypass flags and mock admin user.
- Updated key auth-facing UI flows to support local bypass:
  - `src/app/page.tsx`
  - `src/components/admin/dashboard.tsx`
  - `src/components/pos/navbar.tsx`
  - `src/components/pos/conditional-navbar.tsx`
  - `src/app/login/page.tsx`
- Updated Auth0 config/route handling to avoid local crash when Auth0 env is absent:
  - `src/app/api/auth/[auth0]/route.ts`
  - `src/app/api/auth/[...auth0]/config.ts`
  - `src/lib/auth.ts`
- Added bypass vars to `.env.example`.
- Set `.env.local` to bypass mode for local development.
- Added local fallback in `src/app/api/reports/route.ts` when bypass is enabled and DB is missing.

### Documentation pass (this update)

- Added `PROJECT_OVERVIEW.md` (comprehensive repository understanding doc).
- Added this `CONTEXT.md` as living context/state file.

### Local bypass audit + stability fixes

- Ran bypass-mode audit against main pages and key APIs in local dev.
- Added `BUG_REPORT.md` with prioritized issues, file-level impact, and recommended fixes.
- Applied minimal stability patches (no structure changes):
  - `src/hooks/useAuth.ts`: bypass mode now provides a deterministic mock local user.
  - `src/app/users/page.tsx`: bypass-aware admin user handling.
  - `src/app/inventory/page.tsx`: bypass-aware admin user handling.
  - `src/app/reports/page.tsx`: bypass-aware admin user handling.

### Second pass: local demo usability

- Added read-only local demo fallbacks for key GET endpoints:
  - `src/app/api/products/route.ts`
  - `src/app/api/categories/route.ts`
  - `src/app/api/customers/route.ts`
  - `src/app/api/transactions/route.ts`
  - `src/app/api/users/route.ts`
  - `src/app/api/invoices/route.ts`
- Fallback responses return realistic demo data with `meta.source = "local-demo"`.
- Retested core pages and APIs in bypass mode; main read flows now render with data without requiring PostgreSQL.

### Cashier/POS usability pass

- Improved local cashier entry flow:
  - `src/app/cashier-login/page.tsx`
  - In bypass mode, cashier login now clearly exposes direct POS access and avoids confusing failed-login behavior.
- Improved POS data compatibility:
  - `src/app/pos/page.tsx`
  - Product mapping now supports both `stock` and `stock_quantity` API shapes.
  - Customer display/notes support both `{ first_name, last_name }` and `{ name }` data shapes used by fallback/demo APIs.
- Practical result:
  - `/pos` is directly testable in local bypass mode.
  - Product browsing and cart interactions are usable for demo flow without Auth0 or DB setup.

---

## Next Tasks

1. Add optional demo-mode behavior for selected write flows (especially checkout/transaction POST) or keep them explicitly disabled with clear UI/API messaging.
2. Unify authentication flows and cookie naming across APIs/hooks.
3. Define and enforce a single authorization middleware/guard strategy for protected routes.
4. Reconcile database schema divergence (`orders` vs `transactions`) and remove legacy drift.
5. Consolidate database layer (`src/db` vs `src/lib/db`) into one canonical path.
6. Align README/scripts with actual runnable DB migration workflow.
