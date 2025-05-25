export default {
  // Base Auth0 Config
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  
  // Auth0 Routes
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  
  // Auth0 Session Management
  session: {
    absoluteDuration: parseInt(process.env.AUTH0_SESSION_DURATION || '24') * 60 * 60,
    cookie: {
      domain: process.env.AUTH0_COOKIE_DOMAIN || undefined,
      path: '/',
      transient: false,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  },
  
  // Auth0 Authorization Parameters
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE || process.env.AUTH0_ISSUER_BASE_URL,
    prompt: 'login',
  },
} 