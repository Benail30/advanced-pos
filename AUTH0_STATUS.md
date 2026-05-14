# AUTH0 Status

## 1. Goal
Enable real runtime Auth0 for admin login/signup/logout while keeping current canonical routes and avoiding a full auth rewrite.

## 2. Canonical admin routes
- Login: `/api/auth/login`
- Signup: `/api/auth/login?screen_hint=signup`
- Logout: `/api/auth/logout`

## 3. Required env vars
- `AUTH0_SECRET`
- `AUTH0_BASE_URL`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH_BYPASS` (must be `false` or removed for real Auth0)
- `NEXT_PUBLIC_AUTH_BYPASS` (must be `false` or removed for real Auth0)

## 4. Where env vars are used
- `src/lib/dev-auth.ts`
  - `hasAuth0Env()` checks required Auth0 envs.
  - `isExplicitAuthBypassEnabled` reads `AUTH_BYPASS` / `NEXT_PUBLIC_AUTH_BYPASS`.
- `src/app/api/auth/[auth0]/route.ts`
  - Enables real Auth0 handlers when Auth0 env is present and explicit bypass is disabled.
  - Routes signup via `screen_hint=signup`.
- `src/lib/auth.ts`
  - Validates Auth0 env and defines Auth0 route config.
- `src/lib/auth/auth0-config.ts`
  - Builds Auth0 config from `AUTH0_*` vars.
- `src/app/api/auth/[...auth0]/config.ts` and `src/app/api/auth/[...auth0]/auth.config.ts`
  - Additional config references (legacy/duplicate route family).

## 5. Files checked
- `src/app/api/auth/[auth0]/route.ts`
- `src/app/api/auth/[...auth0]/route.ts`
- `src/app/api/auth/[...auth0]/config.ts`
- `src/app/api/auth/[...auth0]/auth.config.ts`
- `src/lib/auth.ts`
- `src/lib/auth/auth0-config.ts`
- `src/lib/dev-auth.ts`
- `src/app/page.tsx`
- `src/app/auth/register/page.tsx`
- `.env.local`

## 6. Files changed
- `src/app/api/auth/[auth0]/route.ts`
- `src/lib/dev-auth.ts`
- `src/app/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/hooks/useAuth.ts`
- `src/components/auth/user-profile.tsx`
- `src/app/api/auth/[...auth0]/route.ts` (removed duplicate handler)

## 7. What works now
- Canonical admin route wiring is correct.
- Admin signup uses canonical signup hint route.
- Client routing no longer depends on server-only env checks (fix applied).
- Auth0 handler supports real login/signup/logout flow when env is present and explicit bypass is off.
- With current `.env.local`, `/api/auth/login` redirects to Auth0 `/authorize`.
- With current `.env.local`, `/api/auth/login?screen_hint=signup` redirects to Auth0 `/authorize` with signup hint.
- With current `.env.local`, `/api/auth/logout` returns expected Auth0 logout redirect behavior.
- Callback endpoint `/api/auth/callback` is active (returns expected state-cookie error when invoked directly without prior login request).

## 8. What still does not work
- End-to-end callback completion cannot be shell-verified without interactive browser login (human step required).
- Duplicate Auth0 config helper files still exist (`src/app/api/auth/[...auth0]/config.ts`, `src/app/api/auth/[...auth0]/auth.config.ts`, `src/lib/auth.ts`, `src/lib/auth/auth0-config.ts`) and can cause confusion even though routing is now canonical.

## 9. Next recommended step
Run final interactive confirmation in browser:
1) `/` -> Admin -> Log In, 2) complete Auth0 login, 3) confirm return to dashboard, 4) logout and verify return to `/`.

Then proceed to the next priority block: DB/API contract stabilization.
