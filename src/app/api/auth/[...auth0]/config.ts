import { NextApiRequest, NextApiResponse } from 'next';
import { HandlerError } from '@auth0/nextjs-auth0';

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

export const authOptions = {
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  },
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/'
  },
  session: {
    absoluteDuration: 24 * 60 * 60 // 24 hours
  }
};

export function handleError(
  req: NextApiRequest,
  res: NextApiResponse,
  error: HandlerError
): void {
  console.error(error);
  res.status(error.status || 500).end(error.message);
} 