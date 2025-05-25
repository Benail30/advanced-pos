import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  // Create a safe version of env vars for display (hiding secrets)
  const envDebug = {
    NODE_ENV: process.env.NODE_ENV,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? '[SECRET]' : undefined,
    AUTH0_SECRET: process.env.AUTH0_SECRET ? '[SECRET]' : undefined,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    NEXT_PUBLIC_AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
    NEXT_PUBLIC_AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
    NEXT_PUBLIC_AUTH0_CALLBACK_URL: process.env.NEXT_PUBLIC_AUTH0_CALLBACK_URL,
  };

  // Get cookies and session info
  const cookies = {
    names: Array.from(req.cookies.getAll()).map(c => c.name),
    auth_session: req.cookies.get('auth_session') ? 'present' : 'missing',
    auth_state: req.cookies.get('auth_state') ? 'present' : 'missing',
    auth_returnTo: req.cookies.get('auth_returnTo') ? 'present' : 'missing',
  };

  // Try to decode session if present
  let session = null;
  const sessionCookie = req.cookies.get('auth_session')?.value;
  if (sessionCookie && process.env.AUTH0_SECRET) {
    try {
      session = {
        valid: true,
        decoded: jwt.verify(sessionCookie, process.env.AUTH0_SECRET)
      };
    } catch (error) {
      session = {
        valid: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  return NextResponse.json({ 
    message: 'Environment Debug Info',
    env: envDebug,
    cookies,
    session,
    dotenv: {
      path: require.resolve('dotenv'),
      loaded: !!process.env.AUTH0_ISSUER_BASE_URL,
    }
  });
} 