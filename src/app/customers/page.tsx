'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function CustomersPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  
  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to the correct customers page
      router.push('/pos/customers');
    } else if (!isLoading && !user) {
      router.push('/api/auth/login?returnTo=/pos/customers');
    }
  }, [router, user, isLoading]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to customers...</p>
      </div>
    </div>
  );
} 