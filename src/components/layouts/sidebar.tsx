"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  BoxIcon, 
  BarChart3Icon, 
  SettingsIcon,
  LogOutIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Navigation items
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'POS', href: '/pos', icon: ShoppingCartIcon },
  { name: 'Products', href: '/dashboard/products', icon: BoxIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3Icon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:bg-background md:border-r">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Advanced POS</h1>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-md group',
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground w-full">
            <LogOutIcon className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 