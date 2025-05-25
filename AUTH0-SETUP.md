# Auth0 Setup Guide for Advanced POS System

## Error Diagnosis

You encountered the following error when trying to run the application:

```
LoginHandlerError: Login handler failed. CAUSE: Discovery requests failing for https://dev-1tvqgcijw2hz78zc.us.auth0.com, expected 200 OK, got: 404 Not Found
```

This error occurs because the Auth0 domain specified in your environment variables is either incorrect or no longer exists.

## Setting Up Auth0

### 1. Create an Auth0 Account

If you don't already have an Auth0 account, sign up at [https://auth0.com/](https://auth0.com/).

### 2. Create a New Application

1. Log in to your Auth0 dashboard
2. Navigate to "Applications" > "Applications"
3. Click "Create Application"
4. Name your application (e.g., "Advanced POS System")
5. Select "Regular Web Applications"
6. Click "Create"

### 3. Configure Application Settings

In your new application settings:

1. Note your **Domain**, **Client ID**, and **Client Secret**
2. Under "Application URIs" section, configure:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
3. Save Changes

### 4. Update Environment Variables

Update your `.env` file with the values from your Auth0 application:

```
AUTH0_SECRET="a-long-random-secure-string-for-cookie-encryption-min-32-chars-24680ABCDEF123456789"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://YOUR-TENANT-NAME.us.auth0.com"
AUTH0_CLIENT_ID="YOUR-CLIENT-ID"
AUTH0_CLIENT_SECRET="YOUR-CLIENT-SECRET"

# Next Auth Public Variables
NEXT_PUBLIC_AUTH0_DOMAIN="YOUR-TENANT-NAME.us.auth0.com"
NEXT_PUBLIC_AUTH0_CLIENT_ID="YOUR-CLIENT-ID"
NEXT_PUBLIC_AUTH0_CALLBACK_URL="http://localhost:3000/api/auth/callback"
NEXT_PUBLIC_AUTH0_LOGOUT_URL="http://localhost:3000"
```

Replace:
- `YOUR-TENANT-NAME.us.auth0.com` with your Auth0 domain
- `YOUR-CLIENT-ID` with your Auth0 client ID
- `YOUR-CLIENT-SECRET` with your Auth0 client secret

### 5. Restart Your Application

After updating the environment variables, restart your application:

```bash
npm run dev
```

## Troubleshooting

- **404 Not Found Error**: Ensure your Auth0 domain is correct and the tenant exists
- **Invalid Client Error**: Verify your client ID and client secret
- **Callback URL Error**: Make sure the callback URL in Auth0 settings matches the one in your environment variables

## Additional Resources

- [Auth0 Next.js SDK Documentation](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Auth0 React SDK Documentation](https://auth0.com/docs/libraries/auth0-react)
- [Auth0 Authentication API](https://auth0.com/docs/api/authentication)