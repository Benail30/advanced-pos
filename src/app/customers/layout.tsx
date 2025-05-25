'use client';

import React from 'react';
import AuthenticatedLayout from '@/components/layouts/authenticated-layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </AuthenticatedLayout>
  );
} 