'use client';

import { ReactNode } from 'react';
import AuthenticatedLayout from '@/components/layouts/authenticated-layout';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

interface PosLayoutProps {
  children: ReactNode;
}

export default function PosLayout({ children }: PosLayoutProps) {
  return (
    <AuthenticatedLayout>
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col md:ml-64">
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 