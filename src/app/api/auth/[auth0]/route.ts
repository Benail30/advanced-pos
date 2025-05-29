import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const auth = handleAuth({
  login: handleLogin({
    authorizationParams: {
      prompt: 'login',  // Force login prompt even if session exists
      scope: 'openid profile email'
    }
  })
});

export async function GET(req: NextRequest, ctx: { params: { auth0: string[] } }) {
  return auth(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: { auth0: string[] } }) {
  return auth(req, ctx);
} 