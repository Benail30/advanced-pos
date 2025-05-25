// Simple client-side session management
import { getSession as getAuth0Session } from '@auth0/nextjs-auth0/client';

export function getSession() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const session = getAuth0Session();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Client-side versions of the server functions
export function getSessionUser() {
  const session = getSession();
  return session?.user;
}

export function isAuthenticated() {
  const session = getSession();
  return !!session?.user;
}

export function getUserRoles() {
  const session = getSession();
  return session?.user?.roles || [];
}