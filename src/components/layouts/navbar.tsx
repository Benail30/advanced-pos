'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChevronDown,
  Receipt,
  BarChart3,
  Menu,
  X,
  LogOut,
  Home,
  BarChart2
} from 'lucide-react';
import { UserProfile } from '../auth/user-profile';
import { useUser } from '@auth0/nextjs-auth0/client';

interface NavbarProps {
  roles?: string[];
}

// Admin navigation items
const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Transactions', href: '/admin/transactions', icon: Receipt },
  { name: 'Reports', href: '/admin/reports', icon: BarChart2 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

// Cashier navigation items
const cashierNavigation = [
  { name: 'POS Register', href: '/pos/register', icon: ShoppingCart },
  { name: 'Transactions', href: '/pos/transactions', icon: Receipt },
  { name: 'Customers', href: '/pos/customers', icon: Users },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || '/';
  const { user, isLoading } = useUser();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Get navigation items based on user role
  const navigation = user?.role === 'admin' ? adminNavigation : cashierNavigation;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/75">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced POS
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="block h-6 w-6" />
            ) : (
              <Menu className="block h-6 w-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>

            <UserProfile />
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-base font-medium ${
                      isActive
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 