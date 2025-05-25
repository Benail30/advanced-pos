import { ReactNode } from 'react';
import { POSHeader } from '@/components/pos/pos-header';

export default function POSLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <POSHeader />
      <div className="flex">
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
} 