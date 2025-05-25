"use client";

import React from 'react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import Header from './header';
import Navbar from './navbar';
import { useUser } from '@auth0/nextjs-auth0/client';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user } = useUser();
  // Use the correct Auth0 roles claim namespace. Update this if your Auth0 tenant uses a different namespace.
  let roles = user?.['https://your-namespace/roles']; // e.g., 'https://myapp.example.com/roles'
  if (!Array.isArray(roles) || !roles.every((r: unknown) => typeof r === 'string')) roles = [];
  // roles should be ['admin'] or ['cashier']
  // roles is now string[]

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar roles={roles as string[]} />
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
} 