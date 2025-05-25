'use client';

import { useState, useEffect } from 'react';

export default function DatabaseDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  async function checkConnection() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/db');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      setConnectionStatus({
        success: false, 
        message: 'Error checking connection',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Debug Page</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Database Connection Status</h2>
          <div className={`p-4 rounded-md ${connectionStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`font-medium ${connectionStatus.success ? 'text-green-700' : 'text-red-700'}`}>
              {connectionStatus.message || 'Checking connection...'}
            </p>
            {connectionStatus.error && (
              <p className="mt-2 text-sm text-red-600">{connectionStatus.error}</p>
            )}
          </div>
          
          <button 
            onClick={checkConnection}
            disabled={isLoading}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Check Connection Again'}
          </button>
        </div>
        
        <div className="mb-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
            {`DATABASE_URL: ${process.env.NEXT_PUBLIC_DATABASE_URL || 'Not set publicly'}`}
          </pre>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            This debug page checks database connection and environment variables.
          </p>
        </div>
      </div>
    </div>
  );
} 