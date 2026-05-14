# BUG REPORT - Local Bypass Mode Audit

Scope: local development mode with `AUTH_BYPASS=true` / `NEXT_PUBLIC_AUTH_BYPASS=true`, startup via `npm run dev`, and primary route/API behavior checks.

---

## 1) Admin pages still depend on raw Auth0 state in bypass mode

- **Issue title:** Auth-bypassed sessions could not consistently access admin pages
- **File(s) involved:** `src/app/users/page.tsx`, `src/app/inventory/page.tsx`, `src/app/reports/page.tsx`
- **Why it matters:** In local bypass mode, these pages still used `useUser()` directly and could redirect or stall on unauthenticated Auth0 state, blocking core admin UI testing.
- **Recommended fix:** Use the same dev-bypass user strategy already used on the landing/dashboard (`isAuthBypassEnabled` + `mockAdminUser`) across admin-only pages.
- **Priority:** High
- **Status:** Mitigated with minimal patch.

---

## 2) Local auth hook returns no user in bypass mode

- **Issue title:** Bypass mode left `useAuth()` unauthenticated, causing avoidable page redirects
- **File(s) involved:** `src/hooks/useAuth.ts`
- **Why it matters:** Multiple pages use local auth (`useAuth`) for access checks. Returning `null` user in bypass mode causes inconsistent route behavior and unnecessary redirects.
- **Recommended fix:** In bypass mode, expose a deterministic mock local user and mark loading complete.
- **Priority:** High
- **Status:** Mitigated with minimal patch.

---

## 3) Data APIs remain unauthorized in bypass for JWT/Auth0-protected reads

- **Issue title:** UI loads, but many data requests return `401/403` without local credentials
- **File(s) involved:** `src/app/api/products/route.ts`, `src/app/api/categories/route.ts`, `src/app/api/customers/route.ts`, `src/app/api/transactions/route.ts`, `src/app/api/users/route.ts`, `src/app/api/invoices/route.ts` (plus related callers in `src/app/*`)
- **Why it matters:** Even with bypass enabled, dashboards/pages can appear empty because GET requests still enforce token/session checks and there is no bypass reader fallback for these endpoints.
- **Recommended fix:** Add **read-only** bypass behavior for local dev (e.g., return safe demo payloads when bypass is enabled and auth is absent), similar to the existing `/api/reports` fallback.
- **Priority:** High
- **Status:** Mitigated for key read routes in local demo mode.

---

## 4) Database dependency still blocks feature completeness locally

- **Issue title:** Core APIs fail without configured PostgreSQL connection
- **File(s) involved:** Most route handlers under `src/app/api/**` using `pg` pools
- **Why it matters:** Local bypass removes login friction, but most business features still require DB connectivity; otherwise users see empty/error states.
- **Recommended fix:** Keep current architecture; add consistent dev fallback strategy for critical read APIs (`products`, `categories`, `customers`, `transactions`, `invoices`, `users`) when DB env is missing.
- **Priority:** High
- **Status:** Partially mitigated (read/list flows). Still open for write flows and DB-backed mutations.

---

## 5) Authentication model fragmentation creates inconsistent behavior

- **Issue title:** Multiple overlapping auth routes/cookies create ambiguity and bugs
- **File(s) involved:** `src/app/api/auth/**`, `src/hooks/useAuth.ts`, `src/hooks/useCashierAuth.ts`, `src/hooks/useTestAuth.ts`
- **Why it matters:** Coexisting cookie/token conventions (`auth-token`, `cashier_token`, `auth_token`, `local_auth`) increase risk of route mismatch and unintended unauthorized results.
- **Recommended fix:** Standardize on one cashier token/cookie contract and one validation path; keep Auth0 admin path separate but explicit.
- **Priority:** Medium-High
- **Status:** Open

---

## 6) Schema/model drift across features

- **Issue title:** Mixed `orders` and `transactions` assumptions across code
- **File(s) involved:** `src/app/api/transactions/route.ts`, `src/app/api/reports/route.ts`, `src/app/api/powerbi/route.ts`, migration/schema folders under `src/db` and `src/lib/db`
- **Why it matters:** Local or deployed DB shape mismatches can break endpoints and produce partial functionality.
- **Recommended fix:** Declare canonical transactional schema and align all dependent routes; deprecate legacy naming.
- **Priority:** Medium-High
- **Status:** Open

---

## 7) README setup instructions are inconsistent with current scripts

- **Issue title:** Documented DB scripts are not available in current `package.json`
- **File(s) involved:** `README.md`, `package.json`
- **Why it matters:** New developers may fail setup by following commands that do not exist.
- **Recommended fix:** Update docs to match actual scripts or add missing scripts intentionally.
- **Priority:** Medium
- **Status:** Open

---

## Minimal fixes applied during this audit

1. Added bypass user behavior to `useAuth`:
   - `src/hooks/useAuth.ts`
2. Added bypass-aware admin user handling to:
   - `src/app/users/page.tsx`
   - `src/app/inventory/page.tsx`
   - `src/app/reports/page.tsx`

These are minimal, structure-preserving changes to improve local bypass stability without rewriting feature logic.

## Second-pass fixes for demo usability

1. Added read-only local demo fallbacks for key GET APIs:
   - `src/app/api/products/route.ts`
   - `src/app/api/categories/route.ts`
   - `src/app/api/customers/route.ts`
   - `src/app/api/transactions/route.ts`
   - `src/app/api/users/route.ts`
   - `src/app/api/invoices/route.ts`
2. Fallbacks return `success: true` with realistic demo payloads and `meta.source = "local-demo"`.
3. Verified main pages and endpoints return `200` in bypass mode:
   - `/users`, `/inventory`, `/customers`, `/transactions`, `/invoices`, `/pos`
   - Corresponding API list routes above.

## Third-pass fixes: cashier/POS local usability

1. Improved cashier entry clarity in bypass mode:
   - `src/app/cashier-login/page.tsx`
   - In local bypass mode, page now clearly states login is not required and provides a direct `Open Cashier POS` action.
   - If a bypass local cashier session already exists, it redirects directly to `/pos`.
2. Fixed POS data compatibility issues that could make cashier flow confusing:
   - `src/app/pos/page.tsx`
   - Product stock mapping now supports both `stock` and `stock_quantity`.
   - Customer display and sale notes now support both `{ first_name, last_name }` and `{ name }` shapes.
   - Customer info panel now safely handles missing fields.
3. Result:
   - `/pos` is directly reachable in local bypass mode.
   - Product list renders from local demo fallback data.
   - Cart interactions (add/remove/quantity/total) are usable for demo walkthrough.

---

## Quick blocker summary for local run

Top blockers still affecting full local usability:

1. Write/mutation APIs still require real auth/DB and are not demo-fallback enabled.
2. Auth fragmentation (`auth-token`, `cashier_token`, `auth_token`, `local_auth`) still increases inconsistency risk.
3. Schema drift (`orders` vs `transactions`) remains and can break non-demo flows.
4. Full checkout persistence (`POST /api/transactions`) may still fail without a real DB, so end-to-end sale completion is not guaranteed in DB-less demo mode.
