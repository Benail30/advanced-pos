'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HomeIcon, ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  // Auto-redirect after countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Try to navigate to the POS page
      router.push('/pos');
    }
  }, [countdown, router]);
  
  // Check port and offer correct port option
  const [correctPort, setCorrectPort] = useState<string | null>(null);
  
  useEffect(() => {
    const currentUrl = window.location.href;
    if (currentUrl.includes(':3000/')) {
      setCorrectPort('3001');
    } else if (currentUrl.includes(':3001/')) {
      setCorrectPort('3000');
    }
  }, []);
  
  // Function to try alternative port
  const tryAlternativePort = () => {
    const currentUrl = window.location.href;
    const currentPort = currentUrl.includes(':3000/') ? '3000' : '3001';
    const alternativePort = currentPort === '3000' ? '3001' : '3000';
    
    const newUrl = currentUrl.replace(`:${currentPort}/`, `:${alternativePort}/`);
    window.location.href = newUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 py-6 px-4 sm:px-6 text-white">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-sm text-muted-foreground">We couldn&apos;t find the page you&apos;re looking for</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6 text-gray-600">
            <p>Auto-redirecting to POS dashboard in {countdown} seconds...</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Link 
              href="/"
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Return Home
            </Link>
            
            <Link 
              href="/pos"
              className="flex items-center justify-center px-4 py-2.5 border border-blue-600 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go to POS Dashboard
            </Link>
            
            {correctPort && (
              <button
                onClick={tryAlternativePort}
                className="md:col-span-2 flex items-center justify-center px-4 py-2.5 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              >
                <RefreshCwIcon className="h-5 w-5 mr-2" />
                Try port {correctPort} instead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 