'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [counter, setCounter] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🎉 Application Test Page
          </h1>
          
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Advanced POS System Status: Working!</h2>
              <p className="text-green-700 mb-4">
                All components have been moved to the root level. Cashiers can now be created through the Users page or API.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-800">🔐 Real Authentication System</h3>
                  <p className="text-green-700">Email/password authentication is now active. Test users available:</p>
                  
                  <div className="mt-3 bg-white rounded-lg p-4 border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Email</th>
                          <th className="text-left py-2">Password</th>
                          <th className="text-left py-2">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1">admin@pos.com</td>
                          <td className="py-1">admin123</td>
                          <td className="py-1">Admin</td>
                        </tr>
                        <tr>
                          <td className="py-1">cashier@pos.com</td>
                          <td className="py-1">cashier123</td>
                          <td className="py-1">Cashier</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Link 
                      href="/login" 
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Test Login System
                    </Link>
                    <Link 
                      href="/users" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Manage Users
                    </Link>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-green-800">📱 Application Features</h3>
                  <ul className="text-green-700 space-y-1 mt-2">
                    <li>• Real user authentication with email/password</li>
                    <li>• Role-based access control (Admin/Cashier)</li>
                    <li>• User management with password creation</li>
                    <li>• Secure JWT token authentication</li>
                    <li>• Complete POS functionality</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">
                🔧 Interactive Test
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCounter(c => c + 1)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Count: {counter}
                </button>
                <span className="text-blue-700">Click to test React state management</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-amber-800 mb-3">
                🔐 Page Access Status
              </h2>
              <p className="text-amber-700 mb-3">
                All pages are now accessible with clean navigation! No more "page inside a page" issue:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/inventory" className="text-green-600 hover:text-green-800 underline font-medium">
                  ✅ Inventory
                </Link>
                <Link href="/users" className="text-green-600 hover:text-green-800 underline font-medium">
                  ✅ Users
                </Link>
                <Link href="/customers" className="text-green-600 hover:text-green-800 underline font-medium">
                  ✅ Customers
                </Link>
                <Link href="/transactions" className="text-green-600 hover:text-green-800 underline font-medium">
                  ✅ Transactions
                </Link>
                <Link href="/pos" className="text-green-600 hover:text-green-800 underline font-medium">
                  ✅ POS
                </Link>
                <Link href="/reports" className="text-blue-600 hover:text-blue-800 underline">
                  Reports
                </Link>
                <Link href="/settings" className="text-blue-600 hover:text-blue-800 underline">
                  Settings
                </Link>
                <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
                  Dashboard
                </Link>
              </div>
              <p className="text-amber-600 text-xs mt-3">
                ✅ = Fixed navigation | Regular = Still requires authentication
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                📋 Summary of Changes
              </h2>
              <ul className="text-gray-700 space-y-2">
                <li>✅ Moved all admin pages to root level (removed /admin prefix)</li>
                <li>✅ Updated navigation to reflect new paths</li>
                <li>✅ Fixed all TypeScript build errors</li>
                <li>✅ Removed problematic middleware</li>
                <li>✅ Cleaned up unused components and APIs</li>
                <li>✅ Each page now handles its own authentication</li>
                <li>✅ Build process completes successfully</li>
                <li>✅ <strong>FIXED: Removed duplicate navigation bars</strong></li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-3">
                🎯 Navigation Fix Details
              </h2>
              <p className="text-purple-700 mb-2">
                <strong>Problem:</strong> Inventory page had duplicate navigation - one from main layout and one embedded in the page.
              </p>
              <p className="text-purple-700 mb-2">
                <strong>Solution:</strong> Removed the embedded navigation from inventory page, kept only the main layout navigation.
              </p>
              <p className="text-purple-600 text-sm">
                <strong>Result:</strong> Clean, single navigation bar with proper styling and no "page inside a page" effect.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-3">
                👥 Cashier Creation Success
              </h2>
              <p className="text-purple-700 mb-2">
                <strong>Cashiers Created:</strong> Successfully created 2 test cashiers in the system.
              </p>
              <ul className="text-purple-600 text-sm space-y-1">
                <li>• John Cashier (john@cashier.com)</li>
                <li>• Jane Cashier (jane@test.com)</li>
              </ul>
              <p className="text-purple-600 text-sm mt-2">
                <strong>How to create more:</strong> Use the Users page "Add User" button or the API endpoint POST /api/users
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-3">
                🔐 Authentication System
              </h2>
              <p className="text-purple-700 mb-2">
                <strong>Problem Solved:</strong> Cashiers can now login without passwords!
              </p>
              <div className="space-y-2 mb-3">
                <p className="text-purple-600 text-sm">
                  <strong>Available Test Users:</strong>
                </p>
                <ul className="text-purple-600 text-sm space-y-1 ml-4">
                  <li>• <strong>Jane Updated</strong> (jane@test.com) - Manager</li>
                  <li>• <strong>John Cashier</strong> (john@cashier.com) - Cashier</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Link 
                  href="/login"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  🔑 Test Login System
                </Link>
                <Link 
                  href="/users"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  👥 Manage Users
                </Link>
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/api/auth/login"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
              >
                🔑 Login to Access Admin Features
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}