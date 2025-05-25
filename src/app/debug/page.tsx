'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DebugPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cookies, setCookies] = useState<{[key: string]: string}>({});
  const [destination, setDestination] = useState('/');
  const [localAuth, setLocalAuth] = useState(false);

  useEffect(() => {
    // Parse cookies
    const cookieObj: {[key: string]: string} = {};
    document.cookie.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      cookieObj[key] = value;
    });
    setCookies(cookieObj);

    // Check for destination in query params
    const dest = searchParams?.get('dest');
    if (dest) {
      setDestination(dest);
    }
  }, [searchParams]);

  // Create a local auth session to bypass Auth0
  const createLocalAuth = () => {
    // Set a cookie that will be checked by the auth middleware
    document.cookie = `auth_session=debug_token; path=/; max-age=86400`;
    setLocalAuth(true);
    // Reload the page to apply the cookie
    window.location.reload();
  };

  // Clear all auth cookies
  const clearAuth = () => {
    document.cookie = `auth_session=; path=/; max-age=0`;
    document.cookie = `appSession=; path=/; max-age=0`;
    document.cookie = `a0State=; path=/; max-age=0`;
    setLocalAuth(false);
    // Reload the page to apply the changes
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug Page</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
          <div className="p-4 bg-gray-100 rounded-md">
            <p>Auth Session Cookie Present: <span className="font-medium">{cookies['auth_session'] ? 'Yes' : 'No'}</span></p>
            <p>Auth0 Session Cookie Present: <span className="font-medium">{cookies['appSession'] ? 'Yes' : 'No'}</span></p>
          </div>
          
          <div className="mt-4 flex space-x-4">
            <button 
              onClick={createLocalAuth}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Create Debug Auth Session
            </button>
            
            <button 
              onClick={clearAuth}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Auth Cookies
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Navigation Options</h2>
          <div className="flex flex-col space-y-2">
            <Link href="/pos" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center">
              Go to POS
            </Link>
            <Link href="/admin" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center">
              Go to Admin
            </Link>
            <Link href="/login" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-center">
              Go to Login Page
            </Link>
          </div>
        </div>
        
        <div className="mb-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Cookies</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(cookies, null, 2)}
          </pre>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            This debug page can be used to break redirect loops and diagnose authentication issues.
          </p>
        </div>
      </div>
    </div>
  );
} 