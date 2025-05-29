'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StoresPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard since stores management is not available
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Available</h1>
        <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
} 