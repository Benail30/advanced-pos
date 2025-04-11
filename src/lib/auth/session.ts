import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export async function getSessionUser(req: NextRequest) {
  const session = await getSession(req);
  return session?.user;
}

export async function isAuthenticated(req: NextRequest) {
  const session = await getSession(req);
  return !!session?.user;
}

export async function getUserRoles(req: NextRequest) {
  const session = await getSession(req);
  return session?.user?.['https://pos.example.com/roles'] || [];
} 