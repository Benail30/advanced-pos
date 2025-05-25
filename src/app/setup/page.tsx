'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const runSetup = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // First check database connection
      const connectionResult = await axios.get('/api/debug/db');
      
      if (!connectionResult.data.connected) {
        setError(`Database connection failed: ${connectionResult.data.error || 'Unknown error'}`);
        setIsLoading(false);
        return;
      }
      
      // Run setup
      const setupResult = await axios.post('/api/setup');
      setSuccess(setupResult.data.message);
      setData(setupResult.data.data);
    } catch (err: any) {
      console.error('Setup failed:', err);
      setError(err.response?.data?.error || err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-6">POS System Setup</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="text-lg font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            <h3 className="text-lg font-semibold">Success</h3>
            <p>{success}</p>
            
            {data && (
              <div className="mt-2">
                <p className="font-medium">Setup complete with:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Store: {data.store.name}</li>
                  <li>Categories: {data.categories}</li>
                  <li>Products: {data.products}</li>
                  <li>Customers: {data.customers}</li>
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-gray-600">
            This will set up your database with initial sample data including products, categories, and customers.
          </p>
          
          <button
            onClick={runSetup}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 focus:outline-none'
            }`}
          >
            {isLoading ? 'Setting up...' : 'Setup Database'}
          </button>
          
          {success && (
            <Link 
              href="/pos/register"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
            >
              Go to POS System
            </Link>
          )}
          
          <Link 
            href="/debug/db"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Check Database Connection
          </Link>
        </div>
      </div>
    </div>
  );
} 