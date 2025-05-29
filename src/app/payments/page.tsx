'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to transactions since payment info is available there
    router.push('/transactions');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting to Transactions</h1>
        <p className="text-gray-600 mb-4">Payment information is available in the transactions history...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
} 