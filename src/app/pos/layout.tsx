'use client';

import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/pos/navbar';

export default function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const { user: localUser, isLoading: localLoading } = useAuth();
  const router = useRouter();

  // Check if either authentication method has a user
  const isAuthenticated = !!(auth0User || localUser);
  const isLoading = auth0Loading || localLoading;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to cashier login instead of Auth0
      router.push('/cashier-login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 