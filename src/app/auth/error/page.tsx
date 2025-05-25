'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function AuthErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any existing session data
    const clearSession = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    };

    clearSession();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <ShoppingCart size={28} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Advanced POS</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-6">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Authentication Error
          </h2>
          
          <p className="text-gray-600 mb-8">
            There was a problem with your authentication. Please try signing in again.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center space-x-2 bg-white text-gray-700 hover:text-indigo-600 font-medium py-3 px-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors duration-300"
            >
              <ArrowLeft size={16} />
              <span>Return to Home</span>
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          © 2024 Advanced POS System. All rights reserved.
        </div>
      </div>
    </div>
  );
} 