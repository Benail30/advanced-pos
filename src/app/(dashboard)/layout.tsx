import { ReactNode } from 'react';
import { Header } from '@/components/layouts/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 