'use client';

import AuthDebugger from '@/components/auth/auth-debugger';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthDebugPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Link>
        
        <h1 className="text-2xl font-bold mt-4 mb-6">Auth0 Debug Page</h1>
        
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r">
          <p className="text-blue-800">
            This page helps diagnose Auth0 authentication issues. It displays your current auth status, cookies, and relevant network requests.
          </p>
        </div>
      </div>
      
      <AuthDebugger />
      
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Common Issues</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Missing cookies - Check that the appSession cookie is set</li>
            <li>Invalid tokens - Check Auth0 dashboard for token configuration</li>
            <li>Mismatched URLs - Ensure callback URLs match in Auth0 and environment variables</li>
            <li>CORS issues - Check browser console for cross-origin errors</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Authentication Flow</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>User clicks &quot;Login&quot; button</li>
            <li>Redirects to /api/auth/login</li>
            <li>Redirects to Auth0 login page</li>
            <li>After successful login, Auth0 redirects to /api/auth/callback</li>
            <li>Sets appSession cookie</li>
            <li>Redirects to dashboard or the returnTo path</li>
          </ol>
        </div>
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <p className="mb-4">
            Make sure these environment variables are correctly set in .env.local:
          </p>
          <pre className="bg-gray-800 text-gray-200 p-3 rounded text-xs overflow-auto">
            AUTH0_SECRET=****<br />
            AUTH0_BASE_URL=http://localhost:3000<br />
            AUTH0_ISSUER_BASE_URL=https://your-tenant.region.auth0.com<br />
            AUTH0_CLIENT_ID=****<br />
            AUTH0_CLIENT_SECRET=****<br />
          </pre>
        </div>
      </div>
    </div>
  );
} 