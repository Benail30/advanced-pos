'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LockKeyhole, Mail, AlertCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/pos';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error parameters in URL
    const errorParam = searchParams.get('error');
    const errorDescParam = searchParams.get('error_description');
    
    if (errorParam) {
      setError(errorDescParam || 'An error occurred during authentication');
    }
  }, [searchParams]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loginUrl = new URL('/api/auth/login', window.location.origin);
      loginUrl.searchParams.set('returnTo', returnTo);
      
      // Add a small delay to ensure state updates are visible
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.location.href = loginUrl.toString();
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left panel with branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <ShoppingCart className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Advanced POS</h1>
          </div>
          <p className="text-blue-100 max-w-sm">
            A comprehensive point of sale system with Power BI analytics, inventory management, 
            and seamless transaction processing.
          </p>
        </div>
        
        <div>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <p className="text-lg font-medium mb-2">
              &quot;This POS system has transformed our business operations with its intuitive interface and powerful analytics.&quot;
            </p>
            <p className="text-sm text-blue-200">— Sarah Johnson, Store Manager</p>
          </div>
          
          <div className="mt-8 text-sm text-blue-200">
            © 2024 Advanced POS System. All rights reserved.
          </div>
        </div>
      </div>
      
      {/* Right panel with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-10">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced POS</h1>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
                <LockKeyhole className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Sign in to access the POS system
              </p>
            </div>
            
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/50 p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                  <p className="ml-3 text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    <span>Sign in with Auth0</span>
                  </>
                )}
              </button>
              
              <Link
                href="/"
                className="block w-full text-center py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 lg:hidden">
            © 2024 Advanced POS System
          </div>
        </div>
      </div>
    </div>
  );
} 