import { getSession } from '@auth0/nextjs-auth0/edge';

export const auth0Config = {
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours
    rolling: true,
    rollingDuration: 60 * 60, // 1 hour
  },
};

export const getAuthSession = async () => {
  try {
    const session = await getSession();
    return session;
  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
}; 