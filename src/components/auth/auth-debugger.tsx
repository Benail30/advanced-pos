'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';

export default function AuthDebugger() {
  const { user, error, isLoading } = useUser();
  const [cookies, setCookies] = useState<string>('');
  const [networkRequests, setNetworkRequests] = useState<any[]>([]);
  
  useEffect(() => {
    // Get all cookies for debugging
    setCookies(document.cookie);
    
    // Listen for network requests if we have the Performance API
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
            .filter(entry => entry.entryType === 'resource')
            .map(entry => {
              const resourceEntry = entry as PerformanceResourceTiming;
              return {
                name: resourceEntry.name,
                duration: Math.round(resourceEntry.duration),
                startTime: new Date(performance.timeOrigin + resourceEntry.startTime).toISOString(),
                initiatorType: resourceEntry.initiatorType
              };
            })
            .filter(entry => entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest');
          
          if (entries.length > 0) {
            setNetworkRequests(prev => [...prev, ...entries]);
          }
        });
        
        observer.observe({ entryTypes: ['resource'] });
        return () => observer.disconnect();
      } catch (e) {
        console.error('Performance observer error:', e);
      }
    }
  }, []);
  
  const handleTestAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      const data = await res.json();
      console.log('Auth status:', data);
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Auth test error:', err);
      alert('Error testing auth: ' + String(err));
    }
  };
  
  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-3">Auth0 Debugging Panel</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Status:</h4>
          <div className="text-sm bg-gray-100 p-2 rounded">
            {isLoading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}
          </div>
        </div>
        
        {error && (
          <div>
            <h4 className="font-medium text-red-600">Error:</h4>
            <div className="text-sm bg-red-50 p-2 rounded border border-red-200">
              {error.message}
            </div>
          </div>
        )}
        
        {user && (
          <div>
            <h4 className="font-medium">User:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
        
        <div>
          <h4 className="font-medium">Cookies:</h4>
          <div className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
            {cookies || 'No cookies found'}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium">Recent Network Requests:</h4>
          <div className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {networkRequests.length > 0 ? (
              <ul className="list-disc pl-5">
                {networkRequests.slice(-10).map((req, i) => (
                  <li key={i} className="mb-1">
                    {req.name.split('?')[0]} - {req.duration}ms
                  </li>
                ))}
              </ul>
            ) : (
              'No network requests captured'
            )}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleTestAuth}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Test Auth API
          </button>
          
          <a 
            href="/api/auth/login"
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Login
          </a>
          
          <a 
            href="/api/auth/logout"
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  );
} 