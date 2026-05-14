# Login Flow Update Summary

## 1. Goal
Stabilize visible authentication entry points with canonical routes while keeping the existing mixed auth backend intact (no full auth rewrite).

## 2. Files changed
- `src/app/page.tsx`
- `src/app/cashier-login/page.tsx`
- `src/components/pos/navbar.tsx`
- `src/app/login/page.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/hooks/useAuth.ts`
- `src/lib/dev-auth.ts`
- `src/app/api/auth/[auth0]/route.ts`
- `src/components/auth/user-profile.tsx`

## 3. Exact routes/endpoints affected
- Admin login: `/api/auth/login`
- Admin signup: `/api/auth/login?screen_hint=signup`
- Admin logout: `/api/auth/logout`
- Cashier login page: `/cashier-login`
- Cashier login API: `/api/auth/cashier-simple`
- Cashier verify API: `/api/auth/cashier-simple-verify`
- Cashier logout API: `/api/auth/cashier-simple-logout`
- Legacy wrapper pages now redirect:
  - `/login` -> `/`
  - `/auth/login` -> `/cashier-login`
  - `/auth/register` -> canonical admin signup route (or bypass admin view)

## 4. What behavior changed
- First-page Admin buttons now prefer real Auth0 routes when Auth0 env is present and explicit bypass is not enabled.
- Admin signup button now uses Auth0 `screen_hint=signup`.
- Auth0 route handler now explicitly handles signup hint and keeps standard login prompt for normal login.
- Auth0 bypass is now tied to explicit bypass flag in the Auth0 handler (not implicit dev mode).
- Cashier logout redirect now returns to `/cashier-login` instead of `/login`.
- One unauthenticated profile button now points to `/` (single canonical entry page).

## 5. What was intentionally NOT changed
- No full rewrite of cashier auth backend.
- No cashier backend refactor (`cashier-simple` vs `cashier/*` still coexists).
- No broad auth architecture rewrite; canonical admin route kept stable.
- No unrelated API/domain refactors.

## 6. Remaining risks / next steps
- Auth0 runtime is now active with canonical admin routes and explicit bypass controls.
- Interactive browser confirmation is still required for final callback/session validation in real user flow.
- Next step: stabilize DB/API contracts (transactions schema mismatch, inventory/category request contract mismatches), then do auth config cleanup of stale helper files.
