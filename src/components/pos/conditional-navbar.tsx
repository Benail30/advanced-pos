'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from './navbar';
import { Store } from 'lucide-react';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/' && !session) {
    return (
      <header className="bg-purple-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Advanced POS</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (pathname.startsWith('/pos')) return null;

  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/cashier/login' ||
    pathname === '/cashier-login' ||
    pathname === '/auth/login' ||
    pathname === '/auth/register' ||
    pathname === '/super-admin/login'
  ) {
    return null;
  }

  if (pathname.startsWith('/super-admin')) return null;

  const adminRoutes = ['/dashboard', '/inventory', '/orders', '/users', '/stores', '/settings'];
  if (adminRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return null;
  }

  return <Navbar />;
}
