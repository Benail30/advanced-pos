'use client';

import { useState } from 'react';
import { Bell, Search } from 'lucide-react';

interface AdminHeaderProps {
  user: any; // Using any to avoid complex type mapping with Auth0 user types
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.email?.[0] || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 