'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Store,
  CreditCard,
  UserCircle,
  FileText
} from 'lucide-react';

const ADMIN_NAVIGATION = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Customers', href: '/customers', icon: UserCircle },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const CASHIER_NAVIGATION = [
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: UserCircle },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Auth0 for admins
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  
  // Local auth for cashiers
  const { user: localUser, isLoading: localLoading } = useAuth();

  const isLoading = auth0Loading || localLoading;
  
  // Determine user type and navigation
  const isAuth0User = !!auth0User;
  const isLocalUser = !!localUser;
  
  let navigation = CASHIER_NAVIGATION;
  let userType = 'Cashier';
  
  if (isAuth0User) {
    const userRoles = auth0User['https://advanced-pos.com/roles'] as string[] || [];
    const isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');
    if (isAdmin) {
      navigation = ADMIN_NAVIGATION;
      userType = 'Admin';
    }
  } else if (isLocalUser) {
    // Local users are always cashiers, but check if they have admin privileges
    if (localUser.role === 'admin' || localUser.role === 'manager') {
      navigation = ADMIN_NAVIGATION;
      userType = 'Admin'; // This shouldn't happen with our new restrictions
    } else {
      userType = 'Cashier';
    }
  }

  if (isLoading) {
    return (
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Advanced POS</span>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (!auth0User && !localUser) {
    return (
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Advanced POS</span>
            </div>
            <Link
              href="/login"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Store className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Advanced POS</span>
              <span className={cn(
                "ml-2 text-xs px-2 py-1 rounded",
                isAuth0User 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-green-100 text-green-800"
              )}>
                {isAuth0User ? 'Admin' : userType}
              </span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => {
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

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
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
          </div>
        </div>
      )}
    </nav>
  );
} 