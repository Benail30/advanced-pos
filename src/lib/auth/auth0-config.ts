import { ConfigParameters } from '@auth0/nextjs-auth0';

if (!process.env.AUTH0_SECRET) {
  throw new Error('Missing AUTH0_SECRET environment variable');
}

if (!process.env.AUTH0_BASE_URL) {
  throw new Error('Missing AUTH0_BASE_URL environment variable');
}

if (!process.env.AUTH0_ISSUER_BASE_URL) {
  throw new Error('Missing AUTH0_ISSUER_BASE_URL environment variable');
}

if (!process.env.AUTH0_CLIENT_ID) {
  throw new Error('Missing AUTH0_CLIENT_ID environment variable');
}

if (!process.env.AUTH0_CLIENT_SECRET) {
  throw new Error('Missing AUTH0_CLIENT_SECRET environment variable');
}

export const auth0Config: ConfigParameters = {
  secret: process.env.AUTH0_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    postLogoutRedirect: '/'
  },
  session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  }
}; 