# NEXT STEPS - Focused Gap Analysis

## What works

- **Core app shell and navigation are in place**: main admin pages and POS pages exist under `src/app` (`admin`, `pos`, `inventory`, `customers`, `transactions`, `invoices`, `reports`).
- **Basic API surface exists for all domains**: routes are present for products, categories, customers, transactions, invoices, users, reports, and settings under `src/app/api`.
- **POS checkout flow is implemented at UI level**: `src/app/pos/page.tsx` can build a cart and submit to `POST /api/transactions`.
- **Admin dashboard overview is functional**: `src/components/admin/dashboard.tsx` fetches live summary values from `/api/reports` and `/api/customers`.
- **Local demo mode is available**: several APIs use `isAuthBypassEnabled`, useful for local demos when auth/database are unstable.

## What is partially working

- **Admin dashboard**
  - Overview cards fetch real data.
  - Analytics tab is inconsistent: says Power BI is "temporarily disabled" and also "Integration Active" in `src/components/admin/dashboard.tsx`.

- **Cashier/POS flow**
  - Login + POS UI + transaction submit path exists.
  - Backend consistency risk is high because transaction code uses `orders/order_items/payments` in `src/app/api/transactions/route.ts`, while one schema source uses `transactions/transaction_items`.

- **Products**
  - Listing/creation/edit/delete UI exists in `src/app/inventory/page.tsx`.
  - Contract mismatch on update: UI sends `stock`, but `PUT /api/products/[id]` reads `stock_quantity` (`src/app/api/products/[id]/route.ts`), which can break stock updates.
  - Category delete mismatch: UI calls `DELETE /api/categories?id=...` but API expects JSON body `{ id }` (`src/app/api/categories/route.ts`).

- **Customers**
  - Customer pages and APIs exist.
  - Two customer APIs are not aligned:
    - `src/app/api/customers/route.ts` uses store-scoped auth rules and UUID-style assumptions.
    - `src/app/api/customers/[id]/route.ts` has no auth checks and uses different table/column assumptions (`transactions.total_amount`, `loyalty_points`).

- **Transactions / invoices**
  - Transactions page + invoices page + APIs exist.
  - Runtime behavior depends on which schema was actually provisioned; code and SQL definitions diverge.

- **Reports / analytics**
  - Reporting API exists (`src/app/api/reports/route.ts`), used by dashboard.
  - `src/app/reports/page.tsx` is largely placeholder/static text and not demo-grade analytics.

- **Broken or high-risk paths (likely failures depending on DB state)**
  - `POST /api/transactions` against DBs built from `docker/init.sql` (table naming/columns mismatch).
  - Category delete from inventory page due to request shape mismatch.
  - Customer update/delete by ID can bypass expected auth/store boundaries.

## What is missing

- **Single source of truth for database schema** (currently split across `docker/init.sql`, `src/db/schema.sql`, `src/db/schema.ts`, migrations, and API assumptions).
- **Unified auth flow** (currently multiple parallel systems: Auth0 routes + local login + cashier-simple variants).
- **Consistent authorization policy across all `[id]` routes** (store scoping and role checks are not uniformly enforced).
- **Production-ready Reports page** (currently placeholder-heavy and not powered by a clear API contract).
- **Clear API contract standard** (response shape and request body conventions vary by route, causing fragile front-end integration).

## Top priorities

1. **Freeze and unify the DB contract first**  
   Decide one canonical schema and make APIs/pages match it exactly (table names, IDs, fields like `stock` vs `stock_quantity`, `orders` vs `transactions`).

2. **Patch front-end/API mismatches that currently break workflows**  
   Start with inventory/category requests and product stock update payloads.

3. **Enforce authorization on all entity-by-id routes**  
   Add consistent role + store checks to `customers/[id]`, `users/[id]`, and similar endpoints.

4. **Replace placeholder analytics with real, consistent reporting output**  
   Align `reports/page.tsx` and dashboard analytics messaging with actual backend behavior.

5. **Auth cleanup hardening (post-runtime-success)**  
   Auth0 runtime path is now working; next is to remove stale duplicate auth config/routes and standardize local cashier token contracts.

## Recommended coding order

1. **Schema alignment pass (no broad refactor, just contract corrections)**
   - Pick canonical schema file.
   - Update API queries for transactions/products/customers to match it.
   - Remove or clearly mark legacy schema files as deprecated.

2. **Patch critical UI/API contract bugs**
   - Inventory product update payload (`stock` vs `stock_quantity`) between `src/app/inventory/page.tsx` and `src/app/api/products/[id]/route.ts`.
   - Category delete request shape between `src/app/inventory/page.tsx` and `src/app/api/categories/route.ts`.
   - Any mismatched response shape consumed by admin/POS pages.

3. **Secure route-level authorization**
   - Add auth/role/store checks to `src/app/api/customers/[id]/route.ts`.
   - Add auth/role/store checks to `src/app/api/users/[id]/route.ts`.
   - Ensure each route enforces the same policy as its collection route.

4. **Finish reports for demo**
   - Replace static placeholders in `src/app/reports/page.tsx`.
   - Keep `src/components/admin/dashboard.tsx` analytics messaging accurate and non-contradictory.

5. **Auth cleanup pass (safe, narrow)**
   - Keep canonical admin auth handler in `src/app/api/auth/[auth0]/route.ts`.
   - Retire stale duplicate auth config files once references are confirmed unused.
   - Keep cashier auth unchanged until DB/API stabilization is complete.

## Risks if left unchanged

- **Demo instability**: checkout, reporting, or CRUD flows can fail unpredictably based on DB state and which auth path is used.
- **Security risk**: some ID-based routes can be called without proper role/store protections.
- **Team confusion and slow progress**: duplicate auth/schema files make every new feature harder and risk regressions.
- **Inconsistent UX**: users may see contradictory analytics status and inconsistent behavior between pages.
- **Harder final polish**: postponing contract fixes will multiply rework in every domain (products, customers, transactions, reports).
