# Auth0 Local Test Guide

## Goal
Run real admin Auth0 login/signup/logout locally on `http://localhost:3000` using the canonical routes:
- Login: `/api/auth/login`
- Signup: `/api/auth/login?screen_hint=signup`
- Logout: `/api/auth/logout`

## 1) `.env.local` template (exact)

Replace your current bypass-only values with:

```env
# --- Auth0 runtime ---
AUTH0_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR_TENANT_DOMAIN.auth0.com
AUTH0_CLIENT_ID=REPLACE_WITH_AUTH0_APP_CLIENT_ID
AUTH0_CLIENT_SECRET=REPLACE_WITH_AUTH0_APP_CLIENT_SECRET

# --- Disable local auth bypass for real Auth0 testing ---
AUTH_BYPASS=false
NEXT_PUBLIC_AUTH_BYPASS=false
```

Notes:
- `AUTH0_SECRET` must be a long random string (32+ bytes recommended).
- `AUTH0_ISSUER_BASE_URL` must be your Auth0 tenant URL (no trailing slash preferred).
- Keep `AUTH0_BASE_URL` exactly `http://localhost:3000` for local testing.

## 2) What values you need from Auth0 dashboard

From **Auth0 Dashboard -> Applications -> Applications -> (your Regular Web App)**:
- `Domain` -> used as `AUTH0_ISSUER_BASE_URL` (`https://<domain>`)
- `Client ID` -> `AUTH0_CLIENT_ID`
- `Client Secret` -> `AUTH0_CLIENT_SECRET`

You also provide locally:
- `AUTH0_SECRET` (generate yourself; not copied from dashboard)
- `AUTH0_BASE_URL` (`http://localhost:3000`)

## 3) Required Auth0 application settings for localhost

In your Auth0 Application settings set:

- **Allowed Callback URLs**
  - `http://localhost:3000/api/auth/callback`

- **Allowed Logout URLs**
  - `http://localhost:3000`

- **Allowed Web Origins**
  - `http://localhost:3000`

- **Allowed Origins (CORS)** (recommended for stability)
  - `http://localhost:3000`

## 4) Code expectation check (already aligned)

Current code expects exactly this model:
- Dynamic Auth0 handler at `src/app/api/auth/[auth0]/route.ts` using `handleAuth()`
- Canonical login/signup/logout routes under `/api/auth/*`
- Callback route expected at `/api/auth/callback` (configured in project Auth0 config files)
- Explicit bypass flags (`AUTH_BYPASS`, `NEXT_PUBLIC_AUTH_BYPASS`) disable real Auth0 when true

## 5) Routes to test

After env update and dev server restart, test:
1. `http://localhost:3000/api/auth/login`
2. `http://localhost:3000/api/auth/login?screen_hint=signup`
3. `http://localhost:3000/api/auth/logout`
4. `http://localhost:3000/` -> choose **Admin** -> **Log In**
5. `http://localhost:3000/` -> choose **Admin** -> **Sign Up**

## 6) Expected behavior

- **Login route**
  - Redirects to Auth0 Universal Login.
  - After successful auth, returns to app (`/`), and admin session is established.

- **Signup route**
  - Redirects to Auth0 Universal Login with signup intent.
  - User can create account (if enabled), then returns through callback and session starts.

- **Logout route**
  - Clears app/Auth0 session and returns to `http://localhost:3000`.

## 7) Common failures and meaning

- **Immediate redirect back to `/` without Auth0 page**
  - Bypass still enabled (`AUTH_BYPASS` or `NEXT_PUBLIC_AUTH_BYPASS` true), or required Auth0 env missing.

- **Auth0 error: callback URL mismatch**
  - `Allowed Callback URLs` missing `http://localhost:3000/api/auth/callback`.

- **Auth0 error: logout URL not allowed**
  - `Allowed Logout URLs` missing `http://localhost:3000`.

- **Auth0 error: origin not allowed / silent auth issues**
  - `Allowed Web Origins` missing `http://localhost:3000`.

- **500/server error from `/api/auth/login`**
  - One or more `AUTH0_*` env vars invalid or typoed.

- **Signup link opens login screen only**
  - `screen_hint=signup` not honored by current Auth0 prompt/connection settings; flow still valid but signup UI policy is controlled by Auth0 tenant/application settings.
