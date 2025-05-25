# Auth0 Setup for Advanced POS

This document explains how to set up Auth0 authentication for the Advanced POS system.

## 1. Environment Variables

Add the following to your `.env.local` file:

```
# Auth0 Configuration
AUTH0_SECRET='use-a-strong-random-secret-at-least-32-characters'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://dev-1tvqgcijw2hz78zc.eu.auth0.com'
AUTH0_CLIENT_ID='He7oY5WQrkdZbIXokiF3ef26uZ4UzYsc'
AUTH0_CLIENT_SECRET='your-client-secret-here'
AUTH0_AUDIENCE='https://dev-1tvqgcijw2hz78zc.eu.auth0.com/api/v2/'
AUTH0_SCOPE='openid profile email'
```

Make sure to:
1. Generate a strong random string for `AUTH0_SECRET` (at least 32 characters)
2. Set `AUTH0_BASE_URL` to your application's base URL
3. Get the other values from your Auth0 dashboard

## 2. Auth0 Dashboard Configuration

In your Auth0 dashboard, set up a new regular web application with the following settings:

### Application Settings
- **Name**: Advanced POS
- **Application Type**: Regular Web Application
- **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3000/login`
- **Allowed Web Origins**: `http://localhost:3000`
- **JWT Signature Algorithm**: RS256

### Advanced Settings
- Under **Grant Types**, ensure these are checked:
  - Authorization Code
  - Implicit
  - Refresh Token

## 3. User Roles

Auth0 users will be assigned roles based on their email addresses:
- Admin role: `admin@example.com` and `benalighassen30@gmail.com`
- Cashier role: All other email addresses

## 4. Testing the Authentication Flow

1. Clear your browser cookies
2. Visit the login page at `/login`
3. Click "Sign in with Auth0"
4. Log in with your credentials
5. You should be redirected to `/dashboard`
6. Test logout by clicking "Sign out" in the sidebar

## 5. Troubleshooting

If you experience issues:

1. Check your browser console for errors
2. Verify that cookies are being set correctly
   - Look for `appSession` cookie
3. Check the server logs for authentication errors
4. Make sure your Auth0 application settings match the environment variables

## 6. Important Files

These are the key files for Auth0 integration:

- `src/app/api/auth/[...auth0]/route.ts` - Auth0 API endpoints
- `src/lib/auth/auth0-config.ts` - Auth0 configuration
- `src/app/login/page.tsx` - Login page
- `src/middleware.ts` - Authentication middleware
- `src/lib/auth/role-guard.ts` - Role-based access control 