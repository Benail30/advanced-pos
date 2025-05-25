'use client';

import Link from 'next/link';
import { ShoppingCart, UserCircle, Lock, ArrowLeft, Settings, Database, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, error, isLoading: isUserLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams?.get('returnTo') || '/dashboard';
  const accessError = searchParams?.get('accessError');

  // Direct link to Auth0 login endpoint
  const loginWithAuth0 = () => {
    setIsLoading(true);
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const signupWithAuth0 = () => {
    setIsLoading(true);
    window.location.href = `/api/auth/login?screen_hint=signup&prompt=login`;
  };

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && !isUserLoading) {
      router.push(returnTo);
    }
  }, [user, isUserLoading, router, returnTo]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left panel with background image and branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center space-x-3">
            <ShoppingCart size={32} className="text-white" />
            <h1 className="text-2xl font-bold">Advanced POS</h1>
          </div>
          <p className="mt-6 text-indigo-200 max-w-sm">
            A comprehensive point of sale system with Power BI analytics, inventory management, 
            and seamless transaction processing.
          </p>
        </div>
        
        <div>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <p className="text-lg font-medium mb-2">
              &quot;This POS system has transformed our business operations with its intuitive interface and powerful analytics.&quot;
            </p>
            <p className="text-sm text-indigo-200">— Sarah Johnson, Store Manager</p>
          </div>
          
          <div className="mt-8 text-sm text-indigo-200">
            © 2024 Advanced POS System. All rights reserved.
          </div>
        </div>
      </div>
      
      {/* Right panel with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile logo (visible on small screens) */}
          <div className="lg:hidden flex items-center space-x-2 justify-center mb-10">
            <ShoppingCart size={28} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Advanced POS</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            {accessError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm">
                  Access denied. You don&apos;t have permission to access {accessError}.
                </p>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  {error.message || 'An error occurred during login. Please try again.'}
                </p>
              </div>
            )}
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                <UserCircle size={28} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome Back
              </h2>
              <p className="text-gray-600 mt-2">
                Sign in to access the POS system
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={loginWithAuth0}
                disabled={isLoading || isUserLoading}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Sign in with Auth0</span>
                  </>
                )}
              </button>

              <button
                onClick={signupWithAuth0}
                disabled={isLoading || isUserLoading}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
              >
                <UserPlus size={16} />
                <span>Create an Account</span>
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">System Options</span>
                </div>
              </div>
              
              <Link
                href="/setup"
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
              >
                <Settings size={16} />
                <span>Setup System</span>
              </Link>
              
              <Link
                href="/debug/db"
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
              >
                <Database size={16} />
                <span>Check Database Connection</span>
              </Link>
              
              <Link
                href="/"
                className="block w-full text-center py-3 px-4 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-300 flex items-center justify-center space-x-1"
              >
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500 lg:hidden">
            © 2024 Advanced POS System
          </div>
        </div>
      </div>
    </div>
  );
} 