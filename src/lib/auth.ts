import { getSession } from '@auth0/nextjs-auth0';

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

// Ensure URLs are properly formatted
const baseURL = new URL(process.env.AUTH0_BASE_URL).toString();
const issuerBaseURL = new URL(process.env.AUTH0_ISSUER_BASE_URL).toString();

export const authConfig = {
  baseURL,
  issuerBaseURL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout'
  }
};

export async function getAuthSession() {
  return getSession();
} 