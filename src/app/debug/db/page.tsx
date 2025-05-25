"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function DatabaseDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    error?: string;
    details?: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/debug/db');
      setConnectionStatus(response.data);
    } catch (error: any) {
      console.error('Error checking database connection:', error);
      setConnectionStatus({
        connected: false,
        error: error.response?.data?.error || error.message || 'Failed to check connection'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Database Connection Status</h1>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Checking database connection...</p>
          </div>
        ) : connectionStatus ? (
          <>
            <div className={`p-4 mb-4 rounded-md ${connectionStatus.connected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-5 w-5 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">
                    {connectionStatus.connected ? 'Connected successfully' : 'Connection failed'}
                  </h3>
                  {connectionStatus.error && <p className="mt-1">{connectionStatus.error}</p>}
                </div>
              </div>
            </div>
            
            {connectionStatus.connected && connectionStatus.details && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Connection Details:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(connectionStatus.details, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Environment Variables:</h3>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm mb-1"><span className="font-medium">DATABASE_HOST:</span> {process.env.DATABASE_HOST || 'Not set'}</p>
                <p className="text-sm mb-1"><span className="font-medium">DATABASE_PORT:</span> {process.env.DATABASE_PORT || 'Not set'}</p>
                <p className="text-sm mb-1"><span className="font-medium">DATABASE_NAME:</span> {process.env.DATABASE_NAME || 'Not set'}</p>
                <p className="text-sm mb-1"><span className="font-medium">DATABASE_USER:</span> {process.env.DATABASE_USER || 'Not set'}</p>
                <p className="text-sm mb-1"><span className="font-medium">DATABASE_URL:</span> {process.env.DATABASE_URL ? '******' : 'Not set'}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-red-600 my-4">
            Failed to check database connection. Please try again.
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={checkConnection}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 focus:outline-none'
            }`}
          >
            {isLoading ? 'Checking...' : 'Check Connection Again'}
          </button>
          
          <Link
            href="/setup"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            Go to Setup
          </Link>
          
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 