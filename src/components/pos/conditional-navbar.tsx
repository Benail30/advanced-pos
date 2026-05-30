'use client';

import { usePathname } from 'next/navigation';
import { Store } from 'lucide-react';

const NO_NAVBAR_PREFIXES = [
  '/pos',
  '/dashboard',
  '/inventory',
  '/orders',
  '/users',
  '/stores',
  '/settings',
  '/super-admin',
];

const NO_NAVBAR_EXACT = [
  '/login',
  '/register',
  '/cashier/login',
];

export default function ConditionalNavbar() {
  const pathname = usePathname();

  if (NO_NAVBAR_EXACT.includes(pathname)) return null;
  if (NO_NAVBAR_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

  // Home page and any other public route: show a minimal brand bar
  return (
    <header className="bg-purple-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <Store className="h-8 w-8 text-purple-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">Advanced POS</span>
        </div>
      </div>
    </header>
  );
}
