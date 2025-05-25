// This file contains configuration for the client-side authentication
import { initAuth0 } from '@auth0/nextjs-auth0';

const auth0 = initAuth0({
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
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
  },
});

export default auth0;

// Helper function to check if a route is public
const publicRoutes = [
  '/',
  '/login',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/images',
  '/assets'
];

export function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path.startsWith(route));
}

// Environment variables
export const AUTH0_BASE_URL = process.env.AUTH0_BASE_URL || 'http://localhost:3000';
export const AUTH0_ISSUER_BASE_URL = process.env.AUTH0_ISSUER_BASE_URL || '';
export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
export const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';
export const AUTH0_SECRET = process.env.AUTH0_SECRET || '';

// Helper function to check if a user is an admin
export function isAdmin(email: string | undefined): boolean {
  return email === 'admin@example.com' || email === 'benalighassen30@gmail.com';
}

// Helper function to get user roles
export function getUserRoles(email: string | undefined): string[] {
  return isAdmin(email) ? ['admin'] : ['cashier'];
} 