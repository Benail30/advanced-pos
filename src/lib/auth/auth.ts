import { getSession } from '@auth0/nextjs-auth0/client';

/**
 * Hook for checking if a user is logged in using Auth0
 * This should only be used in React components
 */
export function useAuth() {
  if (typeof window === 'undefined') {
    return {
      isLoggedIn: false,
      user: null,
      error: null
    };
  }

  try {
    const session = getSession();
    return {
      isLoggedIn: !!session?.user,
      user: session?.user || null,
      error: null
    };
  } catch (error) {
    console.error('Error in auth hook:', error);
    return {
      isLoggedIn: false,
      user: null,
      error
    };
  }
}

/**
 * Redirects to Auth0 login page
 */
export function login() {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    window.location.href = '/api/auth/login';
  } catch (error) {
    console.error('Error during login redirect:', error);
  }
}

/**
 * Logs out the user through Auth0
 */
export function logout() {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    window.location.href = '/api/auth/logout';
  } catch (error) {
    console.error('Error during logout:', error);
  }
}