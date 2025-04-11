import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';
import { db } from '../db';
import { users } from '../db/schema';

export async function getCurrentUser(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) return null;

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, session.user.email),
  });

  return user;
}

export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(req: NextRequest, role: string) {
  const user = await requireAuth(req);
  if (user.role !== role) {
    throw new Error('Forbidden');
  }
  return user;
} 