'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Users, ShoppingCart, BarChart2, Settings } from 'lucide-react';
import { UserProfile } from '../auth/user-profile';
import { useUser } from '@auth0/nextjs-auth0/client';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'POS', href: '/pos/register', icon: ShoppingCart },
  { name: 'Inventory', href: '/pos/inventory', icon: ShoppingCart },
  { name: 'Customers', href: '/pos/customers', icon: Users },
  { name: 'Reports', href: '/pos/reports', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Advanced POS</span>
              </Link>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      isActive 
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="mr-1 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Right side items */}
          <div className="flex items-center">
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <UserProfile />
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pt-2 pb-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-gray-200 pt-4 pb-3">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <UserProfile />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 