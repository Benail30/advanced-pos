'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    // Prevent redirection loops by tracking redirect attempts
    if (!isLoading && !redirectAttempted) {
      // If not authenticated, redirect to login
      if (!user) {
        console.log('No user found, redirecting to login');
        setRedirectAttempted(true);
        router.push('/api/auth/login?returnTo=/admin');
        return;
      }
      
      // Check if user has admin role based on email
      const isAdmin = user.email === 'admin@example.com' || user.email === 'benalighassen30@gmail.com';
      if (!isAdmin) {
        console.log('User is not admin, redirecting to POS');
        setRedirectAttempted(true);
        router.push('/pos');
      }
    }
  }, [user, isLoading, router, redirectAttempted]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Authentication Error</h2>
          <p className="text-gray-700">{error.message}</p>
          <button 
            onClick={() => {
              setRedirectAttempted(true);
              router.push('/api/auth/login');
            }}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // If we don't have a user or the user isn't an admin, show an appropriate message
  // rather than redirecting (which can cause loops)
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-blue-600">Authentication Required</h2>
          <p className="text-gray-700">Please log in to access the admin panel.</p>
          <button 
            onClick={() => {
              setRedirectAttempted(true);
              router.push('/api/auth/login?returnTo=/admin');
            }}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }
  
  // If user is not an admin, show a permission denied message
  if (user.email !== 'admin@example.com' && user.email !== 'benalighassen30@gmail.com') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Permission Denied</h2>
          <p className="text-gray-700">You don&apos;t have permission to access the admin panel.</p>
          <p className="mt-2 text-sm text-gray-500">Logged in as: {user.email}</p>
          <button 
            onClick={() => {
              setRedirectAttempted(true);
              router.push('/pos');
            }}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <p className="text-sm text-muted-foreground">Welcome to your store&apos;s admin panel</p>
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
} 