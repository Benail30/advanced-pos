'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  Settings,
  Store,
  Wallet,
  LogOut,
  ShoppingCart,
  History,
} from 'lucide-react';

const CASHIER_NAVIGATION = [
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'History', href: '/pos/history', icon: History },
  { name: 'Settings', href: '/pos/settings', icon: Settings },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">Advanced POS</span>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded" />
          </div>
        </div>
      </nav>
    );
  }

  if (!session) return null;

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo — links back to /pos */}
          <div className="flex items-center">
            <Link href="/pos" className="flex-shrink-0 flex items-center gap-2 mr-6">
              <Store className="h-8 w-8 text-purple-600" />
              <Wallet className="h-5 w-5 text-purple-500" />
              <span className="text-xl font-bold text-gray-900">Advanced POS</span>
              <span className="text-xs px-2 py-1 rounded border bg-green-100 text-green-800 border-green-200">
                Cashier
              </span>
            </Link>

            <div className="hidden md:flex md:space-x-8">
              {CASHIER_NAVIGATION.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors',
                      pathname === item.href
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-500">{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {CASHIER_NAVIGATION.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center pl-3 pr-4 py-2 text-base font-medium border-l-4 transition-colors',
                    pathname === item.href
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center pl-3 pr-4 py-2 w-full text-base font-medium border-l-4 border-transparent text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
