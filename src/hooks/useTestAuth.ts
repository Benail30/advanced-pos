'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface TestSession {
  user: {
    sub: string;
    email: string;
    name: string;
    'https://advanced-pos.com/roles': string[];
  };
}

interface AuthUser {
  sub?: string;
  email?: string;
  name?: string;
  'https://advanced-pos.com/roles'?: string[];
}

export function useTestAuth() {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const [testUser, setTestUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for test session in localStorage
    const testSession = localStorage.getItem('test_session');
    if (testSession) {
      try {
        const session: TestSession = JSON.parse(testSession);
        setTestUser(session.user);
      } catch (error) {
        console.error('Error parsing test session:', error);
        localStorage.removeItem('test_session');
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('test_session');
    setTestUser(null);
    if (auth0User) {
      window.location.href = '/api/auth/logout';
    } else {
      window.location.href = '/login';
    }
  };

  // Return Auth0 user if available, otherwise test user
  const user = auth0User || testUser;
  const loading = auth0Loading || isLoading;

  return {
    user,
    isLoading: loading,
    logout,
    isTestMode: !!testUser && !auth0User
  };
} 