import { initAuth0 } from '@auth0/nextjs-auth0';

export const auth0Config = {
  secret: process.env.AUTH0_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/',
  },
  session: {
    rollingDuration: 60 * 60 * 24, // 24 hours
    absoluteDuration: 60 * 60 * 24 * 7, // 7 days
    autoSave: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    }
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
  },
  clientAuthMethod: 'none',
  idTokenSigningAlg: 'RS256',
  idTokenLifetime: 3600,
  clockTolerance: 10,
  tokenEndpointAuthMethod: 'none',
  clientAssertionSigningAlg: 'RS256',
  clientAssertionSigningKey: process.env.AUTH0_SECRET,
}; 