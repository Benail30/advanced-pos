'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Auth0 signup without immediate dashboard redirect
    const signupUrl = `/api/auth/login?screen_hint=signup&prompt=login`;
    router.push(signupUrl);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Redirecting to signup...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we redirect you to the signup page.
          </p>
        </div>
      </div>
    </div>
  );
} 