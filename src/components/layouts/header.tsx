'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Bell, Search } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/75">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Open menu</span>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-200">
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/dashboard"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Dashboard
            </Link>
            <Link
              href="/pos"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              POS
            </Link>
            <Link
              href="/dashboard/products"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Products
            </Link>
            <Link
              href="/dashboard/customers"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Customers
            </Link>
            <Link
              href="/dashboard/reports"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Reports
            </Link>
            <Link
              href="/dashboard/settings"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 