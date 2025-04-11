module.exports = {
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
  },
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/',
  },
  session: {
    absoluteDuration: parseInt(process.env.AUTH0_SESSION_DURATION || '24') * 60 * 60,
  },
}; 