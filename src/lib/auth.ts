import { getSession } from '@auth0/nextjs-auth0/client';

// Validate environment variables
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

// Format URLs correctly
const baseURL = new URL(process.env.AUTH0_BASE_URL).toString().replace(/\/$/, '');
const issuerBaseURL = new URL(process.env.AUTH0_ISSUER_BASE_URL).toString().replace(/\/$/, '');

// Export Auth0 configuration
export const authConfig = {
  issuerBaseURL,
  baseURL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout'
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  },
  session: {
    rollingDuration: 24 * 60 * 60, // 24 hours in seconds
    absoluteDuration: 7 * 24 * 60 * 60 // 7 days in seconds
  }
};

// Helper to get current user session
export async function getCurrentUser(req: any, res: any) {
  try {
    const session = await getSession(req, res);
    return session?.user || null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(session: any) {
  return !!session?.user;
}

// Check if user has specific role
export function hasRole(session: any, role: string) {
  return session?.user?.roles?.includes(role) || false;
} 